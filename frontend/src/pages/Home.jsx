import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
    Sparkles,
    Award,
    Users,
    Clock,
    Newspaper,
    Calendar,
    X,
    ShoppingCart,
    Scissors,
    ShoppingBag,
} from "lucide-react";
import {
    serviceService,
    productService,
    blogService,
} from "../services/dataService";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { formatCurrency } from "../utils/currency";

const Home = () => {
    const [services, setServices] = useState([]);
    const [products, setProducts] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [servicesData, productsData, blogsData] = await Promise.all([
                serviceService.getAll(),
                productService.getAll(),
                blogService.getPublished(),
            ]);
            setServices(servicesData.data || servicesData || []);
            setProducts(productsData.data || productsData || []);
            setBlogs(blogsData.data || blogsData || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Unable to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleOrderProduct = (product) => {
        if (product.stock_quantity <= 0) {
            toast.error("Product is out of stock");
            return;
        }

        // Save product to localStorage to use on products page
        const orderItem = {
            id: product.id,
            product_name: product.product_name,
            unit_price: product.unit_price,
            image: product.image,
            stock_quantity: product.stock_quantity,
            quantity: 1,
        };

        localStorage.setItem("pendingOrder", JSON.stringify(orderItem));
        toast.success("Product added! Redirecting to order page...");

        // Close modal and redirect to products page to order
        setSelectedProduct(null);
        window.location.href = "/products";
    };

    const features = [
        {
            icon: <Sparkles className="w-12 h-12" />,
            title: "Professional",
            description: "Experienced and well-trained stylists",
        },
        {
            icon: <Award className="w-12 h-12" />,
            title: "High Quality",
            description: "International standard products and services",
        },
        {
            icon: <Users className="w-12 h-12" />,
            title: "Dedicated",
            description: "Attentive and thoughtful service for every customer",
        },
        {
            icon: <Clock className="w-12 h-12" />,
            title: "Flexible",
            description: "Easy booking with flexible service hours",
        },
    ];

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-zen-50 to-stone overflow-hidden">
                {/* Decorative circles */}
                <div className="zen-circle top-10 left-10"></div>
                <div className="zen-circle bottom-20 right-20"></div>

                <div className="container-zen relative z-10">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-6xl md:text-7xl font-zen font-bold mb-6 leading-tight">
                                <span className="text-gradient-zen">
                                    ZenStyle
                                </span>
                                <br />
                                <span className="text-zen-800">
                                    Salon & Spa
                                </span>
                            </h1>
                            <p className="text-xl text-zen-700 mb-8 leading-relaxed">
                                Zen-style beauty space where you find balance
                                between outer beauty and inner peace.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/booking" className="btn-zen">
                                    Book Now
                                </Link>
                                <Link
                                    to="/services"
                                    className="btn-zen-outline"
                                >
                                    View Services
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative flex justify-center"
                        >
                            <img
                                src="http://127.0.0.1:8000/images/zen-logo.png"
                                alt="ZenStyle Salon - Zen Style"
                                className="w-full max-w-md h-auto object-contain animate-float drop-shadow-2xl"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="section-zen bg-white">
                <div className="container-zen">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-zen font-bold text-zen-800 mb-4">
                            Why Choose Us?
                        </h2>
                        <div className="divider-zen"></div>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.1,
                                }}
                                viewport={{ once: true }}
                                className="card-zen text-center group hover:bg-zen-50"
                            >
                                <div className="text-zen-600 mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-zen font-semibold text-zen-800 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-zen-600">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Preview */}
            <section className="section-zen bg-gradient-to-b from-zen-50 to-cream">
                <div className="container-zen">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-zen font-bold text-zen-800 mb-4">
                            Featured Services
                        </h2>
                        <div className="divider-zen"></div>
                        <p className="text-xl text-zen-600 max-w-2xl mx-auto">
                            Experience premium beauty services with unique Zen
                            style
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {loading ? (
                            <div className="col-span-3 text-center py-8">
                                <div className="loader-zen"></div>
                            </div>
                        ) : services.length > 0 ? (
                            services.slice(0, 3).map((service, index) => (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1,
                                    }}
                                    viewport={{ once: true }}
                                    onClick={() => setSelectedService(service)}
                                    className="card-zen text-center group cursor-pointer hover:shadow-xl transition-all duration-300"
                                >
                                    {service.image_url && (
                                        <div className="mb-4 overflow-hidden rounded-lg">
                                            <img
                                                src={service.image_url}
                                                alt={service.service_name}
                                                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                    {!service.image_url && (
                                        <div className="text-6xl mb-4">
                                            {service.category === "Hair"
                                                ? "✂️"
                                                : service.category === "Spa"
                                                  ? "💆‍♀️"
                                                  : service.category === "Nail"
                                                    ? "💅"
                                                    : "🎨"}
                                        </div>
                                    )}
                                    <h3 className="text-2xl font-zen font-semibold text-zen-800 mb-2">
                                        {service.service_name}
                                    </h3>
                                    <p className="text-zen-600 text-sm mb-2">
                                        {service.category}
                                    </p>
                                    <p className="text-zen-600 text-lg mb-2">
                                        {formatCurrency(service.price)}
                                    </p>
                                    <p className="text-zen-500 text-sm mb-4">
                                        ⏱️ {service.duration_minutes} mins
                                    </p>
                                    <span className="text-zen-600 hover:text-zen-800 font-medium cursor-pointer">
                                        View Details →
                                    </span>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-8 text-zen-600">
                                No services available
                            </div>
                        )}
                    </div>

                    <div className="text-center">
                        <Link to="/services" className="btn-zen">
                            View All Services
                        </Link>
                    </div>
                </div>
            </section>

            {/* Products Preview */}
            <section className="section-zen bg-white">
                <div className="container-zen">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-zen font-bold text-zen-800 mb-4">
                            Care Products
                        </h2>
                        <div className="divider-zen"></div>
                        <p className="text-xl text-zen-600 max-w-2xl mx-auto">
                            High-quality hair and skin care products
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {loading ? (
                            <div className="col-span-3 text-center py-8">
                                <div className="loader-zen"></div>
                            </div>
                        ) : products.length > 0 ? (
                            products.slice(0, 3).map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1,
                                    }}
                                    viewport={{ once: true }}
                                    onClick={() => setSelectedProduct(product)}
                                    className="card-zen text-center group cursor-pointer hover:shadow-xl transition-all duration-300"
                                >
                                    {product.image_url && (
                                        <div className="mb-4 overflow-hidden rounded-lg">
                                            <img
                                                src={product.image_url}
                                                alt={product.product_name}
                                                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                    {!product.image_url && (
                                        <div className="text-6xl mb-4">🧴</div>
                                    )}
                                    <h3 className="text-2xl font-zen font-semibold text-zen-800 mb-2">
                                        {product.product_name}
                                    </h3>
                                    <p className="text-zen-600 text-sm mb-2">
                                        {product.category || "General"}
                                    </p>
                                    <p className="text-zen-700 text-xl font-semibold mb-2">
                                        {formatCurrency(product.unit_price)}
                                    </p>
                                    <p className="text-zen-500 text-sm mb-4">
                                        Stock:{" "}
                                        {product.stock_quantity > 0
                                            ? product.stock_quantity
                                            : "Out of stock"}
                                    </p>
                                    <span className="text-zen-600 hover:text-zen-800 font-medium cursor-pointer">
                                        View Details →
                                    </span>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-8 text-zen-600">
                                No products available
                            </div>
                        )}
                    </div>

                    <div className="text-center">
                        <Link to="/products" className="btn-zen">
                            View All Products
                        </Link>
                    </div>
                </div>
            </section>

            {/* News/Blog Section */}
            <section className="section-zen bg-zen-50">
                <div className="container-zen">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-zen font-bold text-zen-800 mb-4">
                            News & Promotions
                        </h2>
                        <div className="divider-zen"></div>
                        <p className="text-xl text-zen-600 max-w-2xl mx-auto">
                            Latest news and attractive promotions
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {loading ? (
                            <div className="col-span-3 text-center py-8">
                                <div className="loader-zen"></div>
                            </div>
                        ) : blogs.length > 0 ? (
                            blogs.slice(0, 3).map((blog, index) => (
                                <motion.div
                                    key={blog.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1,
                                    }}
                                    viewport={{ once: true }}
                                    onClick={() => setSelectedBlog(blog)}
                                    className="card-zen group cursor-pointer hover:shadow-xl transition-all duration-300"
                                >
                                    {blog.image_url && (
                                        <div className="mb-4 overflow-hidden rounded-lg">
                                            <img
                                                src={blog.image_url}
                                                alt={blog.title}
                                                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center space-x-2 text-zen-500 text-sm mb-3">
                                        <Calendar size={16} />
                                        <span>
                                            {blog.created_at
                                                ? format(
                                                      new Date(blog.created_at),
                                                      "dd/MM/yyyy",
                                                  )
                                                : "N/A"}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-zen font-semibold text-zen-800 mb-3 group-hover:text-zen-600 transition-colors">
                                        {blog.title}
                                    </h3>
                                    <p className="text-zen-600 mb-4 line-clamp-3">
                                        {blog.content}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-zen-200">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-zen-200 flex items-center justify-center">
                                                <Newspaper
                                                    size={16}
                                                    className="text-zen-600"
                                                />
                                            </div>
                                            <span className="text-sm text-zen-600">
                                                {blog.author?.name || "Admin"}
                                            </span>
                                        </div>
                                        <span className="text-zen-600 hover:text-zen-800 font-medium text-sm">
                                            Read More →
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-8 text-zen-600">
                                No news available
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-zen bg-gradient-to-r from-zen-700 to-zen-900 text-white">
                <div className="container-zen text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-zen font-bold mb-6">
                            Ready to Experience?
                        </h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                            Book now and discover your perfect beauty
                        </p>
                        <Link
                            to="/booking"
                            className="inline-block px-12 py-4 bg-white text-zen-800 rounded-lg font-semibold text-lg hover:bg-zen-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                        >
                            Book Free Appointment
                        </Link>
                    </motion.div>
                </div>
            </section>

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
                                <div className="flex-1 pr-4">
                                    <h2 className="text-3xl font-zen font-bold text-zen-800 mb-2">
                                        {selectedService.service_name}
                                    </h2>
                                    <div className="flex items-center space-x-3 text-sm text-zen-500">
                                        <span className="px-3 py-1 bg-zen-100 text-zen-700 rounded-full font-medium">
                                            {selectedService.category}
                                        </span>
                                        <span>
                                            ⏱️{" "}
                                            {selectedService.duration_minutes}{" "}
                                            mins
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedService(null)}
                                    className="p-2 hover:bg-zen-100 rounded-lg transition-colors"
                                >
                                    <X size={24} className="text-zen-600" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="px-8 py-6">
                                {selectedService.image_url && (
                                    <div className="mb-6">
                                        <img
                                            src={selectedService.image_url}
                                            alt={selectedService.service_name}
                                            className="w-full h-64 rounded-lg object-cover"
                                        />
                                    </div>
                                )}

                                <div className="bg-zen-50 rounded-xl p-6 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-zen-600 mb-1">
                                                Service Price
                                            </p>
                                            <p className="text-3xl font-bold text-zen-800">
                                                {formatCurrency(
                                                    selectedService.price,
                                                )}
                                            </p>
                                        </div>
                                        <div className="text-zen-400">
                                            <Scissors size={48} />
                                        </div>
                                    </div>
                                </div>

                                {selectedService.description && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-zen-800 mb-3">
                                            Service Description
                                        </h3>
                                        <p className="text-zen-700 leading-relaxed whitespace-pre-line">
                                            {selectedService.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-zen-200 px-8 py-6 bg-zen-50 flex space-x-4">
                                <button
                                    onClick={() => setSelectedService(null)}
                                    className="flex-1 px-6 py-3 border border-zen-300 text-zen-800 rounded-lg hover:bg-zen-100 transition-colors font-medium"
                                >
                                    Close
                                </button>
                                <Link
                                    to="/booking"
                                    className="flex-1 px-6 py-3 bg-zen-600 text-white rounded-lg hover:bg-zen-700 transition-colors font-medium text-center"
                                >
                                    Book Now
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                                <div className="flex-1 pr-4">
                                    <h2 className="text-3xl font-zen font-bold text-zen-800 mb-2">
                                        {selectedProduct.product_name}
                                    </h2>
                                    {selectedProduct.brand && (
                                        <p className="text-sm text-zen-500">
                                            Brand: {selectedProduct.brand}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="p-2 hover:bg-zen-100 rounded-lg transition-colors"
                                >
                                    <X size={24} className="text-zen-600" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="px-8 py-6">
                                {selectedProduct.image_url && (
                                    <div className="mb-6">
                                        <img
                                            src={selectedProduct.image_url}
                                            alt={selectedProduct.product_name}
                                            className="w-full h-64 rounded-lg object-cover"
                                        />
                                    </div>
                                )}

                                <div className="bg-zen-50 rounded-xl p-6 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-sm text-zen-600 mb-1">
                                                Product Price
                                            </p>
                                            <p className="text-3xl font-bold text-zen-800">
                                                {formatCurrency(
                                                    selectedProduct.unit_price,
                                                )}
                                            </p>
                                        </div>
                                        <div className="text-zen-400">
                                            <ShoppingCart size={48} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-zen-200">
                                        <span className="text-sm text-zen-600">
                                            Stock Status:
                                        </span>
                                        <span
                                            className={`font-semibold ${selectedProduct.stock_quantity > 0 ? "text-green-600" : "text-red-600"}`}
                                        >
                                            {selectedProduct.stock_quantity > 0
                                                ? `${selectedProduct.stock_quantity} in stock`
                                                : "Out of stock"}
                                        </span>
                                    </div>
                                </div>

                                {selectedProduct.description && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-zen-800 mb-3">
                                            Product Description
                                        </h3>
                                        <p className="text-zen-700 leading-relaxed whitespace-pre-line">
                                            {selectedProduct.description}
                                        </p>
                                    </div>
                                )}

                                {selectedProduct.category && (
                                    <div className="bg-zen-100 rounded-lg p-4">
                                        <p className="text-sm text-zen-600">
                                            <span className="font-semibold">
                                                Category:
                                            </span>{" "}
                                            {selectedProduct.category}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-zen-200 px-8 py-6 bg-zen-50 flex space-x-4">
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="flex-1 px-6 py-3 border border-zen-300 text-zen-800 rounded-lg hover:bg-zen-100 transition-colors font-medium"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() =>
                                        handleOrderProduct(selectedProduct)
                                    }
                                    disabled={
                                        selectedProduct.stock_quantity <= 0
                                    }
                                    className="flex-1 px-6 py-3 bg-zen-600 text-white rounded-lg hover:bg-zen-700 transition-colors font-medium flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    <ShoppingBag size={20} />
                                    <span>
                                        {selectedProduct.stock_quantity > 0
                                            ? "Order Now"
                                            : "Out of Stock"}
                                    </span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Blog Detail Modal */}
            <AnimatePresence>
                {selectedBlog && (
                    <div
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedBlog(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white border-b border-zen-200 px-8 py-6 flex justify-between items-start">
                                <div className="flex-1 pr-4">
                                    <h2 className="text-3xl font-zen font-bold text-zen-800 mb-3">
                                        {selectedBlog.title}
                                    </h2>
                                    <div className="flex items-center space-x-4 text-sm text-zen-500">
                                        <div className="flex items-center space-x-2">
                                            <Calendar size={16} />
                                            <span>
                                                {selectedBlog.created_at
                                                    ? format(
                                                          new Date(
                                                              selectedBlog.created_at,
                                                          ),
                                                          "dd/MM/yyyy",
                                                      )
                                                    : "N/A"}
                                            </span>
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center space-x-2">
                                            <Newspaper size={16} />
                                            <span>
                                                {selectedBlog.author?.name ||
                                                    "Admin"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedBlog(null)}
                                    className="p-2 hover:bg-zen-100 rounded-lg transition-colors"
                                >
                                    <X size={24} className="text-zen-600" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="px-8 py-6">
                                {selectedBlog.image_url && (
                                    <div className="mb-6">
                                        <img
                                            src={selectedBlog.image_url}
                                            alt={selectedBlog.title}
                                            className="w-full h-auto rounded-lg object-cover"
                                        />
                                    </div>
                                )}
                                <div className="prose prose-lg max-w-none">
                                    <p className="text-zen-700 leading-relaxed whitespace-pre-line">
                                        {selectedBlog.content}
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-zen-200 px-8 py-6 bg-zen-50">
                                <button
                                    onClick={() => setSelectedBlog(null)}
                                    className="btn-zen w-full"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
