import { useState, useEffect } from "react";
import { Tag, Plus, Edit, Trash2, X, Send, Users } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { formatCurrency } from "../../utils/currency";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const CouponManagement = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [showSendModal, setShowSendModal] = useState(false);
    const [sendingCoupon, setSendingCoupon] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [searchCustomer, setSearchCustomer] = useState("");
    const [formData, setFormData] = useState({
        code: "",
        type: "percentage",
        value: "",
        min_amount: "0",
        expiry_date: "",
        description: "",
        customer_id: "", // Added for customer assignment
    });

    useEffect(() => {
        fetchCoupons();
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await api.get("/users");
            const clientUsers = (
                response.data.data ||
                response.data ||
                []
            ).filter((user) => user.role === "Client");
            setCustomers(clientUsers);
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };

    const fetchCoupons = async () => {
        try {
            const response = await api.get("/coupons");
            setCoupons(response.data.data || []);
        } catch (error) {
            toast.error("Unable to load coupons");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code,
                type: coupon.type,
                value: coupon.value.toString(),
                min_amount: coupon.min_amount.toString(),
                expiry_date: coupon.expiry_date,
                description: coupon.description,
                customer_id: coupon.customer_id?.toString() || "",
            });
        } else {
            setEditingCoupon(null);
            setFormData({
                code: "",
                type: "percentage",
                value: "",
                min_amount: "0",
                expiry_date: "",
                description: "",
                customer_id: "",
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCoupon(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Special case: WELCOME10 is a public coupon, doesn't need customer assignment
        const isPublicCoupon = formData.code.toUpperCase() === "WELCOME10";

        // Validate customer selection (except for WELCOME10)
        if (!isPublicCoupon && !formData.customer_id) {
            toast.error("Please select a customer for this coupon");
            return;
        }

        try {
            const data = {
                ...formData,
                value: parseFloat(formData.value),
                min_amount: parseFloat(formData.min_amount),
            };

            // Only include customer_id if it's set (not required for WELCOME10)
            if (formData.customer_id) {
                data.customer_id = parseInt(formData.customer_id);
            }

            if (editingCoupon) {
                await api.put(`/coupons/${editingCoupon.code}`, data);
                toast.success("Coupon updated successfully");
            } else {
                await api.post("/coupons", data);
                toast.success("Coupon created successfully");
            }

            handleCloseModal();
            fetchCoupons();
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to save coupon",
            );
        }
    };

    const handleDelete = async (code) => {
        if (!window.confirm(`Delete coupon "${code}"?`)) return;

        try {
            await api.delete(`/coupons/${code}`);
            toast.success("Coupon deleted successfully");
            fetchCoupons();
        } catch (error) {
            toast.error("Failed to delete coupon");
        }
    };

    const handleOpenSendModal = async (coupon) => {
        setSendingCoupon(coupon);
        setSelectedCustomers([]);
        setSearchCustomer("");

        // Fetch customers
        try {
            const response = await api.get("/users");
            const allUsers = response.data.data || [];
            const clients = allUsers.filter(
                (u) => u.role === "Client" && u.is_active,
            );
            setCustomers(clients);
            setShowSendModal(true);
        } catch (error) {
            toast.error("Failed to load customers");
        }
    };

    const handleCloseSendModal = () => {
        setShowSendModal(false);
        setSendingCoupon(null);
        setSelectedCustomers([]);
    };

    const toggleCustomerSelection = (customerId) => {
        setSelectedCustomers((prev) =>
            prev.includes(customerId)
                ? prev.filter((id) => id !== customerId)
                : [...prev, customerId],
        );
    };

    const handleSendCoupon = async () => {
        if (selectedCustomers.length === 0) {
            toast.error("Please select at least one customer");
            return;
        }

        try {
            const response = await api.post(
                `/coupons/${sendingCoupon.code}/send`,
                {
                    customer_ids: selectedCustomers,
                },
            );

            toast.success(response.data.message);
            handleCloseSendModal();
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to send coupon",
            );
        }
    };

    const filteredCustomers = customers.filter(
        (customer) =>
            customer.name
                ?.toLowerCase()
                .includes(searchCustomer.toLowerCase()) ||
            customer.email
                ?.toLowerCase()
                .includes(searchCustomer.toLowerCase()),
    );

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="loader-zen mx-auto"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-zen font-bold text-zen-800">
                    Coupon Management
                </h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-zen flex items-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Add New Coupon</span>
                </button>
            </div>

            {/* Coupons List */}
            {coupons.length === 0 ? (
                <div className="text-center py-12 bg-zen-50 rounded-xl">
                    <Tag className="w-16 h-16 text-zen-300 mx-auto mb-4" />
                    <p className="text-zen-600 text-lg">No coupons found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coupons.map((coupon) => (
                        <div
                            key={coupon.code}
                            className={`card-zen ${coupon.is_expired ? "opacity-60 bg-gray-50" : ""}`}
                        >
                            {/* Coupon Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Tag size={20} className="text-sage" />
                                    <span className="text-xl font-bold text-zen-800">
                                        {coupon.code}
                                    </span>
                                </div>
                                {coupon.is_expired && (
                                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                                        Expired
                                    </span>
                                )}
                            </div>

                            {/* Coupon Details */}
                            <div className="space-y-2 mb-4">
                                <p className="text-zen-600 text-sm">
                                    {coupon.description}
                                </p>

                                {/* Customer Info */}
                                {coupon.customer_id && (
                                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                                        <Users
                                            size={14}
                                            className="text-blue-600"
                                        />
                                        <span className="text-xs text-blue-700 font-medium">
                                            {customers.find(
                                                (c) =>
                                                    c.id === coupon.customer_id,
                                            )?.name ||
                                                `Customer #${coupon.customer_id}`}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-zen-500">
                                        Discount:
                                    </span>
                                    <span className="font-semibold text-sage">
                                        {coupon.type === "percentage"
                                            ? `${coupon.value}%`
                                            : formatCurrency(coupon.value)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-zen-500">
                                        Min Amount:
                                    </span>
                                    <span className="font-semibold text-zen-700">
                                        {coupon.min_amount > 0
                                            ? formatCurrency(coupon.min_amount)
                                            : "No limit"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-zen-500">
                                        Expiry:
                                    </span>
                                    <span className="font-semibold text-zen-700">
                                        {format(
                                            new Date(coupon.expiry_date),
                                            "dd/MM/yyyy",
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-2 pt-3 border-t border-zen-100">
                                {/* Send to Customers Button */}
                                {!coupon.is_expired && (
                                    <button
                                        onClick={() =>
                                            handleOpenSendModal(coupon)
                                        }
                                        className="w-full px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2 font-semibold"
                                    >
                                        <Send size={16} />
                                        <span>Send to Customers</span>
                                    </button>
                                )}

                                {/* Edit & Delete Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(coupon)}
                                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit size={16} />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDelete(coupon.code)
                                        }
                                        className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={handleCloseModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-zen-200 flex items-center justify-between">
                                <h3 className="text-xl font-zen font-bold text-zen-800">
                                    {editingCoupon
                                        ? "Edit Coupon"
                                        : "Create New Coupon"}
                                </h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-zen-400 hover:text-zen-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Form */}
                            <form
                                onSubmit={handleSubmit}
                                className="p-6 space-y-4"
                            >
                                <div>
                                    <label className="block text-zen-800 font-medium mb-2">
                                        Coupon Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                code: e.target.value.toUpperCase(),
                                            })
                                        }
                                        className="input-zen"
                                        placeholder="e.g., SUMMER2026"
                                        required
                                        disabled={editingCoupon !== null}
                                    />
                                </div>

                                {/* Customer Selection */}
                                <div>
                                    <label className="block text-zen-800 font-medium mb-2">
                                        <div className="flex items-center gap-2">
                                            <Users size={18} />
                                            <span>
                                                Assign to Customer{" "}
                                                {formData.code.toUpperCase() !==
                                                    "WELCOME10" && "*"}
                                            </span>
                                        </div>
                                    </label>
                                    <select
                                        value={formData.customer_id}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                customer_id: e.target.value,
                                            })
                                        }
                                        className="input-zen"
                                        required={
                                            formData.code.toUpperCase() !==
                                            "WELCOME10"
                                        }
                                    >
                                        <option value="">
                                            -- Select a customer --
                                        </option>
                                        {customers.map((customer) => (
                                            <option
                                                key={customer.id}
                                                value={customer.id}
                                            >
                                                {customer.name} (
                                                {customer.email})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-zen-500 mt-1">
                                        {formData.code.toUpperCase() ===
                                        "WELCOME10"
                                            ? "WELCOME10 is a public coupon available to all customers"
                                            : "Only the selected customer can use this coupon"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Discount Type *
                                        </label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    type: e.target.value,
                                                })
                                            }
                                            className="input-zen"
                                            required
                                        >
                                            <option value="percentage">
                                                Percentage (%)
                                            </option>
                                            <option value="fixed">
                                                Fixed Amount (VND)
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Value *{" "}
                                            {formData.type === "percentage"
                                                ? "(%)"
                                                : "(VND)"}
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.value}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    value: e.target.value,
                                                })
                                            }
                                            className="input-zen"
                                            min="0"
                                            step={
                                                formData.type === "percentage"
                                                    ? "1"
                                                    : "1000"
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-zen-800 font-medium mb-2">
                                        Minimum Order Amount (VND)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.min_amount}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                min_amount: e.target.value,
                                            })
                                        }
                                        className="input-zen"
                                        min="0"
                                        step="1000"
                                    />
                                    <p className="text-xs text-zen-500 mt-1">
                                        Set to 0 for no minimum
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-zen-800 font-medium mb-2">
                                        Expiry Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.expiry_date}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                expiry_date: e.target.value,
                                            })
                                        }
                                        className="input-zen"
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-zen-800 font-medium mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                description: e.target.value,
                                            })
                                        }
                                        className="input-zen resize-none"
                                        rows="3"
                                        placeholder="Brief description of the coupon"
                                        required
                                    ></textarea>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 px-4 py-3 border border-zen-300 text-zen-800 rounded-xl hover:bg-zen-100 transition-colors font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-sage text-white py-3 rounded-xl font-semibold hover:bg-earth transition-colors"
                                    >
                                        {editingCoupon
                                            ? "Update Coupon"
                                            : "Create Coupon"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Send to Customers Modal */}
            <AnimatePresence>
                {showSendModal && sendingCoupon && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={handleCloseSendModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-zen-200 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-zen font-bold text-zen-800">
                                        Send Coupon to Customers
                                    </h3>
                                    <p className="text-sm text-zen-600 mt-1">
                                        Coupon:{" "}
                                        <span className="font-semibold text-sage">
                                            {sendingCoupon.code}
                                        </span>{" "}
                                        - {sendingCoupon.description}
                                    </p>
                                </div>
                                <button
                                    onClick={handleCloseSendModal}
                                    className="text-zen-400 hover:text-zen-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="px-6 py-4 border-b border-zen-200">
                                <input
                                    type="text"
                                    value={searchCustomer}
                                    onChange={(e) =>
                                        setSearchCustomer(e.target.value)
                                    }
                                    placeholder="Search customers by name or email..."
                                    className="w-full px-4 py-2 border border-zen-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage"
                                />
                            </div>

                            {/* Customer List */}
                            <div className="flex-1 overflow-y-auto px-6 py-4">
                                {filteredCustomers.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users
                                            size={48}
                                            className="text-zen-300 mx-auto mb-4"
                                        />
                                        <p className="text-zen-600">
                                            No customers found
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredCustomers.map((customer) => (
                                            <label
                                                key={customer.id}
                                                className="flex items-center p-3 border border-zen-200 rounded-lg cursor-pointer hover:bg-zen-50 transition-colors has-[:checked]:bg-green-50 has-[:checked]:border-green-500"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCustomers.includes(
                                                        customer.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleCustomerSelection(
                                                            customer.id,
                                                        )
                                                    }
                                                    className="w-4 h-4 text-sage rounded focus:ring-sage"
                                                />
                                                <div className="ml-3 flex-1">
                                                    <div className="font-semibold text-zen-800">
                                                        {customer.name}
                                                    </div>
                                                    <div className="text-sm text-zen-600">
                                                        {customer.email}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-zen-200 bg-zen-50">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-zen-600">
                                        Selected:{" "}
                                        <span className="font-semibold text-zen-800">
                                            {selectedCustomers.length}
                                        </span>{" "}
                                        customer(s)
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCloseSendModal}
                                        className="flex-1 px-4 py-3 border border-zen-300 text-zen-800 rounded-xl hover:bg-zen-100 transition-colors font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendCoupon}
                                        disabled={
                                            selectedCustomers.length === 0
                                        }
                                        className="flex-1 bg-sage text-white py-3 rounded-xl font-semibold hover:bg-earth transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Send size={20} />
                                        <span>Send Coupon</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CouponManagement;
