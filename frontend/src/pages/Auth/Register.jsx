import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        password_confirmation: "",
        phone_number: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Prevent spaces in username and password fields
        if (
            (name === "username" ||
                name === "password" ||
                name === "password_confirmation") &&
            value.includes(" ")
        ) {
            return; // Don't update if value contains spaces
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate username has no spaces
        if (formData.username.includes(" ")) {
            toast.error("Username cannot contain spaces");
            return;
        }

        // Validate password has no spaces
        if (
            formData.password.includes(" ") ||
            formData.password_confirmation.includes(" ")
        ) {
            toast.error("Password cannot contain spaces");
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            toast.error("Password confirmation does not match");
            return;
        }

        // Trim email to remove leading/trailing spaces
        const submitData = {
            ...formData,
            email: formData.email.trim(),
        };

        setLoading(true);

        try {
            await register(submitData);
            toast.success("Registration successful! Please login");
            navigate("/login");
        } catch (error) {
            const message =
                error.response?.data?.message || "Registration failed";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sage via-earth to-zen-800 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg w-full"
            >
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <img
                            src="http://127.0.0.1:8000/images/zen-logo.png"
                            alt="ZenStyle Salon Logo"
                            className="h-28 w-auto mx-auto mb-4 object-contain"
                        />
                        <h1 className="text-3xl font-zen font-bold text-zen-800 mb-2">
                            Create Account
                        </h1>
                        <p className="text-zen-600">
                            Become a ZenStyle Salon member
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-zen-800 font-medium mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User
                                    className="absolute left-3 top-3.5 text-zen-400"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                    className="input-zen pl-11"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-zen-800 font-medium mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <User
                                    className="absolute left-3 top-3.5 text-zen-400"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="johndoe"
                                    required
                                    className="input-zen pl-11"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-zen-800 font-medium mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail
                                    className="absolute left-3 top-3.5 text-zen-400"
                                    size={20}
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    required
                                    className="input-zen pl-11"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-zen-800 font-medium mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone
                                    className="absolute left-3 top-3.5 text-zen-400"
                                    size={20}
                                />
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="0901234567"
                                    className="input-zen pl-11"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-zen-800 font-medium mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock
                                        className="absolute left-3 top-3.5 text-zen-400"
                                        size={20}
                                    />
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        className="input-zen pl-11 pr-11"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-3.5 text-zen-500"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-zen-800 font-medium mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock
                                        className="absolute left-3 top-3.5 text-zen-400"
                                        size={20}
                                    />
                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        className="input-zen pl-11 pr-11"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword,
                                            )
                                        }
                                        className="absolute right-3 top-3.5 text-zen-500"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-zen flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <UserPlus size={20} />
                                    <span>Register</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-zen-600">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-zen-700 hover:text-zen-900 font-semibold"
                        >
                            Login
                        </Link>
                    </div>

                    <div className="mt-4 text-center">
                        <Link
                            to="/"
                            className="text-sm text-zen-600 hover:text-zen-800"
                        >
                            ← Back to home
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
