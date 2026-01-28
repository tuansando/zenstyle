import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Package, X, Plus, Minus, Search, Tag } from 'lucide-react'
import { productService, orderService } from '../services/dataService'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { formatCurrency } from '../utils/currency'

const Products = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [ordering, setOrdering] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState(false)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll()
      setProducts(data.data || [])
    } catch (error) {
      toast.error('Unable to load product list')
    } finally {
      setLoading(false)
    }
  }

  const categories = ['All', ...new Set(products.map(p => p.category))]
  
  const filteredProducts = products.filter(product => {
    // Category filter
    const matchCategory = selectedCategory === 'All' || product.category === selectedCategory
    
    // Search filter
    const matchSearch = searchTerm === '' || 
      product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Price range filter
    const matchPrice = (
      (priceRange.min === '' || product.unit_price >= parseFloat(priceRange.min)) &&
      (priceRange.max === '' || product.unit_price <= parseFloat(priceRange.max))
    )
    
    return matchCategory && matchSearch && matchPrice
  })

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      if (existingItem.quantity >= product.stock_quantity) {
        toast.error('Not enough stock')
        return
      }
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
    toast.success('Added to cart')
  }

  const updateQuantity = (productId, change) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change
        if (newQuantity <= 0) return null
        if (newQuantity > item.stock_quantity) {
          toast.error('Not enough stock')
          return item
        }
        return { ...item, quantity: newQuantity }
      }
      return item
    }).filter(Boolean))
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.unit_price * item.quantity), 0)
  }

  const getFinalAmount = () => {
    const total = getTotalAmount()
    return total - couponDiscount
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter coupon code')
      return
    }

    setValidatingCoupon(true)
    try {
      const response = await orderService.validateCoupon({
        coupon_code: couponCode,
        total_amount: getTotalAmount()
      })
      
      setCouponDiscount(response.discount)
      setCouponApplied(true)
      toast.success(response.message)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code')
      setCouponDiscount(0)
      setCouponApplied(false)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const removeCoupon = () => {
    setCouponCode('')
    setCouponDiscount(0)
    setCouponApplied(false)
  }

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place an order')
      navigate('/login')
      return
    }

    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    setOrdering(true)
    try {
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.unit_price
        })),
        coupon_code: couponApplied ? couponCode : null
      }

      await orderService.create(orderData)
      toast.success('Order placed successfully!')
      setCart([])
      setCouponCode('')
      setCouponDiscount(0)
      setCouponApplied(false)
      setShowCart(false)
      navigate('/dashboard/client')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to place order')
    } finally {
      setOrdering(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader-zen"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      {/* Cart Button Fixed */}
      {cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-8 right-8 z-40 bg-sage text-white p-4 rounded-full shadow-2xl hover:bg-earth transition-all hover:scale-110"
        >
          <ShoppingCart size={24} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
            {cart.length}
          </span>
        </button>
      )}

      {/* Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              {/* Cart Header */}
              <div className="p-6 border-b border-zen-200 flex items-center justify-between">
                <h2 className="text-2xl font-zen font-bold text-zen-800">Your Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-zen-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart size={64} className="text-zen-300 mx-auto mb-4" />
                    <p className="text-zen-600">Cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-zen-50 rounded-xl">
                        <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={32} className="text-zen-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-zen-800">{item.product_name}</h3>
                          <p className="text-sage font-bold">{formatCurrency(item.unit_price)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 bg-white rounded-full hover:bg-zen-200 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-semibold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 bg-white rounded-full hover:bg-zen-200 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-zen-200 bg-zen-50 space-y-4">
                  {/* Coupon Code Section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-zen-700">
                      <Tag size={16} className="inline mr-2" />
                      Coupon Code
                    </label>
                    {!couponApplied ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="flex-1 px-3 py-2 border border-zen-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage"
                        />
                        <button
                          onClick={validateCoupon}
                          disabled={validatingCoupon}
                          className="px-4 py-2 bg-sage text-white rounded-lg hover:bg-earth transition-colors disabled:opacity-50"
                        >
                          {validatingCoupon ? 'Checking...' : 'Apply'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Tag size={18} className="text-green-600" />
                          <span className="font-semibold text-green-700">{couponCode}</span>
                          <span className="text-sm text-green-600">
                            - {formatCurrency(couponDiscount)} discount
                          </span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Price Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-zen-700">
                      <span>Subtotal:</span>
                      <span className="font-semibold">{formatCurrency(getTotalAmount())}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex items-center justify-between text-green-600">
                        <span>Discount:</span>
                        <span className="font-semibold">- {formatCurrency(couponDiscount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-zen-200">
                      <span className="text-lg font-semibold text-zen-800">Total:</span>
                      <span className="text-2xl font-bold text-sage">
                        {formatCurrency(getFinalAmount())}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={ordering}
                    className="w-full bg-sage text-white py-3 rounded-xl font-semibold hover:bg-earth transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ordering ? 'Processing...' : 'Place Order Now'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <section className="section-zen bg-gradient-to-r from-sage to-earth text-white">
        <div className="container-zen text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-zen font-bold mb-4"
          >
            Care Products
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl opacity-90 max-w-2xl mx-auto"
          >
            High-quality products from reputable brands
          </motion.p>
        </div>
      </section>

      {/* Search & Filter Section */}
      <div className="container-zen py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zen-400" size={20} />
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-zen-300 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent"
            />
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="mb-6 flex justify-center gap-4 flex-wrap">
          <input
            type="number"
            placeholder="Minimum Price"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            className="px-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent w-40"
          />
          <span className="self-center text-zen-600">-</span>
          <input
            type="number"
            placeholder="Maximum Price"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            className="px-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent w-40"
          />
          {(priceRange.min || priceRange.max) && (
            <button
              onClick={() => setPriceRange({ min: '', max: '' })}
              className="px-4 py-2 bg-zen-100 text-zen-700 rounded-lg hover:bg-zen-200"
            >
              Clear Price Filter
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-sage text-white shadow-lg'
                  : 'bg-white text-zen-700 hover:bg-zen-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="container-zen pb-20">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-zen-600 font-zen">No products available</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-zen group cursor-pointer"
              >
                {/* Image */}
                <div className="h-56 bg-gradient-to-br from-zen-100 to-stone rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.product_name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="text-zen-400" width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>'
                      }}
                    />
                  ) : (
                    <Package size={64} className="text-zen-400" />
                  )}
                </div>

                <h3 className="text-lg font-zen font-semibold text-zen-800 mb-2 group-hover:text-sage transition-colors">
                  {product.product_name}
                </h3>

                {product.description && (
                  <p className="text-sm text-zen-600 mb-3 line-clamp-2">{product.description}</p>
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-sage">
                    {formatCurrency(product.unit_price)}
                  </span>
                  <span className="text-sm text-zen-600">
                    Stock: {product.stock_quantity}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-zen-100">
                  <span className="text-xs px-2 py-1 bg-zen-100 text-zen-700 rounded-full flex-1 text-center">
                    {product.category}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedProduct(product)
                    }}
                    className="px-3 py-1 text-sm bg-zen-100 text-zen-700 rounded-full hover:bg-zen-200"
                  >
                    Details
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      addToCart(product)
                    }}
                    disabled={product.stock_quantity === 0}
                    className={`p-2 rounded-full transition-colors ${
                      product.stock_quantity === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-sage text-white hover:bg-earth'
                    }`}
                  >
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-zen-200 px-8 py-6 flex justify-between items-start">
                <h2 className="text-3xl font-zen font-bold text-zen-800">
                  {selectedProduct.product_name}
                </h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 hover:bg-zen-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-zen-600" />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 py-6">
                {/* Product Image */}
                {selectedProduct.image_url && (
                  <div className="mb-6">
                    <img 
                      src={selectedProduct.image_url} 
                      alt={selectedProduct.product_name}
                      className="w-full h-auto rounded-lg object-cover"
                    />
                  </div>
                )}

                {/* Product Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zen-600">Price:</span>
                    <span className="text-3xl font-bold text-sage">
                      {formatCurrency(selectedProduct.unit_price)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zen-600">Category:</span>
                    <span className="px-3 py-1 bg-zen-100 text-zen-700 rounded-full">
                      {selectedProduct.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zen-600">Status:</span>
                    <span className={`font-semibold ${selectedProduct.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedProduct.stock_quantity > 0 ? `${selectedProduct.stock_quantity} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  {selectedProduct.description && (
                    <div className="pt-4 border-t border-zen-200">
                      <h3 className="font-semibold text-zen-800 mb-2">Description:</h3>
                      <p className="text-zen-700 leading-relaxed">{selectedProduct.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-zen-200 px-8 py-6 bg-zen-50 flex gap-3">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 px-4 py-3 border border-zen-300 text-zen-800 rounded-xl hover:bg-zen-100 transition-colors font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    addToCart(selectedProduct)
                    setSelectedProduct(null)
                  }}
                  disabled={selectedProduct.stock_quantity === 0}
                  className="flex-1 bg-sage text-white py-3 rounded-xl font-semibold hover:bg-earth transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Products
