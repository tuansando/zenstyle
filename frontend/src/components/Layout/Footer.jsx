import { Link } from "react-router-dom";
import {
    MapPin,
    Phone,
    Mail,
    Facebook,
    Instagram,
    Twitter,
} from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-zen-900 text-zen-100">
            <div className="container-zen py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="text-2xl font-zen font-bold mb-4">
                            ZenStyle Salon
                        </h3>
                        <p className="text-zen-300 mb-4">
                            Zen-style beauty space, bringing relaxation and
                            perfection to you.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="hover:text-zen-400 transition-colors"
                            >
                                <Facebook size={24} />
                            </a>
                            <a
                                href="#"
                                className="hover:text-zen-400 transition-colors"
                            >
                                <Instagram size={24} />
                            </a>
                            <a
                                href="#"
                                className="hover:text-zen-400 transition-colors"
                            >
                                <Twitter size={24} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-zen font-semibold text-lg mb-4">
                            Quick Links
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/services"
                                    className="text-zen-300 hover:text-white transition-colors"
                                >
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/products"
                                    className="text-zen-300 hover:text-white transition-colors"
                                >
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/booking"
                                    className="text-zen-300 hover:text-white transition-colors"
                                >
                                    Book Appointment
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/blog"
                                    className="text-zen-300 hover:text-white transition-colors"
                                >
                                    News
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/about"
                                    className="text-zen-300 hover:text-white transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-zen font-semibold text-lg mb-4">
                            Featured Services
                        </h4>
                        <ul className="space-y-2 text-zen-300">
                            <li>Professional Haircut</li>
                            <li>Hair Coloring & Perming</li>
                            <li>Facial Care</li>
                            <li>Relaxation Massage</li>
                            <li>Style Consultation</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-zen font-semibold text-lg mb-4">
                            Contact
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex items-start space-x-3">
                                <MapPin
                                    size={20}
                                    className="text-zen-400 mt-1 flex-shrink-0"
                                />
                                <span className="text-zen-300">
                                    21Bis Hau Giang Str, W.Tan Son Nhat, D.Tan
                                    Binh, HCMC
                                </span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone
                                    size={20}
                                    className="text-zen-400 flex-shrink-0"
                                />
                                <span className="text-zen-300">
                                    0901 234 567
                                </span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Mail
                                    size={20}
                                    className="text-zen-400 flex-shrink-0"
                                />
                                <span className="text-zen-300">
                                    info@zenstyle.com
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-zen-800 mt-12 pt-8 text-center text-zen-400">
                    <p>&copy; 2026 ZenStyle Salon. All rights reserved.</p>
                    <p className="mt-2 text-sm">
                        Designed with ❤️ and Zen philosophy
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
