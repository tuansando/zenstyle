import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, Calendar, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const getDashboardLink = () => {
        if (user?.role === "Admin") return "/dashboard/admin";
        if (user?.role === "Stylist") return "/dashboard/staff";
        return "/dashboard/client";
    };

    const navLinks = [
        { to: "/", label: "Home" },
        { to: "/services", label: "Services" },
        { to: "/products", label: "Products" },
        { to: "/booking", label: "Book Now" },
        { to: "/blog", label: "Blog" },
        { to: "/about", label: "About Us" },
        { to: "/contact", label: "Contact" },
    ];

    const clientNavLinks =
        user?.role === "Client"
            ? [...navLinks, { to: "/feedback", label: "Feedback" }]
            : navLinks;

    return (
        <nav className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50">
            <div className="container-zen">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <img
                            src="http://127.0.0.1:8000/images/zen-logo.png"
                            alt="ZenStyle Salon Logo"
                            className="h-16 w-auto object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                        <div>
                            <h1 className="text-2xl font-zen font-bold text-zen-800">
                                ZenStyle
                            </h1>
                            <p className="text-xs text-zen-600">Salon & Spa</p>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {(isAuthenticated ? clientNavLinks : navLinks).map(
                            (link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="text-zen-700 hover:text-zen-900 font-medium transition-colors duration-300 relative group"
                                >
                                    {link.label}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-zen-600 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                            ),
                        )}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/profile"
                                    className="flex items-center space-x-2 px-4 py-2 text-zen-700 hover:text-zen-900 transition-colors group"
                                >
                                    {user?.avatar ? (
                                        <img
                                            src={`http://127.0.0.1:8000/storage/${user.avatar}`}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full object-cover border-2 border-zen-200 group-hover:border-zen-400 transition-colors"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-zen-200 flex items-center justify-center group-hover:bg-zen-300 transition-colors">
                                            <User
                                                size={18}
                                                className="text-zen-600"
                                            />
                                        </div>
                                    )}
                                    <span>{user?.name}</span>
                                </Link>
                                <Link
                                    to={getDashboardLink()}
                                    className="px-4 py-2 bg-zen-100 text-zen-800 rounded-lg hover:bg-zen-200 transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
                                >
                                    <LogOut size={20} />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-zen-outline">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-zen">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-zen-100 transition-colors"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-zen-200"
                    >
                        <div className="container-zen py-4 space-y-3">
                            {(isAuthenticated ? clientNavLinks : navLinks).map(
                                (link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setIsOpen(false)}
                                        className="block py-2 text-zen-700 hover:text-zen-900 font-medium"
                                    >
                                        {link.label}
                                    </Link>
                                ),
                            )}

                            <div className="pt-4 border-t border-zen-200 space-y-3">
                                {isAuthenticated ? (
                                    <>
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center space-x-2 py-2 text-zen-700"
                                        >
                                            {user?.avatar ? (
                                                <img
                                                    src={`http://127.0.0.1:8000/storage/${user.avatar}`}
                                                    alt={user.name}
                                                    className="w-8 h-8 rounded-full object-cover border-2 border-zen-200"
                                                />
                                            ) : (
                                                <User size={20} />
                                            )}
                                            <span>{user?.name}</span>
                                        </Link>
                                        <Link
                                            to={getDashboardLink()}
                                            onClick={() => setIsOpen(false)}
                                            className="block px-4 py-2 bg-zen-100 text-zen-800 rounded-lg text-center"
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsOpen(false);
                                            }}
                                            className="flex items-center space-x-2 py-2 text-red-600 w-full"
                                        >
                                            <LogOut size={20} />
                                            <span>Logout</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={() => setIsOpen(false)}
                                            className="block btn-zen-outline text-center"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setIsOpen(false)}
                                            className="block btn-zen text-center"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
