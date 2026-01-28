import { useState, useEffect } from "react";
import { formatCurrency } from "../../utils/currency";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Package,
    User,
    LogOut,
    ShoppingBag,
    Edit,
    X,
    CreditCard,
    Star,
    MessageCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { appointmentService, orderService } from "../../services/dataService";
import toast from "react-hot-toast";
import { format } from "date-fns";

const ClientDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [editDate, setEditDate] = useState("");
    const [editTime, setEditTime] = useState("");
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [payingOrder, setPayingOrder] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("COD");

    useEffect(() => {
        fetchAppointments();
        fetchOrders();
    }, []);

    const fetchAppointments = async () => {
        try {
            const data = await appointmentService.getMyAppointments();
            setAppointments(data.data || []);
        } catch (error) {
            toast.error("Unable to load appointments");
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const data = await orderService.getAll();
            console.log("Orders response:", data);
            // Backend returns array directly, not wrapped in data
            setOrders(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error("Fetch orders error:", error);
            toast.error("Unable to load orders");
            setOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleCancelAppointment = async (id) => {
        if (
            !window.confirm("Are you sure you want to cancel this appointment?")
        )
            return;

        try {
            await appointmentService.cancel(id);
            toast.success("Appointment cancelled");
            fetchAppointments();
        } catch (error) {
            toast.error("Unable to cancel appointment");
        }
    };

    const handleEditAppointment = (appointment) => {
        setEditingAppointment(appointment);
        const appointmentDate = new Date(appointment.appointment_date);
        setEditDate(format(appointmentDate, "yyyy-MM-dd"));
        setEditTime(format(appointmentDate, "HH:mm"));
    };

    const handleUpdateAppointment = async () => {
        if (!editDate || !editTime) {
            toast.error("Please select date and time");
            return;
        }

        try {
            const newDateTime = `${editDate} ${editTime}:00`;
            console.log("Updating appointment:", {
                id: editingAppointment.appointment_id,
                newDateTime: newDateTime,
            });

            const result = await appointmentService.update(
                editingAppointment.appointment_id,
                {
                    appointment_date: newDateTime,
                },
            );

            console.log("Update result:", result);
            toast.success("Appointment updated");
            setEditingAppointment(null);
            fetchAppointments();
        } catch (error) {
            console.error("Update error:", error);
            console.error("Error response:", error.response?.data);
            const errorMsg =
                error.response?.data?.message || "Unable to update appointment";
            toast.error(errorMsg);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            case "Confirmed":
                return "bg-blue-100 text-blue-800";
            case "Completed":
                return "bg-green-100 text-green-800";
            case "Cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getOrderStatusColor = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            case "Processing":
                return "bg-blue-100 text-blue-800";
            case "Completed":
                return "bg-green-100 text-green-800";
            case "Cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getOrderStatusText = (status) => {
        switch (status) {
            case "Pending":
                return "Pending";
            case "Processing":
                return "Processing";
            case "Completed":
                return "Completed";
            case "Cancelled":
                return "Cancelled";
            default:
                return status;
        }
    };

    const openPaymentModal = (order) => {
        setPayingOrder(order);
        setSelectedPaymentMethod("COD");
        setShowPaymentModal(true);
    };

    const handlePayment = async () => {
        if (!payingOrder) return;

        try {
            const result = await orderService.processPayment(
                payingOrder.id,
                selectedPaymentMethod,
            );
            toast.success(result.message);
            setShowPaymentModal(false);
            setPayingOrder(null);
            fetchOrders(); // Reload orders
        } catch (error) {
            toast.error(error.response?.data?.message || "Payment failed");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-cream to-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-zen-700 to-zen-900 text-white py-8">
                <div className="container-zen">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <img
                                src="http://127.0.0.1:8000/images/zen-logo.png"
                                alt="ZenStyle Logo"
                                className="h-16 w-auto object-contain drop-shadow-lg"
                            />
                            <div>
                                <h1 className="text-3xl font-zen font-bold mb-2">
                                    Welcome, {user?.name}!
                                </h1>
                                <p className="text-zen-200">
                                    Manage your appointments and orders
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="container-zen py-12">
                {/* Quick Actions */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => navigate("/booking")}
                        className="card-zen text-center hover:bg-zen-50 transition-colors group"
                    >
                        <Calendar className="w-12 h-12 text-zen-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-zen font-semibold text-zen-800">
                            Book New Appointment
                        </h3>
                        <p className="text-zen-600 mt-2">Book a service</p>
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onClick={() => navigate("/products")}
                        className="card-zen text-center hover:bg-zen-50 transition-colors group"
                    >
                        <Package className="w-12 h-12 text-zen-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-zen font-semibold text-zen-800">
                            Buy Products
                        </h3>
                        <p className="text-zen-600 mt-2">View products</p>
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={() => navigate("/feedback")}
                        className="card-zen text-center hover:bg-gradient-to-br hover:from-zen-600 hover:to-zen-700 hover:text-white transition-all group border-2 border-zen-200 hover:border-zen-600"
                    >
                        <div className="relative">
                            <MessageCircle className="w-12 h-12 text-zen-600 group-hover:text-white mx-auto mb-3 group-hover:scale-110 transition-transform" />
                            {appointments.filter(
                                (apt) =>
                                    apt.status === "Completed" &&
                                    !apt.has_feedback,
                            ).length > 0 && (
                                <span className="absolute -top-1 -right-6 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold animate-pulse">
                                    {
                                        appointments.filter(
                                            (apt) =>
                                                apt.status === "Completed" &&
                                                !apt.has_feedback,
                                        ).length
                                    }
                                </span>
                            )}
                        </div>
                        <h3 className="text-xl font-zen font-semibold text-zen-800 group-hover:text-white">
                            Leave Feedback
                        </h3>
                        <p className="text-zen-600 group-hover:text-zen-100 mt-2">
                            Rate your experience
                        </p>
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onClick={() => navigate("/profile")}
                        className="card-zen text-center hover:bg-zen-50 transition-colors group"
                    >
                        <User className="w-12 h-12 text-zen-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-zen font-semibold text-zen-800">
                            Personal Information
                        </h3>
                        <p className="text-zen-600 mt-2">Update profile</p>
                    </motion.button>
                </div>

                {/* Feedback Alert */}
                {appointments.filter(
                    (apt) => apt.status === "Completed" && !apt.has_feedback,
                ).length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-zen bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 mb-8"
                    >
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-amber-900 mb-2">
                                    🎉 Share Your Experience!
                                </h3>
                                <p className="text-amber-800 mb-3">
                                    You have{" "}
                                    {
                                        appointments.filter(
                                            (apt) =>
                                                apt.status === "Completed" &&
                                                !apt.has_feedback,
                                        ).length
                                    }{" "}
                                    completed{" "}
                                    {appointments.filter(
                                        (apt) =>
                                            apt.status === "Completed" &&
                                            !apt.has_feedback,
                                    ).length === 1
                                        ? "appointment"
                                        : "appointments"}{" "}
                                    waiting for your feedback. Your review helps
                                    us improve our services!
                                </p>
                                <button
                                    onClick={() => navigate("/feedback")}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors"
                                >
                                    <Star size={18} className="fill-white" />
                                    <span>Leave Feedback Now</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Appointments */}
                <div className="card-zen">
                    <h2 className="text-2xl font-zen font-bold text-zen-800 mb-6">
                        My Appointments
                    </h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="loader-zen mx-auto"></div>
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-zen-300 mx-auto mb-4" />
                            <p className="text-zen-600 text-lg">
                                You have no appointments yet
                            </p>
                            <button
                                onClick={() => navigate("/booking")}
                                className="btn-zen mt-4"
                            >
                                Book Now
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-zen-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-zen-800">
                                            Service
                                        </th>
                                        <th className="px-4 py-3 text-left text-zen-800">
                                            Date & Time
                                        </th>
                                        <th className="px-4 py-3 text-left text-zen-800">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-zen-800">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((apt) => (
                                        <tr
                                            key={apt.appointment_id}
                                            className="border-t border-zen-100 hover:bg-zen-50"
                                        >
                                            <td className="px-4 py-3 text-zen-800">
                                                {apt.details &&
                                                apt.details.length > 0
                                                    ? apt.details
                                                          .map(
                                                              (d) =>
                                                                  d.service
                                                                      ?.service_name,
                                                          )
                                                          .filter(Boolean)
                                                          .join(", ")
                                                    : "N/A"}
                                            </td>
                                            <td className="px-4 py-3 text-zen-600">
                                                {format(
                                                    new Date(
                                                        apt.appointment_date,
                                                    ),
                                                    "dd/MM/yyyy HH:mm",
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm ${getStatusColor(apt.status)}`}
                                                >
                                                    {apt.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {apt.status === "Pending" && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleEditAppointment(
                                                                    apt,
                                                                )
                                                            }
                                                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                                        >
                                                            <Edit size={16} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleCancelAppointment(
                                                                    apt.appointment_id,
                                                                )
                                                            }
                                                            className="text-red-600 hover:text-red-800 font-medium"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                                {apt.status === "Completed" && (
                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                "/feedback",
                                                            )
                                                        }
                                                        className="px-3 py-1.5 bg-gradient-to-r from-zen-600 to-zen-700 text-white hover:from-zen-700 hover:to-zen-800 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
                                                    >
                                                        <Star
                                                            size={16}
                                                            className="fill-yellow-300 text-yellow-300"
                                                        />
                                                        Leave Feedback
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Orders Section */}
                <div className="card-zen mt-8">
                    <h2 className="text-2xl font-zen font-bold text-zen-800 mb-6">
                        My Orders
                    </h2>

                    {loadingOrders ? (
                        <div className="text-center py-12">
                            <div className="loader-zen mx-auto"></div>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingBag className="w-16 h-16 text-zen-300 mx-auto mb-4" />
                            <p className="text-zen-600 text-lg">
                                You have no orders yet
                            </p>
                            <button
                                onClick={() => navigate("/products")}
                                className="btn-zen mt-4"
                            >
                                Shop Now
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-zen-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-zen-800">
                                            Order ID
                                        </th>
                                        <th className="px-4 py-3 text-left text-zen-800">
                                            Products
                                        </th>
                                        <th className="px-4 py-3 text-left text-zen-800">
                                            Total
                                        </th>
                                        <th className="px-4 py-3 text-left text-zen-800">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-zen-800">
                                            Payment
                                        </th>
                                        <th className="px-4 py-3 text-left text-zen-800">
                                            Order Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-zen-800">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="border-t border-zen-100 hover:bg-zen-50"
                                        >
                                            <td className="px-4 py-3 text-zen-800 font-medium">
                                                #{order.id}
                                            </td>
                                            <td className="px-4 py-3 text-zen-600">
                                                {order.order_details &&
                                                order.order_details.length > 0
                                                    ? order.order_details
                                                          .map(
                                                              (d) =>
                                                                  `${d.product?.product_name} (${d.quantity})`,
                                                          )
                                                          .join(", ")
                                                    : "N/A"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    {order.discount_amount >
                                                    0 ? (
                                                        <>
                                                            <span className="text-xs text-zen-500 line-through">
                                                                {formatCurrency(
                                                                    order.total_amount,
                                                                )}
                                                            </span>
                                                            <span className="text-zen-800 font-semibold">
                                                                {formatCurrency(
                                                                    order.final_amount ||
                                                                        order.total_amount,
                                                                )}
                                                            </span>
                                                            {order.coupon_code && (
                                                                <span className="text-xs text-green-600">
                                                                    🏷️{" "}
                                                                    {
                                                                        order.coupon_code
                                                                    }
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-zen-800 font-semibold">
                                                            {formatCurrency(
                                                                order.total_amount,
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm ${getOrderStatusColor(order.status)}`}
                                                >
                                                    {getOrderStatusText(
                                                        order.status,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-medium ${
                                                            order.payment_status ===
                                                            "Paid"
                                                                ? "bg-green-100 text-green-800"
                                                                : order.payment_status ===
                                                                    "Refunded"
                                                                  ? "bg-gray-100 text-gray-800"
                                                                  : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                    >
                                                        {order.payment_status ===
                                                        "Paid"
                                                            ? "✓ Paid"
                                                            : order.payment_status ===
                                                                "Refunded"
                                                              ? "Refunded"
                                                              : "Unpaid"}
                                                    </span>
                                                    <span className="text-xs text-zen-500">
                                                        {order.payment_method ||
                                                            "COD"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-zen-600">
                                                {format(
                                                    new Date(order.created_at),
                                                    "dd/MM/yyyy HH:mm",
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {order.payment_status ===
                                                    "Unpaid" &&
                                                    order.status !==
                                                        "Cancelled" && (
                                                        <button
                                                            onClick={() =>
                                                                openPaymentModal(
                                                                    order,
                                                                )
                                                            }
                                                            className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm font-medium flex items-center space-x-1"
                                                        >
                                                            <CreditCard
                                                                size={14}
                                                            />
                                                            <span>Pay</span>
                                                        </button>
                                                    )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Appointment Modal */}
            <AnimatePresence>
                {editingAppointment && (
                    <div
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                        onClick={() => setEditingAppointment(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl max-w-md w-full"
                        >
                            {/* Header */}
                            <div className="bg-zen-700 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
                                <h3 className="text-xl font-zen font-bold">
                                    Edit Appointment
                                </h3>
                                <button
                                    onClick={() => setEditingAppointment(null)}
                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zen-700 mb-2">
                                        Service
                                    </label>
                                    <div className="text-zen-800 font-semibold">
                                        {editingAppointment.details &&
                                        editingAppointment.details.length > 0
                                            ? editingAppointment.details
                                                  .map(
                                                      (d) =>
                                                          d.service
                                                              ?.service_name,
                                                  )
                                                  .filter(Boolean)
                                                  .join(", ")
                                            : "N/A"}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zen-700 mb-2">
                                        New Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editDate}
                                        onChange={(e) =>
                                            setEditDate(e.target.value)
                                        }
                                        min={format(new Date(), "yyyy-MM-dd")}
                                        className="w-full px-4 py-2 border border-zen-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zen-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zen-700 mb-2">
                                        New Time
                                    </label>
                                    <input
                                        type="time"
                                        value={editTime}
                                        onChange={(e) =>
                                            setEditTime(e.target.value)
                                        }
                                        className="w-full px-4 py-2 border border-zen-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zen-500"
                                    />
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Note:</strong> Appointments can
                                        only be edited when in "Pending" status.
                                        Please select a time during salon
                                        business hours.
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-zen-50 rounded-b-2xl flex gap-3">
                                <button
                                    onClick={() => setEditingAppointment(null)}
                                    className="flex-1 px-4 py-2 border border-zen-300 text-zen-800 rounded-lg hover:bg-zen-100 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateAppointment}
                                    className="flex-1 bg-sage text-white py-2 rounded-lg font-semibold hover:bg-earth transition-colors"
                                >
                                    Update
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Payment Modal */}
            <AnimatePresence>
                {showPaymentModal && payingOrder && (
                    <div
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowPaymentModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-zen-200 flex items-center justify-between">
                                <h3 className="text-xl font-zen font-bold text-zen-800">
                                    Order Payment
                                </h3>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="text-zen-400 hover:text-zen-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-6 space-y-6">
                                {/* Order Info */}
                                <div className="bg-zen-50 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-zen-600">
                                            Order ID:
                                        </span>
                                        <span className="font-semibold text-zen-800">
                                            #{payingOrder.id}
                                        </span>
                                    </div>
                                    {payingOrder.coupon_code && (
                                        <div className="flex justify-between">
                                            <span className="text-zen-600">
                                                Coupon:
                                            </span>
                                            <span className="font-semibold text-green-600">
                                                🏷️ {payingOrder.coupon_code}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-zen-600">
                                            Subtotal:
                                        </span>
                                        <span className="font-semibold text-zen-800">
                                            {formatCurrency(
                                                payingOrder.total_amount,
                                            )}
                                        </span>
                                    </div>
                                    {payingOrder.discount_amount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount:</span>
                                            <span className="font-semibold">
                                                -{" "}
                                                {formatCurrency(
                                                    payingOrder.discount_amount,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pt-2 border-t border-zen-200">
                                        <span className="text-zen-600 font-semibold">
                                            Total:
                                        </span>
                                        <span className="font-bold text-zen-800 text-xl">
                                            {formatCurrency(
                                                payingOrder.final_amount ||
                                                    payingOrder.total_amount,
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Method Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-zen-700 mb-3">
                                        Choose payment method
                                    </label>
                                    <div className="space-y-3">
                                        <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-zen-50 has-[:checked]:border-zen-600 has-[:checked]:bg-zen-50">
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value="COD"
                                                checked={
                                                    selectedPaymentMethod ===
                                                    "COD"
                                                }
                                                onChange={(e) =>
                                                    setSelectedPaymentMethod(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-4 h-4 text-zen-600"
                                            />
                                            <div className="ml-3">
                                                <div className="font-semibold text-zen-800">
                                                    💵 COD (Cash)
                                                </div>
                                                <div className="text-sm text-zen-600">
                                                    Pay on delivery
                                                </div>
                                            </div>
                                        </label>

                                        <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-zen-50 has-[:checked]:border-zen-600 has-[:checked]:bg-zen-50">
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value="VNPay"
                                                checked={
                                                    selectedPaymentMethod ===
                                                    "VNPay"
                                                }
                                                onChange={(e) =>
                                                    setSelectedPaymentMethod(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-4 h-4 text-zen-600"
                                            />
                                            <div className="ml-3">
                                                <div className="font-semibold text-zen-800">
                                                    🏦 VNPay
                                                </div>
                                                <div className="text-sm text-zen-600">
                                                    Payment via VNPay (Demo)
                                                </div>
                                            </div>
                                        </label>

                                        <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-zen-50 has-[:checked]:border-zen-600 has-[:checked]:bg-zen-50">
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value="MoMo"
                                                checked={
                                                    selectedPaymentMethod ===
                                                    "MoMo"
                                                }
                                                onChange={(e) =>
                                                    setSelectedPaymentMethod(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-4 h-4 text-zen-600"
                                            />
                                            <div className="ml-3">
                                                <div className="font-semibold text-zen-800">
                                                    📱 MoMo
                                                </div>
                                                <div className="text-sm text-zen-600">
                                                    Payment via MoMo Wallet
                                                    (Demo)
                                                </div>
                                            </div>
                                        </label>

                                        <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-zen-50 has-[:checked]:border-zen-600 has-[:checked]:bg-zen-50">
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value="BankTransfer"
                                                checked={
                                                    selectedPaymentMethod ===
                                                    "BankTransfer"
                                                }
                                                onChange={(e) =>
                                                    setSelectedPaymentMethod(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-4 h-4 text-zen-600"
                                            />
                                            <div className="ml-3">
                                                <div className="font-semibold text-zen-800">
                                                    🏧 Bank Transfer
                                                </div>
                                                <div className="text-sm text-zen-600">
                                                    Bank transfer (Demo)
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Demo Notice */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-sm text-blue-800">
                                        <strong>Demo:</strong> This is a
                                        simulated payment feature. Online
                                        payment methods will be automatically
                                        confirmed as successful.
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-zen-50 rounded-b-2xl flex gap-3">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 px-4 py-3 border border-zen-300 text-zen-800 rounded-lg hover:bg-zen-100 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePayment}
                                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <CreditCard size={20} />
                                    <span>Confirm Payment</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ClientDashboard;
