import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, DollarSign, Search, X } from 'lucide-react'
import { serviceService } from '../services/dataService'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '../utils/currency'

const Services = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [selectedService, setSelectedService] = useState(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const data = await serviceService.getAll()
      setServices(data.data || [])
    } catch (error) {
      toast.error('Unable to load service list')
    } finally {
      setLoading(false)
    }
  }

  const categories = ['All', ...new Set(services.map(s => s.category))]
  
  const filteredServices = services.filter(service => {
    // Category filter
    const categoryMatch = selectedCategory === 'All' || service.category === selectedCategory
    
    // Search filter
    const searchMatch = !searchTerm || 
      service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Price range filter
    const price = parseInt(service.price)
    const minPrice = priceRange.min ? parseInt(priceRange.min) : 0
    const maxPrice = priceRange.max ? parseInt(priceRange.max) : Infinity
    const priceMatch = price >= minPrice && price <= maxPrice
    
    return categoryMatch && searchMatch && priceMatch
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader-zen"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      {/* Header */}
      <section className="section-zen bg-gradient-to-r from-zen-700 to-zen-900 text-white">
        <div className="container-zen text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-zen font-bold mb-4"
          >
            Our Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl opacity-90 max-w-2xl mx-auto"
          >
            Experience professional beauty services with unique Zen style
          </motion.p>
        </div>
      </section>

      {/* Search and Filter */}
      <div className="container-zen py-8">
        {/* Search Bar */}
        <div className="mb-6 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zen-400" size={20} />
            <input
              type="text"
              placeholder="Search for services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-zen-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zen-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="mb-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="number"
                placeholder="Minimum Price"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-full px-4 py-2 border border-zen-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zen-500"
              />
            </div>
            <span className="text-zen-600">-</span>
            <div className="flex-1">
              <input
                type="number"
                placeholder="Maximum Price"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-full px-4 py-2 border border-zen-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zen-500"
              />
            </div>
            {(priceRange.min || priceRange.max) && (
              <button
                onClick={() => setPriceRange({ min: '', max: '' })}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              >
                Clear Price Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="container-zen pb-8">
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-zen-600 text-white shadow-lg'
                  : 'bg-white text-zen-700 hover:bg-zen-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="container-zen pb-20">
        {filteredServices.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-zen-600 font-zen">No services available</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedService(service)}
                className="card-zen group cursor-pointer"
              >
                {/* Image placeholder */}
                <div className="h-48 bg-gradient-to-br from-zen-200 to-zen-300 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  {service.image_url ? (
                    <img 
                      src={service.image_url} 
                      alt={service.service_name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML = '<span class="text-6xl">✨</span>'
                      }}
                    />
                  ) : (
                    <span className="text-6xl">✨</span>
                  )}
                </div>

                <h3 className="text-2xl font-zen font-semibold text-zen-800 mb-2 group-hover:text-zen-600 transition-colors">
                  {service.service_name}
                </h3>

                <div className="flex items-center justify-between text-zen-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock size={18} />
                    <span>{service.duration_minutes} mins</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign size={18} />
                    <span className="text-xl font-semibold text-zen-700">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-zen-100 flex items-center justify-between">
                  <span className="inline-block px-3 py-1 bg-zen-100 text-zen-700 rounded-full text-sm">
                    {service.category}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedService(service)
                    }}
                    className="px-3 py-1 text-sm bg-sage text-white rounded-full hover:bg-earth transition-colors"
                  >
                    Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedService(null)}
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
                  {selectedService.service_name}
                </h2>
                <button
                  onClick={() => setSelectedService(null)}
                  className="p-2 hover:bg-zen-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-zen-600" />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 py-6">
                {/* Service Image */}
                {selectedService.image_url && (
                  <div className="mb-6">
                    <img 
                      src={selectedService.image_url} 
                      alt={selectedService.service_name}
                      className="w-full h-auto rounded-lg object-cover"
                    />
                  </div>
                )}

                {/* Service Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zen-600">Service Price:</span>
                    <span className="text-3xl font-bold text-sage">
                      {formatCurrency(selectedService.price)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zen-600">Duration:</span>
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-zen-600" />
                      <span className="font-semibold text-zen-800">{selectedService.duration_minutes} mins</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zen-600">Category:</span>
                    <span className="px-3 py-1 bg-zen-100 text-zen-700 rounded-full">
                      {selectedService.category}
                    </span>
                  </div>

                  {selectedService.description && (
                    <div className="pt-4 border-t border-zen-200">
                      <h3 className="font-semibold text-zen-800 mb-2">Description:</h3>
                      <p className="text-zen-700 leading-relaxed">{selectedService.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-zen-200 px-8 py-6 bg-zen-50 flex gap-3">
                <button
                  onClick={() => setSelectedService(null)}
                  className="flex-1 px-4 py-3 border border-zen-300 text-zen-800 rounded-xl hover:bg-zen-100 transition-colors font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedService(null)
                    navigate('/booking')
                  }}
                  className="flex-1 bg-sage text-white py-3 rounded-xl font-semibold hover:bg-earth transition-colors flex items-center justify-center gap-2"
                >
                  Book Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Services
