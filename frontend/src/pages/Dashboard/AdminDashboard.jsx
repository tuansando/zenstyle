import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    TrendingUp,
    DollarSign,
    Calendar,
    LogOut,
    Plus,
    Edit,
    Trash2,
    Package,
    Scissors,
    Mail,
    ShoppingCart,
    X,
    Minus,
    Search,
    Newspaper,
    Settings,
    Eye,
    EyeOff,
    Tag,
    BarChart3,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminStatsView from "../../components/Admin/AdminStatsView";
import {
    customerService,
    staffService,
    serviceService,
    productService,
    appointmentService,
    contactService,
    orderService,
    blogService,
    settingsService,
} from "../../services/dataService";
import api from "../../services/api";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { formatCurrency } from "../../utils/currency";
import CouponManagement from "../../components/Admin/CouponManagement";

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview"); // overview, customers, staff, appointments, contacts, orders, services, products, blogs, coupons, settings
    const [services, setServices] = useState([]);
    const [products, setProducts] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [salonSettings, setSalonSettings] = useState([]);
    const [settingsValues, setSettingsValues] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(""); // 'service', 'product', 'blog', or 'user'
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [showUserEditModal, setShowUserEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [newUserData, setNewUserData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "Client",
        phone_number: "",
    });
    // Create Appointment modal state
    const [showCreateAppointmentModal, setShowCreateAppointmentModal] =
        useState(false);
    const [newAppointmentData, setNewAppointmentData] = useState({
        client_id: "",
        service_id: "",
        staff_id: "",
        appointment_date: "",
        appointment_time: "",
        notes: "",
    });
    const [creatingAppointment, setCreatingAppointment] = useState(false);
    const [newUserShowPassword, setNewUserShowPassword] = useState(false);

    // Order creation states
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderCart, setOrderCart] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [creatingOrder, setCreatingOrder] = useState(false);

    // Filter/Search states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchStatistics();
        if (activeTab === "customers" || activeTab === "staff") fetchUsers();
        if (activeTab === "appointments") {
            fetchAppointments();
            fetchServices();
            fetchStaff();
            fetchUsers();
        }
        if (activeTab === "contacts") fetchContacts();
        if (activeTab === "orders") fetchOrders();
        if (activeTab === "services") fetchServices();
        if (activeTab === "products") fetchProducts();
        if (activeTab === "blogs") fetchBlogs();
        if (activeTab === "settings") fetchSettings();
    }, [activeTab]);

    const fetchStatistics = async () => {
        try {
            const [customerData, staffData] = await Promise.all([
                customerService.getStatistics(),
                staffService.getStatistics(),
            ]);

            setStats({
                customers: customerData.data,
                staff: staffData.data,
            });
        } catch (error) {
            toast.error("Unable to load statistics");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/users", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    Accept: "application/json",
                },
            });
            const data = await response.json();
            setUsers(data.data || []);
        } catch (error) {
            toast.error("Unable to load user list");
        }
    };

    const handleToggleUserStatus = async (id, currentStatus) => {
        try {
            const endpoint = currentStatus ? "lock" : "unlock";
            await fetch(`http://localhost:8000/api/users/${id}/${endpoint}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });
            toast.success(`Account ${currentStatus ? "locked" : "unlocked"}`);
            await fetchUsers();
            fetchStatistics(); // Refresh statistics (active rate) after locking/unlocking a user
        } catch (error) {
            toast.error("Unable to update status");
        }
    };

    const handleChangeRole = async (id, currentRole, newRole) => {
        if (currentRole === newRole) return;

        const roleNames = {
            Admin: "Admin",
            Stylist: "Stylist",
            Client: "Customer",
        };

        if (
            !window.confirm(
                `Are you sure you want to change role from ${roleNames[currentRole]} to ${roleNames[newRole]}?`,
            )
        ) {
            return;
        }

        try {
            await fetch(`http://localhost:8000/api/users/${id}/role`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role: newRole }),
            });
            toast.success("Role updated successfully");
            fetchUsers();
            fetchStatistics(); // Update statistics after role change
        } catch (error) {
            toast.error("Unable to update role");
        }
    };

    const handleResetPassword = async (userId, userName) => {
        const newPassword = prompt(`Enter new password for ${userName}:`);

        if (!newPassword) return;

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        if (
            !window.confirm(
                `Are you sure you want to reset password for ${userName}?`,
            )
        ) {
            return;
        }

        try {
            await fetch(
                `http://localhost:8000/api/users/${userId}/reset-password`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ new_password: newPassword }),
                },
            );
            toast.success(`Password reset successfully for ${userName}`);
        } catch (error) {
            toast.error("Unable to reset password");
        }
    };

    const openUserEditModal = (user) => {
        setEditingUser({ ...user });
        setShowUserEditModal(true);
    };

    const closeUserEditModal = () => {
        setEditingUser(null);
        setShowUserEditModal(false);
    };

    const openCreateUserModal = () => {
        setNewUserData({
            name: "",
            username: "",
            email: "",
            password: "",
            role: "Client",
            phone_number: "",
        });
        setShowCreateUserModal(true);
    };

    const closeCreateUserModal = () => {
        setShowCreateUserModal(false);
        setNewUserData({
            name: "",
            username: "",
            email: "",
            password: "",
            role: "Client",
            phone_number: "",
        });
    };

    const openCreateAppointmentModal = async () => {
        // Ensure lists are loaded for the form
        try {
            await Promise.all([fetchUsers(), fetchServices(), fetchStaff()]);
        } catch (e) {
            // ignore, fetch functions will show their own errors
        }
        setNewAppointmentData({
            client_id: "",
            service_id: "",
            staff_id: "",
            appointment_date: "",
            appointment_time: "",
            notes: "",
        });
        setShowCreateAppointmentModal(true);
    };

    const closeCreateAppointmentModal = () => {
        setShowCreateAppointmentModal(false);
        setNewAppointmentData({
            client_id: "",
            service_id: "",
            staff_id: "",
            appointment_date: "",
            appointment_time: "",
            notes: "",
        });
    };

    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        if (
            !newAppointmentData.service_id ||
            !newAppointmentData.appointment_date ||
            !newAppointmentData.appointment_time
        ) {
            toast.error("Please choose service, date and time");
            return;
        }
        setCreatingAppointment(true);
        try {
            const payload = {
                service_ids: [parseInt(newAppointmentData.service_id)],
                appointment_date: `${newAppointmentData.appointment_date} ${newAppointmentData.appointment_time}`,
                notes: newAppointmentData.notes || "",
            };
            if (newAppointmentData.staff_id)
                payload.staff_id = parseInt(newAppointmentData.staff_id);
            if (newAppointmentData.client_id)
                payload.client_id = parseInt(newAppointmentData.client_id);

            await appointmentService.book(payload);
            toast.success("Appointment created successfully!");
            closeCreateAppointmentModal();
            fetchAppointments();
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Unable to create appointment",
            );
        } finally {
            setCreatingAppointment(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();

        if (newUserData.password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/users", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newUserData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Unable to create new user",
                );
            }

            const data = await response.json();
            toast.success(`Account created for ${data.data.name}`);
            closeCreateUserModal();
            fetchUsers();
            fetchStatistics();
        } catch (error) {
            toast.error(error.message || "An error occurred");
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();

        if (!editingUser) return;

        try {
            const response = await fetch(
                `http://localhost:8000/api/users/${editingUser.id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: editingUser.name,
                        username: editingUser.username,
                        email: editingUser.email,
                        phone_number: editingUser.phone_number,
                        role: editingUser.role,
                    }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Unable to update information",
                );
            }

            toast.success("User information updated successfully");
            closeUserEditModal();
            fetchUsers();
        } catch (error) {
            toast.error(error.message || "Unable to update information");
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await appointmentService.getAll();
            setAppointments(response.data || []);
        } catch (error) {
            toast.error("Unable to load appointments");
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await appointmentService.updateStatus(id, status);
            toast.success("Status updated successfully");
            fetchAppointments();
        } catch (error) {
            toast.error("Unable to update status");
        }
    };

    const fetchContacts = async () => {
        try {
            const response = await contactService.getAll();
            setContacts(response.data?.data || response.data || []);
        } catch (error) {
            toast.error("Unable to load messages");
        }
    };

    const handleReplyContact = async (id) => {
        const reply = prompt("Enter reply:");
        if (!reply) return;

        try {
            await contactService.reply(id, reply);
            toast.success("Reply sent");
            fetchContacts();
        } catch (error) {
            toast.error("Unable to send reply");
        }
    };

    const handleUpdateContactStatus = async (id, status) => {
        try {
            await contactService.updateStatus(id, status);
            toast.success("Status updated successfully");
            fetchContacts();
        } catch (error) {
            toast.error("Unable to update status");
        }
    };

    const handleDeleteContact = async (id) => {
        if (!window.confirm("Are you sure you want to delete this message?"))
            return;

        try {
            await contactService.delete(id);
            toast.success("Message deleted successfully");
            fetchContacts();
        } catch (error) {
            toast.error("Unable to delete message");
        }
    };

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            console.log("🔑 Token:", token ? "exists" : "missing");
            console.log(
                "📡 Fetching orders from: http://127.0.0.1:8000/api/orders/all",
            );

            // Admin/Staff use different endpoint
            const response = await fetch(
                "http://127.0.0.1:8000/api/orders/all",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                },
            );

            console.log("📊 Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Error response:", errorText);
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log("✅ Orders data received:", data);
            console.log(
                "📦 Number of orders:",
                Array.isArray(data) ? data.length : "not array",
            );
            setOrders(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error("❌ Fetch orders error:", error);
            setOrders([]); // Set empty array on error
            toast.error("Unable to load orders list");
        }
    };

    const handleUpdateOrderStatus = async (id, status) => {
        try {
            await orderService.updateStatus(id, status);
            toast.success("Order status updated successfully");
            fetchOrders();
        } catch (error) {
            toast.error("Unable to update status");
        }
    };

    const fetchServices = async () => {
        try {
            const response = await serviceService.getAll();
            setServices(response.data || response);
        } catch (error) {
            toast.error("Unable to load services list");
        }
    };

    const fetchStaff = async () => {
        try {
            const response = await api.get("/stylists");
            // Response shape may be { data: { data: [...] } } or { data: [...] }
            const list = response.data?.data || response.data || [];
            setStaffList(list);
        } catch (error) {
            toast.error("Unable to load staff list");
            setStaffList([]);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await productService.getAll();
            setProducts(response.data || response);
        } catch (error) {
            toast.error("Unable to load products list");
        }
    };

    const fetchBlogs = async () => {
        try {
            const response = await blogService.getAll();
            setBlogs(response.data || response || []);
        } catch (error) {
            toast.error("Unable to load news list");
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await settingsService.getSettings();
            setSalonSettings(response.settings || []);
            setSettingsValues(response.current_values || {});
        } catch (error) {
            toast.error("Unable to load settings");
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        try {
            const settingsArray = salonSettings.map((setting) => ({
                key: setting.key,
                value: settingsValues[setting.key],
            }));

            await settingsService.updateSettings(settingsArray);
            toast.success("Settings updated successfully!");
            fetchSettings();
        } catch (error) {
            toast.error("Unable to update settings");
        }
    };

    // Order Creation Functions
    const openOrderModal = async () => {
        setActiveTab("orders"); // Set active tab to orders
        setShowOrderModal(true);
        if (products.length === 0) await fetchProducts();
        if (users.length === 0) await fetchUsers();
    };

    const addToOrderCart = (product) => {
        const existingItem = orderCart.find((item) => item.id === product.id);
        if (existingItem) {
            if (existingItem.quantity >= product.stock_quantity) {
                toast.error("Not enough stock");
                return;
            }
            setOrderCart(
                orderCart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                ),
            );
        } else {
            setOrderCart([...orderCart, { ...product, quantity: 1 }]);
        }
        toast.success("Added to order");
    };

    const updateOrderQuantity = (productId, change) => {
        setOrderCart(
            orderCart
                .map((item) => {
                    if (item.id === productId) {
                        const newQuantity = item.quantity + change;
                        if (newQuantity <= 0) return null;
                        if (newQuantity > item.stock_quantity) {
                            toast.error("Not enough stock");
                            return item;
                        }
                        return { ...item, quantity: newQuantity };
                    }
                    return item;
                })
                .filter(Boolean),
        );
    };

    const removeFromOrderCart = (productId) => {
        setOrderCart(orderCart.filter((item) => item.id !== productId));
    };

    const getOrderTotal = () => {
        return orderCart.reduce(
            (total, item) => total + item.unit_price * item.quantity,
            0,
        );
    };

    const handleCreateOrder = async () => {
        if (!selectedCustomer) {
            toast.error("Please select a customer");
            return;
        }

        if (orderCart.length === 0) {
            toast.error("Please select at least one product");
            return;
        }

        setCreatingOrder(true);
        try {
            const orderData = {
                client_id: parseInt(selectedCustomer),
                items: orderCart.map((item) => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                })),
            };

            await orderService.create(orderData);
            toast.success("Order created successfully!");
            setOrderCart([]);
            setSelectedCustomer("");
            setShowOrderModal(false);
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Unable to create order",
            );
        } finally {
            setCreatingOrder(false);
        }
    };

    const openModal = (type, item = null) => {
        setModalType(type);
        setEditingItem(item);
        if (item) {
            setFormData(item);
        } else {
            setFormData(
                type === "service"
                    ? {
                          service_name: "",
                          price: "",
                          duration_minutes: "",
                          category: "Hair",
                          description: "",
                      }
                    : type === "product"
                      ? {
                            product_name: "",
                            category: "Retail",
                            unit_price: "",
                            stock_quantity: "",
                            description: "",
                        }
                      : {
                            title: "",
                            content: "",
                            status: "Published",
                        },
            );
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData({});
        // Clean up any object URLs to prevent memory leaks
        if (
            formData.imagePreview &&
            formData.imagePreview.startsWith("blob:")
        ) {
            URL.revokeObjectURL(formData.imagePreview);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalType === "service") {
                if (editingItem) {
                    await serviceService.update(editingItem.id, formData);
                    toast.success("Service updated successfully!");
                } else {
                    await serviceService.create(formData);
                    toast.success("Service added successfully!");
                }
                fetchServices();
            } else if (modalType === "product") {
                if (editingItem) {
                    await productService.update(editingItem.id, formData);
                    toast.success("Product updated successfully!");
                } else {
                    await productService.create(formData);
                    toast.success("Product added successfully!");
                }
                fetchProducts();
            } else if (modalType === "blog") {
                if (editingItem) {
                    await blogService.update(editingItem.id, formData);
                    toast.success("Blog updated successfully!");
                } else {
                    await blogService.create(formData);
                    toast.success("Blog added successfully!");
                }
                fetchBlogs();
            }
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
        }
    };

    const handleDelete = async (type, id) => {
        if (!confirm("Are you sure you want to delete?")) return;
        try {
            if (type === "service") {
                await serviceService.delete(id);
                toast.success("Service deleted successfully!");
                fetchServices();
            } else if (type === "product") {
                await productService.delete(id);
                toast.success("Product deleted successfully!");
                fetchProducts();
            } else if (type === "blog") {
                await blogService.delete(id);
                toast.success("Blog deleted successfully!");
                fetchBlogs();
            }
        } catch (error) {
            toast.error("Unable to delete");
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    // Filter functions
    const filterUsers = (userList) => {
        return userList.filter((u) => {
            const matchSearch =
                searchTerm === "" ||
                u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchSearch;
        });
    };

    const filterAppointments = (aptList) => {
        return aptList.filter((apt) => {
            const matchSearch =
                searchTerm === "" ||
                apt.user?.name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                apt.staff?.name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                apt.details?.some((d) =>
                    d.service?.service_name
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                );
            const matchStatus =
                statusFilter === "all" || apt.status === statusFilter;
            return matchSearch && matchStatus;
        });
    };

    const filterOrders = (orderList) => {
        return orderList.filter((order) => {
            const matchSearch =
                searchTerm === "" ||
                order.client?.name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                order.client?.email
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                order.id?.toString().includes(searchTerm);
            const matchStatus =
                statusFilter === "all" || order.status === statusFilter;
            return matchSearch && matchStatus;
        });
    };

    const filterServices = (serviceList) => {
        return serviceList.filter((service) => {
            return (
                searchTerm === "" ||
                service.service_name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
            );
        });
    };

    const filterProducts = (productList) => {
        return productList.filter((product) => {
            const matchSearch =
                searchTerm === "" ||
                product.product_name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());

            // Filter by stock status
            let matchStatus = true;
            if (statusFilter === "low_stock") {
                matchStatus = product.is_low_stock === true;
            } else if (statusFilter === "out_of_stock") {
                matchStatus = product.is_out_of_stock === true;
            } else if (statusFilter === "in_stock") {
                matchStatus = product.stock_quantity >= 5;
            }
            // statusFilter === 'all' will match all products

            return matchSearch && matchStatus;
        });
    };

    const filterBlogs = (blogList) => {
        return blogList.filter((blog) => {
            const matchSearch =
                searchTerm === "" ||
                blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                blog.content?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus =
                statusFilter === "all" || blog.status === statusFilter;
            return matchSearch && matchStatus;
        });
    };

    const filterContacts = (contactList) => {
        return contactList.filter((contact) => {
            const matchSearch =
                searchTerm === "" ||
                contact.name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                contact.email
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                contact.message
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());
            const matchStatus =
                statusFilter === "all" || contact.status === statusFilter;
            return matchSearch && matchStatus;
        });
    };

    // Reset filters when changing tabs
    useEffect(() => {
        setSearchTerm("");
        setStatusFilter("all");
    }, [activeTab]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loader-zen"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-cream to-white">
            {/* Order Creation Modal */}
            <AnimatePresence>
                {showOrderModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowOrderModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-zen-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                <h2 className="text-2xl font-zen font-bold">
                                    Create Order for Customer
                                </h2>
                                <button
                                    onClick={() => setShowOrderModal(false)}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Left: Product Selection */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-zen-800 mb-4">
                                            Select Product
                                        </h3>
                                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                            {products.map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="p-4 border border-zen-200 rounded-lg hover:border-blue-400 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-16 h-16 bg-zen-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                            {product.image_url ? (
                                                                <img
                                                                    src={
                                                                        product.image_url
                                                                    }
                                                                    alt={
                                                                        product.product_name
                                                                    }
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <Package
                                                                    size={24}
                                                                    className="text-zen-400"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-zen-800 truncate">
                                                                {
                                                                    product.product_name
                                                                }
                                                            </h4>
                                                            <p className="text-sm text-zen-600">
                                                                Stock:{" "}
                                                                {
                                                                    product.stock_quantity
                                                                }
                                                            </p>
                                                            <p className="text-blue-600 font-bold">
                                                                {formatCurrency(
                                                                    product.unit_price,
                                                                )}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                addToOrderCart(
                                                                    product,
                                                                )
                                                            }
                                                            disabled={
                                                                product.stock_quantity ===
                                                                0
                                                            }
                                                            className={`px-3 py-1 rounded text-sm font-medium ${
                                                                product.stock_quantity ===
                                                                0
                                                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                                            }`}
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Order Cart */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-zen-800 mb-4">
                                            Order
                                        </h3>

                                        {/* Customer Selection */}
                                        <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                                            <label className="block text-sm font-semibold text-zen-800 mb-2">
                                                Select Customer *
                                            </label>
                                            <select
                                                value={selectedCustomer}
                                                onChange={(e) =>
                                                    setSelectedCustomer(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-3 py-2 border border-zen-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">
                                                    -- Select Customer --
                                                </option>
                                                {users
                                                    .filter(
                                                        (u) =>
                                                            u.role === "Client",
                                                    )
                                                    .map((customer) => (
                                                        <option
                                                            key={customer.id}
                                                            value={customer.id}
                                                        >
                                                            {customer.name} -{" "}
                                                            {customer.email}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>

                                        {/* Cart Items */}
                                        <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                                            {orderCart.length === 0 ? (
                                                <div className="text-center py-8 text-zen-500">
                                                    <ShoppingCart
                                                        size={48}
                                                        className="mx-auto mb-2 text-zen-300"
                                                    />
                                                    <p>No products yet</p>
                                                </div>
                                            ) : (
                                                orderCart.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center gap-3 p-3 bg-zen-50 rounded-lg"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-zen-800 text-sm truncate">
                                                                {
                                                                    item.product_name
                                                                }
                                                            </h4>
                                                            <p className="text-blue-600 font-bold text-sm">
                                                                {formatCurrency(
                                                                    item.unit_price,
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    updateOrderQuantity(
                                                                        item.id,
                                                                        -1,
                                                                    )
                                                                }
                                                                className="p-1 bg-white rounded hover:bg-zen-200"
                                                            >
                                                                <Minus
                                                                    size={14}
                                                                />
                                                            </button>
                                                            <span className="font-semibold w-8 text-center text-sm">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() =>
                                                                    updateOrderQuantity(
                                                                        item.id,
                                                                        1,
                                                                    )
                                                                }
                                                                className="p-1 bg-white rounded hover:bg-zen-200"
                                                            >
                                                                <Plus
                                                                    size={14}
                                                                />
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                removeFromOrderCart(
                                                                    item.id,
                                                                )
                                                            }
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Total */}
                                        {orderCart.length > 0 && (
                                            <div className="border-t border-zen-200 pt-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-lg font-semibold text-zen-800">
                                                        Total:
                                                    </span>
                                                    <span className="text-2xl font-bold text-blue-600">
                                                        {formatCurrency(
                                                            getOrderTotal(),
                                                        )}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={handleCreateOrder}
                                                    disabled={
                                                        creatingOrder ||
                                                        !selectedCustomer ||
                                                        orderCart.length === 0
                                                    }
                                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {creatingOrder
                                                        ? "Creating..."
                                                        : "Create Order"}
                                                </button>
                                                {!selectedCustomer && (
                                                    <p className="text-red-600 text-sm mt-2 text-center">
                                                        Please select a customer
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="bg-gradient-to-r from-zen-800 to-zen-900 text-white py-8">
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
                                    Admin Dashboard
                                </h1>
                                <p className="text-zen-200">
                                    Hello {user?.name}
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
                {/* Tabs */}
                <div className="flex space-x-4 mb-8 border-b border-zen-200 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`pb-4 px-4 font-medium transition-colors whitespace-nowrap ${
                            activeTab === "overview"
                                ? "text-zen-800 border-b-2 border-zen-800"
                                : "text-zen-400 hover:text-zen-600"
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("statistics")}
                        className={`pb-4 px-4 font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                            activeTab === "statistics"
                                ? "text-zen-800 border-b-2 border-zen-800"
                                : "text-zen-400 hover:text-zen-600"
                        }`}
                    >
                        <BarChart3 size={18} />
                        <span>Statistics</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("customers")}
                        className={`pb-4 px-4 font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                            activeTab === "customers"
                                ? "text-zen-800 border-b-2 border-zen-800"
                                : "text-zen-400 hover:text-zen-600"
                        }`}
                    >
                        <Users size={18} />
                        <span>Customers</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("staff")}
                        className={`pb-4 px-4 font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                            activeTab === "staff"
                                ? "text-zen-800 border-b-2 border-zen-800"
                                : "text-zen-400 hover:text-zen-600"
                        }`}
                    >
                        <TrendingUp size={18} />
                        <span>Staff</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("appointments")}
                        className={`pb-4 px-4 font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                            activeTab === "appointments"
                                ? "text-zen-800 border-b-2 border-zen-800"
                                : "text-zen-400 hover:text-zen-600"
                        }`}
                    >
                        <Calendar size={18} />
                        <span>Appointments</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("contacts")}
                        className={`pb-4 px-4 font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                            activeTab === "contacts"
                                ? "text-zen-800 border-b-2 border-zen-800"
                                : "text-zen-400 hover:text-zen-600"
                        }`}
                    >
                        <Mail size={18} />
                        <span>Messages</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`pb-4 px-4 font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                            activeTab === "orders"
                                ? "text-zen-800 border-b-2 border-zen-800"
                                : "text-zen-400 hover:text-zen-600"
                        }`}
                    >
                        <ShoppingCart size={18} />
                        <span>Orders</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("services")}
                        className={`pb-4 px-4 font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                            activeTab === "services"
                                ? "text-zen-800 border-b-2 border-zen-800"
                                : "text-zen-400 hover:text-zen-600"
                        }`}
                    >
                        <Scissors size={18} />
                        <span>Services</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("products")}
                        className={`pb-4 px-4 font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                            activeTab === "products"
                                ? "text-zen-800 border-b-2 border-zen-800"
                                : "text-zen-400 hover:text-zen-600"
                        }`}
                    >
                        <Package size={18} />
                        <span>Products</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("blogs")}
                        className={`pb-4 px-4 font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                            activeTab === "blogs"
                                ? "text-zen-800 border-b-2 border-zen-800"
                                : "text-zen-400 hover:text-zen-600"
                        }`}
                    >
                        <Newspaper size={18} />
                        <span>Blogs</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("coupons")}
                        className={`pb-4 px-4 font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                            activeTab === "coupons"
                                ? "text-zen-800 border-b-2 border-zen-800"
                                : "text-zen-400 hover:text-zen-600"
                        }`}
                    >
                        <Tag size={18} />
                        <span>Coupons</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={`pb-4 px-4 font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                            activeTab === "settings"
                                ? "text-zen-800 border-b-2 border-zen-800"
                                : "text-zen-400 hover:text-zen-600"
                        }`}
                    >
                        <Settings size={18} />
                        <span>Settings</span>
                    </button>
                </div>

                {/* Statistics Tab */}
                {activeTab === "statistics" && <AdminStatsView />}

                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <>
                        {/* Stats Grid */}
                        <div className="grid md:grid-cols-4 gap-6 mb-12">
                            {}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card-zen"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-zen-600 mb-1">
                                            Total Customers
                                        </p>
                                        <p className="text-3xl font-bold text-zen-800">
                                            {stats?.customers
                                                ?.total_customers || 0}
                                        </p>
                                    </div>
                                    <Users className="w-12 h-12 text-zen-400" />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="card-zen"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-zen-600 mb-1">
                                            Staff
                                        </p>
                                        <p className="text-3xl font-bold text-zen-800">
                                            {stats?.staff?.total_staff || 0}
                                        </p>
                                    </div>
                                    <TrendingUp className="w-12 h-12 text-green-400" />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="card-zen"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-zen-600 mb-1">
                                            Revenue
                                        </p>
                                        <p className="text-3xl font-bold text-zen-800">
                                            {formatCurrency(
                                                stats?.customers
                                                    ?.total_revenue || 0,
                                            )}
                                        </p>
                                    </div>
                                    <DollarSign className="w-12 h-12 text-yellow-400" />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="card-zen"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-zen-600 mb-1">
                                            Appointments
                                        </p>
                                        <p className="text-3xl font-bold text-zen-800">
                                            {stats?.staff?.total_appointments ||
                                                0}
                                        </p>
                                    </div>
                                    <Calendar className="w-12 h-12 text-blue-400" />
                                </div>
                            </motion.div>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="grid md:grid-cols-2 gap-6 mb-12">
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                onClick={() => navigate("/booking")}
                                className="card-zen bg-gradient-to-r from-zen-700 to-zen-800 hover:from-zen-800 hover:to-zen-900 text-white cursor-pointer transition-all hover:shadow-2xl p-8"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="text-left">
                                        <h3 className="text-2xl font-zen font-bold mb-2">
                                            Book Appointment for Customer
                                        </h3>
                                        <p className="text-zen-100">
                                            Create new appointment on behalf of
                                            customer
                                        </p>
                                    </div>
                                    <Calendar className="w-16 h-16 opacity-80" />
                                </div>
                            </motion.button>

                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                onClick={openOrderModal}
                                className="card-zen bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white cursor-pointer transition-all hover:shadow-2xl p-8"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="text-left">
                                        <h3 className="text-2xl font-zen font-bold mb-2">
                                            Purchase Products
                                        </h3>
                                        <p className="text-blue-100">
                                            Create order for customer
                                        </p>
                                    </div>
                                    <Package className="w-16 h-16 opacity-80" />
                                </div>
                            </motion.button>
                        </div>

                        {/* Quick Links */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div
                                onClick={() => setActiveTab("customers")}
                                className="card-zen hover:bg-zen-50 cursor-pointer transition-colors hover:shadow-lg"
                            >
                                <h3 className="text-xl font-zen font-semibold text-zen-800 mb-2">
                                    Customer Management
                                </h3>
                                <p className="text-zen-600">
                                    View detailed customer statistics
                                </p>
                            </div>

                            <div
                                onClick={() => setActiveTab("staff")}
                                className="card-zen hover:bg-zen-50 cursor-pointer transition-colors hover:shadow-lg"
                            >
                                <h3 className="text-xl font-zen font-semibold text-zen-800 mb-2">
                                    Staff Management
                                </h3>
                                <p className="text-zen-600">
                                    View staff performance
                                </p>
                            </div>

                            <div
                                onClick={() => setActiveTab("appointments")}
                                className="card-zen hover:bg-zen-50 cursor-pointer transition-colors hover:shadow-lg"
                            >
                                <h3 className="text-xl font-zen font-semibold text-zen-800 mb-2">
                                    Appointments
                                </h3>
                                <p className="text-zen-600">
                                    View and manage appointments
                                </p>
                            </div>
                        </div>
                    </>
                )}

                {/* Customers Tab */}
                {activeTab === "customers" && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-zen font-bold text-zen-800">
                                Customer Management
                            </h2>
                            <button
                                onClick={openCreateUserModal}
                                className="btn-zen flex items-center space-x-2"
                            >
                                <Plus size={20} />
                                <span>Add User</span>
                            </button>
                        </div>

                        {/* Customer Statistics Cards */}
                        <div className="grid md:grid-cols-4 gap-6 mb-8">
                            <div className="card-zen">
                                <p className="text-zen-600 mb-1">
                                    Total Customers
                                </p>
                                <p className="text-3xl font-bold text-zen-800">
                                    {stats?.customers?.total_customers || 0}
                                </p>
                                <p className="text-sm text-green-600 mt-2">
                                    Active:{" "}
                                    {stats?.customers?.active_customers || 0}
                                </p>
                            </div>
                            <div className="card-zen">
                                <p className="text-zen-600 mb-1">
                                    New This Month
                                </p>
                                <p className="text-3xl font-bold text-zen-800">
                                    {stats?.customers?.new_this_month || 0}
                                </p>
                            </div>
                            <div className="card-zen">
                                <p className="text-zen-600 mb-1">
                                    With Appointments
                                </p>
                                <p className="text-3xl font-bold text-zen-800">
                                    {stats?.customers
                                        ?.customers_with_appointments || 0}
                                </p>
                            </div>
                            <div className="card-zen">
                                <p className="text-zen-600 mb-1">
                                    Have Purchased
                                </p>
                                <p className="text-3xl font-bold text-zen-800">
                                    {stats?.customers?.customers_with_orders ||
                                        0}
                                </p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zen-400"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Customer List */}
                        <div className="card-zen overflow-hidden mb-8">
                            <h3 className="text-lg font-semibold text-zen-800 mb-4 px-6 pt-6">
                                Customer List
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-zen-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Name
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Email
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Phone
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Role
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Created Date
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
                                        {filterUsers(
                                            users.filter(
                                                (u) => u.role === "Client",
                                            ),
                                        ).length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="7"
                                                    className="px-4 py-8 text-center text-zen-600"
                                                >
                                                    {searchTerm
                                                        ? "No matching customers found"
                                                        : "No customers yet"}
                                                </td>
                                            </tr>
                                        ) : (
                                            filterUsers(
                                                users.filter(
                                                    (u) => u.role === "Client",
                                                ),
                                            ).map((customer) => (
                                                <tr
                                                    key={customer.id}
                                                    className="border-t border-zen-100 hover:bg-zen-50"
                                                >
                                                    <td className="px-4 py-3 text-zen-800 font-medium">
                                                        {customer.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-zen-600">
                                                        {customer.email}
                                                    </td>
                                                    <td className="px-4 py-3 text-zen-600">
                                                        {customer.phone_number ||
                                                            "N/A"}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <select
                                                            value={
                                                                customer.role
                                                            }
                                                            onChange={(e) =>
                                                                handleChangeRole(
                                                                    customer.id,
                                                                    customer.role,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="px-3 py-1 border border-zen-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zen-500"
                                                        >
                                                            <option value="Client">
                                                                Customer
                                                            </option>
                                                            <option value="Stylist">
                                                                Stylist
                                                            </option>
                                                            <option value="Admin">
                                                                Administrator
                                                            </option>
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3 text-zen-600">
                                                        {format(
                                                            new Date(
                                                                customer.created_at,
                                                            ),
                                                            "dd/MM/yyyy",
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-sm ${
                                                                customer.is_active
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-red-100 text-red-800"
                                                            }`}
                                                        >
                                                            {customer.is_active
                                                                ? "Active"
                                                                : "Locked"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() =>
                                                                    openUserEditModal(
                                                                        customer,
                                                                    )
                                                                }
                                                                className="px-3 py-1 rounded text-sm font-medium bg-zen-100 text-zen-700 hover:bg-zen-200"
                                                            >
                                                                <Edit
                                                                    size={16}
                                                                    className="inline mr-1"
                                                                />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleToggleUserStatus(
                                                                        customer.id,
                                                                        customer.is_active,
                                                                    )
                                                                }
                                                                className={`px-3 py-1 rounded text-sm font-medium ${
                                                                    customer.is_active
                                                                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                                                                        : "bg-green-100 text-green-700 hover:bg-green-200"
                                                                }`}
                                                            >
                                                                {customer.is_active
                                                                    ? "Lock"
                                                                    : "Unlock"}
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleResetPassword(
                                                                        customer.id,
                                                                        customer.name,
                                                                    )
                                                                }
                                                                className="px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                            >
                                                                Reset PW
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Revenue Statistics */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card-zen">
                                <h3 className="text-lg font-semibold text-zen-800 mb-4">
                                    Revenue
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-zen-600">
                                            Total Revenue:
                                        </span>
                                        <span className="text-xl font-bold text-green-600">
                                            {formatCurrency(
                                                stats?.customers
                                                    ?.total_revenue || 0,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zen-600">
                                            Avg Spend/Customer:
                                        </span>
                                        <span className="text-lg font-semibold text-zen-800">
                                            {formatCurrency(
                                                stats?.customers
                                                    ?.avg_spending_per_customer ||
                                                    0,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="card-zen">
                                <h3 className="text-lg font-semibold text-zen-800 mb-4">
                                    Status
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-zen-600">
                                            Active:
                                        </span>
                                        <span className="text-lg font-semibold text-green-600">
                                            {stats?.customers
                                                ?.active_customers || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zen-600">
                                            Inactive:
                                        </span>
                                        <span className="text-lg font-semibold text-red-600">
                                            {stats?.customers
                                                ?.inactive_customers || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Staff Tab */}
                {activeTab === "staff" && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-zen font-bold text-zen-800">
                                Staff Management
                            </h2>
                            <button
                                onClick={openCreateUserModal}
                                className="btn-zen flex items-center space-x-2"
                            >
                                <Plus size={20} />
                                <span>Add Staff</span>
                            </button>
                        </div>

                        {/* Staff Statistics Cards */}
                        <div className="grid md:grid-cols-4 gap-6 mb-8">
                            <div className="card-zen">
                                <p className="text-zen-600 mb-1">Total Staff</p>
                                <p className="text-3xl font-bold text-zen-800">
                                    {stats?.staff?.total_staff || 0}
                                </p>
                            </div>
                            <div className="card-zen">
                                <p className="text-zen-600 mb-1">Working</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {stats?.staff?.active_staff || 0}
                                </p>
                            </div>
                            <div className="card-zen">
                                <p className="text-zen-600 mb-1">Inactive</p>
                                <p className="text-3xl font-bold text-red-600">
                                    {stats?.staff?.inactive_staff || 0}
                                </p>
                            </div>
                            <div className="card-zen">
                                <p className="text-zen-600 mb-1">
                                    Total Appointments
                                </p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {stats?.staff?.total_appointments || 0}
                                </p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zen-400"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Staff List */}
                        <div className="card-zen overflow-hidden mb-8">
                            <h3 className="text-lg font-semibold text-zen-800 mb-4 px-6 pt-6">
                                Staff List
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-zen-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Name
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Email
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Phone
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Role
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Created Date
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
                                        {filterUsers(
                                            users.filter((u) =>
                                                ["Admin", "Stylist"].includes(
                                                    u.role,
                                                ),
                                            ),
                                        ).length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="7"
                                                    className="px-4 py-8 text-center text-zen-600"
                                                >
                                                    {searchTerm
                                                        ? "No matching staff found"
                                                        : "No staff yet"}
                                                </td>
                                            </tr>
                                        ) : (
                                            filterUsers(
                                                users.filter((u) =>
                                                    [
                                                        "Admin",
                                                        "Stylist",
                                                    ].includes(u.role),
                                                ),
                                            ).map((staff) => (
                                                <tr
                                                    key={staff.id}
                                                    className="border-t border-zen-100 hover:bg-zen-50"
                                                >
                                                    <td className="px-4 py-3 text-zen-800 font-medium">
                                                        {staff.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-zen-600">
                                                        {staff.email}
                                                    </td>
                                                    <td className="px-4 py-3 text-zen-600">
                                                        {staff.phone_number ||
                                                            "N/A"}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <select
                                                            value={staff.role}
                                                            onChange={(e) =>
                                                                handleChangeRole(
                                                                    staff.id,
                                                                    staff.role,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="px-3 py-1 border border-zen-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zen-500"
                                                        >
                                                            <option value="Client">
                                                                Customer
                                                            </option>
                                                            <option value="Stylist">
                                                                Stylist
                                                            </option>
                                                            <option value="Admin">
                                                                Administrator
                                                            </option>
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3 text-zen-600">
                                                        {format(
                                                            new Date(
                                                                staff.created_at,
                                                            ),
                                                            "dd/MM/yyyy",
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-sm ${
                                                                staff.is_active
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-red-100 text-red-800"
                                                            }`}
                                                        >
                                                            {staff.is_active
                                                                ? "Active"
                                                                : "Locked"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() =>
                                                                    openUserEditModal(
                                                                        staff,
                                                                    )
                                                                }
                                                                className="px-3 py-1 rounded text-sm font-medium bg-zen-100 text-zen-700 hover:bg-zen-200"
                                                            >
                                                                <Edit
                                                                    size={16}
                                                                    className="inline mr-1"
                                                                />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleToggleUserStatus(
                                                                        staff.id,
                                                                        staff.is_active,
                                                                    )
                                                                }
                                                                className={`px-3 py-1 rounded text-sm font-medium ${
                                                                    staff.is_active
                                                                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                                                                        : "bg-green-100 text-green-700 hover:bg-green-200"
                                                                }`}
                                                            >
                                                                {staff.is_active
                                                                    ? "Lock"
                                                                    : "Unlock"}
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleResetPassword(
                                                                        staff.id,
                                                                        staff.name,
                                                                    )
                                                                }
                                                                className="px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                            >
                                                                Reset PW
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Staff by Role */}
                        <div className="card-zen">
                            <h3 className="text-lg font-semibold text-zen-800 mb-4">
                                Distribution by Role
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {stats?.staff?.by_role?.map((role, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-zen-50 rounded-lg"
                                    >
                                        <div>
                                            <p className="text-zen-600 mb-1">
                                                {role.role === "Admin"
                                                    ? "Administrator"
                                                    : "Stylist"}
                                            </p>
                                            <p className="text-2xl font-bold text-zen-800">
                                                {role.count}
                                            </p>
                                        </div>
                                        <div
                                            className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                                role.role === "Admin"
                                                    ? "bg-purple-100"
                                                    : "bg-blue-100"
                                            }`}
                                        >
                                            {role.role === "Admin" ? (
                                                <Users
                                                    className="text-purple-600"
                                                    size={32}
                                                />
                                            ) : (
                                                <Scissors
                                                    className="text-blue-600"
                                                    size={32}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 p-4 bg-gradient-to-r from-zen-50 to-blue-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-zen-600">
                                        Active Rate:
                                    </span>
                                    <span className="text-2xl font-bold text-zen-800">
                                        {stats?.staff?.active_percentage || 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Appointments Tab */}
                {activeTab === "appointments" && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-zen font-bold text-zen-800">
                                Appointment Management
                            </h2>
                            <button
                                onClick={openCreateAppointmentModal}
                                className="btn-zen flex items-center space-x-2"
                            >
                                <Plus size={18} />
                                <span>Create Appointment</span>
                            </button>
                        </div>

                        {/* Search and Filter */}
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zen-400"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    placeholder="Search by customer name or service..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="px-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="card-zen overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-zen-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Customer
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Staff
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Service
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Date & Time
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Total Amount
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
                                        {filterAppointments(appointments)
                                            .length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="7"
                                                    className="px-4 py-8 text-center text-zen-600"
                                                >
                                                    {searchTerm ||
                                                    statusFilter !== "all"
                                                        ? "No matching appointments found"
                                                        : "No appointments yet"}
                                                </td>
                                            </tr>
                                        ) : (
                                            filterAppointments(
                                                appointments,
                                            ).map((apt) => (
                                                <tr
                                                    key={apt.appointment_id}
                                                    className="border-t border-zen-100 hover:bg-zen-50"
                                                >
                                                    <td className="px-4 py-3 text-zen-800">
                                                        {apt.user?.name ||
                                                            "N/A"}
                                                    </td>
                                                    <td className="px-4 py-3 text-zen-800">
                                                        {apt.staff?.name ||
                                                            "N/A"}
                                                    </td>
                                                    <td className="px-4 py-3 text-zen-600">
                                                        {apt.details
                                                            ?.map(
                                                                (d) =>
                                                                    d.service
                                                                        ?.service_name,
                                                            )
                                                            .join(", ") ||
                                                            "N/A"}
                                                    </td>
                                                    <td className="px-4 py-3 text-zen-600">
                                                        {format(
                                                            new Date(
                                                                apt.appointment_date,
                                                            ),
                                                            "dd/MM/yyyy HH:mm",
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-zen-800 font-semibold">
                                                        {formatCurrency(
                                                            apt.total_amount,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <select
                                                            value={apt.status}
                                                            onChange={(e) =>
                                                                handleUpdateStatus(
                                                                    apt.appointment_id,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={`px-3 py-1 rounded-full text-sm border-0 cursor-pointer ${
                                                                apt.status ===
                                                                "Pending"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : apt.status ===
                                                                        "Confirmed"
                                                                      ? "bg-blue-100 text-blue-800"
                                                                      : apt.status ===
                                                                          "Completed"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-red-100 text-red-800"
                                                            }`}
                                                        >
                                                            <option value="Pending">
                                                                Pending
                                                            </option>
                                                            <option value="Confirmed">
                                                                Confirmed
                                                            </option>
                                                            <option value="Completed">
                                                                Completed
                                                            </option>
                                                            <option value="Cancelled">
                                                                Cancelled
                                                            </option>
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => {
                                                                const details =
                                                                    apt.details
                                                                        ?.map(
                                                                            (
                                                                                d,
                                                                            ) =>
                                                                                `- ${d.service?.service_name}: ${formatCurrency(d.price)}`,
                                                                        )
                                                                        .join(
                                                                            "\n",
                                                                        ) ||
                                                                    "No details";
                                                                alert(
                                                                    `Appointment Details:\n\nCustomer: ${apt.user?.name}\nPhone: ${apt.user?.phone_number || "N/A"}\nStaff: ${apt.staff?.name}\nServices:\n${details}\n\nNotes: ${apt.notes || "None"}`,
                                                                );
                                                            }}
                                                            className="text-zen-600 hover:text-zen-800 font-medium"
                                                        >
                                                            Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contacts Tab */}
                {activeTab === "contacts" && (
                    <div>
                        <h2 className="text-2xl font-zen font-bold text-zen-800 mb-6">
                            Contact Message Management
                        </h2>

                        {/* Search and Filter */}
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zen-400"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    placeholder="Search by name, email or message..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="px-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="New">New</option>
                                <option value="Read">Read</option>
                                <option value="Replied">Replied</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                        </div>

                        <div className="card-zen overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-zen-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Name
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Email
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Phone Number
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Message
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Sent Date
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
                                        {filterContacts(contacts).length ===
                                        0 ? (
                                            <tr>
                                                <td
                                                    colSpan="7"
                                                    className="px-4 py-8 text-center text-zen-600"
                                                >
                                                    {searchTerm ||
                                                    statusFilter !== "all"
                                                        ? "No matching messages found"
                                                        : "No messages yet"}
                                                </td>
                                            </tr>
                                        ) : (
                                            filterContacts(contacts).map(
                                                (contact) => (
                                                    <tr
                                                        key={contact.contact_id}
                                                        className="border-t border-zen-100 hover:bg-zen-50"
                                                    >
                                                        <td className="px-4 py-3 text-zen-800 font-medium">
                                                            {contact.name}
                                                        </td>
                                                        <td className="px-4 py-3 text-zen-600">
                                                            {contact.email}
                                                        </td>
                                                        <td className="px-4 py-3 text-zen-600">
                                                            {contact.phone ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="px-4 py-3 text-zen-600 max-w-xs truncate">
                                                            {contact.message}
                                                        </td>
                                                        <td className="px-4 py-3 text-zen-600 whitespace-nowrap">
                                                            {format(
                                                                new Date(
                                                                    contact.created_at,
                                                                ),
                                                                "dd/MM/yyyy HH:mm",
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <select
                                                                value={
                                                                    contact.status
                                                                }
                                                                onChange={(e) =>
                                                                    handleUpdateContactStatus(
                                                                        contact.contact_id,
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className={`px-3 py-1 rounded-full text-sm border-0 cursor-pointer ${
                                                                    contact.status ===
                                                                    "New"
                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                        : contact.status ===
                                                                            "Read"
                                                                          ? "bg-blue-100 text-blue-800"
                                                                          : contact.status ===
                                                                              "Replied"
                                                                            ? "bg-green-100 text-green-800"
                                                                            : "bg-gray-100 text-gray-800"
                                                                }`}
                                                            >
                                                                <option value="New">
                                                                    New
                                                                </option>
                                                                <option value="Read">
                                                                    Read
                                                                </option>
                                                                <option value="Replied">
                                                                    Replied
                                                                </option>
                                                                <option value="Resolved">
                                                                    Resolved
                                                                </option>
                                                            </select>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => {
                                                                        const details = `From: ${contact.name}\nEmail: ${contact.email}\nPhone: ${contact.phone || "N/A"}\nDate: ${format(new Date(contact.created_at), "dd/MM/yyyy HH:mm")}\n\nMessage:\n${contact.message}\n\n${contact.admin_reply ? `Reply:\n${contact.admin_reply}\n(By: ${contact.replied_by_user?.name || "N/A"})` : "Not replied yet"}`;
                                                                        alert(
                                                                            details,
                                                                        );
                                                                    }}
                                                                    className="text-zen-600 hover:text-zen-800 font-medium"
                                                                >
                                                                    View
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleReplyContact(
                                                                            contact.contact_id,
                                                                        )
                                                                    }
                                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                                >
                                                                    Reply
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleDeleteContact(
                                                                            contact.contact_id,
                                                                        )
                                                                    }
                                                                    className="text-red-600 hover:text-red-800 font-medium"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ),
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === "orders" && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-zen font-bold text-zen-800">
                                Order Management
                            </h2>
                            <button
                                onClick={openOrderModal}
                                className="btn-zen flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus size={20} />
                                <span>Create New Order</span>
                            </button>
                        </div>

                        {/* Search and Filter */}
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zen-400"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    placeholder="Search by order code, customer name or email..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="px-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="card-zen overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-zen-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Order Code
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Customer
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Products
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Total Amount
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Created Date
                                            </th>
                                            <th className="px-4 py-3 text-left text-zen-800">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filterOrders(orders).length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="7"
                                                    className="px-4 py-8 text-center text-zen-600"
                                                >
                                                    {searchTerm ||
                                                    statusFilter !== "all"
                                                        ? "No matching orders found"
                                                        : "No orders yet"}
                                                </td>
                                            </tr>
                                        ) : (
                                            filterOrders(orders).map(
                                                (order) => (
                                                    <tr
                                                        key={order.id}
                                                        className="border-t border-zen-100 hover:bg-zen-50"
                                                    >
                                                        <td className="px-4 py-3 text-zen-800 font-medium">
                                                            #{order.id}
                                                        </td>
                                                        <td className="px-4 py-3 text-zen-800">
                                                            {order.client
                                                                ?.name || "N/A"}
                                                            <br />
                                                            <span className="text-sm text-zen-600">
                                                                {
                                                                    order.client
                                                                        ?.email
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-zen-600">
                                                            {order.order_details
                                                                ?.map(
                                                                    (detail) =>
                                                                        detail
                                                                            .product
                                                                            ?.product_name,
                                                                )
                                                                .filter(Boolean)
                                                                .join(", ") ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="px-4 py-3 text-zen-800 font-semibold">
                                                            {formatCurrency(
                                                                order.total_amount ||
                                                                    0,
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <select
                                                                value={
                                                                    order.status
                                                                }
                                                                onChange={(e) =>
                                                                    handleUpdateOrderStatus(
                                                                        order.id,
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                disabled={[
                                                                    "Completed",
                                                                    "Cancelled",
                                                                ].includes(
                                                                    order.status,
                                                                )}
                                                                className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${
                                                                    [
                                                                        "Completed",
                                                                        "Cancelled",
                                                                    ].includes(
                                                                        order.status,
                                                                    )
                                                                        ? "cursor-not-allowed opacity-75"
                                                                        : "cursor-pointer"
                                                                } ${
                                                                    order.status ===
                                                                    "Pending"
                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                        : order.status ===
                                                                            "Processing"
                                                                          ? "bg-blue-100 text-blue-800"
                                                                          : order.status ===
                                                                              "Completed"
                                                                            ? "bg-green-100 text-green-800"
                                                                            : "bg-red-100 text-red-800"
                                                                }`}
                                                            >
                                                                <option value="Pending">
                                                                    Pending
                                                                </option>
                                                                <option value="Processing">
                                                                    Processing
                                                                </option>
                                                                <option value="Completed">
                                                                    Completed
                                                                </option>
                                                                <option value="Cancelled">
                                                                    Cancelled
                                                                </option>
                                                            </select>
                                                        </td>
                                                        <td className="px-4 py-3 text-zen-600">
                                                            {format(
                                                                new Date(
                                                                    order.created_at,
                                                                ),
                                                                "dd/MM/yyyy HH:mm",
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <button
                                                                onClick={() => {
                                                                    const details =
                                                                        order.order_details
                                                                            ?.map(
                                                                                (
                                                                                    d,
                                                                                ) =>
                                                                                    `- ${d.product?.product_name}: ${d.quantity} x ${formatCurrency(d.unit_price)}`,
                                                                            )
                                                                            .join(
                                                                                "\n",
                                                                            ) ||
                                                                        "No details available";
                                                                    alert(
                                                                        `Order Details #${order.id}\n\n${details}\n\nTotal: ${formatCurrency(order.total_amount)}`,
                                                                    );
                                                                }}
                                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                                            >
                                                                View Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ),
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Services Tab */}
                {activeTab === "services" && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-zen font-bold text-zen-800">
                                Service Management
                            </h2>
                            <button
                                onClick={() => openModal("service")}
                                className="btn-zen flex items-center space-x-2"
                            >
                                <Plus size={20} />
                                <span>Add Service</span>
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zen-400"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    placeholder="Search services..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {filterServices(services).length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-zen-600">
                                    {searchTerm
                                        ? "No matching services found"
                                        : "No services yet"}
                                </p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filterServices(services).map((service) => (
                                    <div
                                        key={service.id}
                                        className="card-zen overflow-hidden"
                                    >
                                        {service.image_url && (
                                            <img
                                                src={service.image_url}
                                                alt={service.service_name}
                                                className="w-full h-48 object-cover mb-4 rounded-lg"
                                            />
                                        )}
                                        <h3 className="text-lg font-semibold text-zen-800 mb-2">
                                            {service.service_name}
                                        </h3>
                                        <p className="text-zen-600 text-sm mb-3">
                                            {service.description}
                                        </p>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xl font-bold text-zen-800">
                                                {formatCurrency(service.price)}
                                            </span>
                                            <span className="text-sm text-zen-500">
                                                {service.duration_minutes}{" "}
                                                minutes
                                            </span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() =>
                                                    openModal(
                                                        "service",
                                                        service,
                                                    )
                                                }
                                                className="flex-1 px-3 py-2 bg-zen-100 text-zen-800 rounded-lg hover:bg-zen-200 transition-colors flex items-center justify-center space-x-1"
                                            >
                                                <Edit size={16} />
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        "service",
                                                        service.id,
                                                    )
                                                }
                                                className="px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === "products" && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-zen font-bold text-zen-800">
                                Product Management
                            </h2>
                            <button
                                onClick={() => openModal("product")}
                                className="btn-zen flex items-center space-x-2"
                            >
                                <Plus size={20} />
                                <span>Add Product</span>
                            </button>
                        </div>

                        {/* Low Stock Alert */}
                        {products.filter(
                            (p) => p.is_low_stock || p.is_out_of_stock,
                        ).length > 0 && (
                            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="w-5 h-5 text-orange-600"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-orange-800">
                                            Low Stock Alert
                                        </h3>
                                        <div className="mt-2 text-sm text-orange-700">
                                            <ul className="list-disc pl-5 space-y-1">
                                                {products.filter(
                                                    (p) => p.is_out_of_stock,
                                                ).length > 0 && (
                                                    <li>
                                                        <strong>
                                                            {
                                                                products.filter(
                                                                    (p) =>
                                                                        p.is_out_of_stock,
                                                                ).length
                                                            }
                                                        </strong>{" "}
                                                        product(s){" "}
                                                        <strong>
                                                            out of stock
                                                        </strong>
                                                    </li>
                                                )}
                                                {products.filter(
                                                    (p) => p.is_low_stock,
                                                ).length > 0 && (
                                                    <li>
                                                        <strong>
                                                            {
                                                                products.filter(
                                                                    (p) =>
                                                                        p.is_low_stock,
                                                                ).length
                                                            }
                                                        </strong>{" "}
                                                        product(s){" "}
                                                        <strong>
                                                            low stock
                                                        </strong>{" "}
                                                        (below 5)
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Search and Filter Bar */}
                        <div className="mb-4 flex gap-3">
                            <div className="relative flex-1">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zen-400"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="px-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-500 focus:border-transparent"
                            >
                                <option value="all">All Products</option>
                                <option value="in_stock">In Stock</option>
                                <option value="low_stock">
                                    Low Stock ({"<"}5)
                                </option>
                                <option value="out_of_stock">
                                    Out of Stock
                                </option>
                            </select>
                        </div>

                        {filterProducts(products).length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-zen-600">
                                    {searchTerm
                                        ? "No matching products found"
                                        : "No products yet"}
                                </p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filterProducts(products).map((product) => (
                                    <div
                                        key={product.id}
                                        className="card-zen overflow-hidden"
                                    >
                                        {product.image_url && (
                                            <img
                                                src={product.image_url}
                                                alt={product.product_name}
                                                className="w-full h-48 object-cover mb-4 rounded-lg"
                                            />
                                        )}
                                        <h3 className="text-lg font-semibold text-zen-800 mb-2">
                                            {product.product_name}
                                        </h3>
                                        <p className="text-zen-600 text-sm mb-3">
                                            {product.description}
                                        </p>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xl font-bold text-zen-800">
                                                {formatCurrency(
                                                    product.unit_price,
                                                )}
                                            </span>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-sm text-zen-500">
                                                    Stock:{" "}
                                                    {product.stock_quantity}
                                                </span>
                                                {/* Stock Status Badge */}
                                                {product.stock_status && (
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                            product.stock_status
                                                                .color === "red"
                                                                ? "bg-red-100 text-red-700"
                                                                : product
                                                                        .stock_status
                                                                        .color ===
                                                                    "orange"
                                                                  ? "bg-orange-100 text-orange-700"
                                                                  : "bg-green-100 text-green-700"
                                                        }`}
                                                    >
                                                        {
                                                            product.stock_status
                                                                .label
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() =>
                                                    openModal(
                                                        "product",
                                                        product,
                                                    )
                                                }
                                                className="flex-1 px-3 py-2 bg-zen-100 text-zen-800 rounded-lg hover:bg-zen-200 transition-colors flex items-center justify-center space-x-1"
                                            >
                                                <Edit size={16} />
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        "product",
                                                        product.id,
                                                    )
                                                }
                                                className="px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Blogs Tab */}
                {activeTab === "blogs" && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-zen font-bold text-zen-800">
                                News & Promotions Management
                            </h2>
                            <button
                                onClick={() => openModal("blog")}
                                className="btn-zen flex items-center space-x-2"
                            >
                                <Plus size={20} />
                                <span>Add News</span>
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zen-400"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    placeholder="Search news..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="mb-4">
                            <label className="text-zen-600 text-sm font-medium mr-2">
                                Status:
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="px-3 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-500"
                            >
                                <option value="all">All</option>
                                <option value="Published">Published</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>

                        {filterBlogs(blogs).length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-zen-600">
                                    {searchTerm || statusFilter
                                        ? "No matching news found"
                                        : "No news yet"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filterBlogs(blogs).map((blog) => (
                                    <div key={blog.id} className="card-zen">
                                        <div className="flex justify-between items-start gap-4">
                                            {blog.image_url && (
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={blog.image_url}
                                                        alt={blog.title}
                                                        className="w-32 h-32 object-cover rounded-lg"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-xl font-semibold text-zen-800">
                                                        {blog.title}
                                                    </h3>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                            blog.status ===
                                                            "Published"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}
                                                    >
                                                        {blog.status ===
                                                        "Published"
                                                            ? "Published"
                                                            : "Draft"}
                                                    </span>
                                                </div>
                                                <p className="text-zen-600 mb-3 line-clamp-2">
                                                    {blog.content}
                                                </p>
                                                <div className="flex items-center space-x-4 text-sm text-zen-500">
                                                    <span>
                                                        Author:{" "}
                                                        {blog.author?.name ||
                                                            "N/A"}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {new Date(
                                                            blog.created_at,
                                                        ).toLocaleDateString(
                                                            "vi-VN",
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() =>
                                                        openModal("blog", blog)
                                                    }
                                                    className="p-2 bg-zen-100 text-zen-800 rounded-lg hover:bg-zen-200 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            "blog",
                                                            blog.id,
                                                        )
                                                    }
                                                    className="p-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Coupons Tab */}
                {activeTab === "coupons" && (
                    <div>
                        <CouponManagement />
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === "settings" && (
                    <div>
                        <h2 className="text-2xl font-zen font-bold text-zen-800 mb-6">
                            Salon Capacity Settings
                        </h2>

                        <div className="card-zen">
                            <form onSubmit={handleUpdateSettings}>
                                <div className="space-y-6">
                                    {salonSettings.map((setting) => (
                                        <div
                                            key={setting.id}
                                            className="border-b border-zen-100 pb-6 last:border-0"
                                        >
                                            <label className="block text-zen-800 font-semibold mb-2">
                                                {setting.key
                                                    .split("_")
                                                    .map(
                                                        (word) =>
                                                            word
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                            word.slice(1),
                                                    )
                                                    .join(" ")}
                                            </label>
                                            <p className="text-sm text-zen-600 mb-3">
                                                {setting.description}
                                            </p>

                                            {setting.type === "boolean" ? (
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSettingsValues({
                                                                ...settingsValues,
                                                                [setting.key]: true,
                                                            })
                                                        }
                                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                            settingsValues[
                                                                setting.key
                                                            ] === true ||
                                                            settingsValues[
                                                                setting.key
                                                            ] === "true"
                                                                ? "bg-zen-800 text-white"
                                                                : "bg-zen-100 text-zen-600 hover:bg-zen-200"
                                                        }`}
                                                    >
                                                        Enabled
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSettingsValues({
                                                                ...settingsValues,
                                                                [setting.key]: false,
                                                            })
                                                        }
                                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                            settingsValues[
                                                                setting.key
                                                            ] === false ||
                                                            settingsValues[
                                                                setting.key
                                                            ] === "false"
                                                                ? "bg-zen-800 text-white"
                                                                : "bg-zen-100 text-zen-600 hover:bg-zen-200"
                                                        }`}
                                                    >
                                                        Disabled
                                                    </button>
                                                </div>
                                            ) : setting.type === "integer" ? (
                                                <input
                                                    type="number"
                                                    value={
                                                        settingsValues[
                                                            setting.key
                                                        ] || ""
                                                    }
                                                    onChange={(e) =>
                                                        setSettingsValues({
                                                            ...settingsValues,
                                                            [setting.key]:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="input-zen max-w-xs"
                                                    min="0"
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={
                                                        settingsValues[
                                                            setting.key
                                                        ] || ""
                                                    }
                                                    onChange={(e) =>
                                                        setSettingsValues({
                                                            ...settingsValues,
                                                            [setting.key]:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="input-zen max-w-xs"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-zen-200">
                                    <button type="submit" className="btn-zen">
                                        Save Settings
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                                <Settings size={20} className="mr-2" />
                                Settings Information
                            </h3>
                            <ul className="text-sm text-blue-800 space-y-2">
                                <li>
                                    <strong>
                                        Max Concurrent Appointments:
                                    </strong>{" "}
                                    Number of customers that can be served at
                                    the same time
                                </li>
                                <li>
                                    <strong>Max Daily Appointments:</strong>{" "}
                                    Maximum total appointments per day
                                </li>
                                <li>
                                    <strong>Working Hours:</strong> Salon
                                    opening and closing time (format: HH:MM)
                                </li>
                                <li>
                                    <strong>Enable Capacity Check:</strong>{" "}
                                    Automatically check and prevent overbooking
                                </li>
                                <li>
                                    <strong>Capacity Warning Threshold:</strong>{" "}
                                    Show warning when capacity reaches this
                                    percentage
                                </li>
                                <li>
                                    <strong>Enable Waiting List:</strong> Allow
                                    customers to join waiting list when fully
                                    booked
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="text-2xl font-zen font-bold text-zen-800 mb-6">
                                {editingItem ? "Update" : "Add"}{" "}
                                {modalType === "service"
                                    ? "Service"
                                    : modalType === "product"
                                      ? "Product"
                                      : "News"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {modalType === "service" ? (
                                    <>
                                        <div>
                                            <label className="block text-zen-800 font-medium mb-2">
                                                Service Name
                                            </label>
                                            <input
                                                type="text"
                                                value={
                                                    formData.service_name || ""
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        service_name:
                                                            e.target.value,
                                                    })
                                                }
                                                className="input-zen"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-zen-800 font-medium mb-2">
                                                Price
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.price || ""}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        price: e.target.value,
                                                    })
                                                }
                                                className="input-zen"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-zen-800 font-medium mb-2">
                                                Duration (minutes)
                                            </label>
                                            <input
                                                type="number"
                                                value={
                                                    formData.duration_minutes ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        duration_minutes:
                                                            e.target.value,
                                                    })
                                                }
                                                className="input-zen"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-zen-800 font-medium mb-2">
                                                Category
                                            </label>
                                            <select
                                                value={
                                                    formData.category || "Hair"
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        category:
                                                            e.target.value,
                                                    })
                                                }
                                                className="input-zen"
                                            >
                                                <option value="Hair">
                                                    Hair
                                                </option>
                                                <option value="Nails">
                                                    Nails
                                                </option>
                                                <option value="Spa">Spa</option>
                                                <option value="Makeup">
                                                    Makeup
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-zen-800 font-medium mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={
                                                    formData.description || ""
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        description:
                                                            e.target.value,
                                                    })
                                                }
                                                className="input-zen"
                                                rows="3"
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-zen-800 font-medium mb-2">
                                                Image
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file =
                                                        e.target.files[0];
                                                    if (file) {
                                                        setFormData({
                                                            ...formData,
                                                            image: file,
                                                            imagePreview:
                                                                URL.createObjectURL(
                                                                    file,
                                                                ),
                                                        });
                                                    }
                                                }}
                                                className="input-zen"
                                            />
                                            {(formData.imagePreview ||
                                                formData.image_url ||
                                                formData.image) && (
                                                <img
                                                    src={
                                                        formData.imagePreview ||
                                                        formData.image_url ||
                                                        `http://127.0.0.1:8000/storage/${formData.image}`
                                                    }
                                                    alt="Preview"
                                                    className="mt-2 w-full h-40 object-cover rounded-lg"
                                                />
                                            )}
                                        </div>
                                    </>
                                ) : modalType === "product" ? (
                                    <>
                                        <div>
                                            <label className="block text-zen-800 font-medium mb-2">
                                                Product Name
                                            </label>
                                            <input
                                                type="text"
                                                value={
                                                    formData.product_name || ""
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        product_name:
                                                            e.target.value,
                                                    })
                                                }
                                                className="input-zen"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-zen-800 font-medium mb-2">
                                                Price
                                            </label>
                                            <input
                                                type="number"
                                                value={
                                                    formData.unit_price || ""
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        unit_price:
                                                            e.target.value,
                                                    })
                                                }
                                                className="input-zen"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-zen-800 font-medium mb-2">
                                                Quantity
                                            </label>
                                            <input
                                                type="number"
                                                value={
                                                    formData.stock_quantity ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        stock_quantity:
                                                            e.target.value,
                                                    })
                                                }
                                                className="input-zen"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-zen-800 font-medium mb-2">
                                                Category
                                            </label>
                                            <select
                                                value={
                                                    formData.category ||
                                                    "Retail"
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        category:
                                                            e.target.value,
                                                    })
                                                }
                                                className="input-zen"
                                            >
                                                <option value="Retail">
                                                    Retail
                                                </option>
                                                <option value="Wholesale">
                                                    Wholesale
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-zen-800 font-medium mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={
                                                    formData.description || ""
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        description:
                                                            e.target.value,
                                                    })
                                                }
                                                className="input-zen"
                                                rows="3"
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-zen-800 font-medium mb-2">
                                                Image
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file =
                                                        e.target.files[0];
                                                    if (file) {
                                                        setFormData({
                                                            ...formData,
                                                            image: file,
                                                            imagePreview:
                                                                URL.createObjectURL(
                                                                    file,
                                                                ),
                                                        });
                                                    }
                                                }}
                                                className="input-zen"
                                            />
                                            {(formData.imagePreview ||
                                                formData.image_url ||
                                                formData.image) && (
                                                <img
                                                    src={
                                                        formData.imagePreview ||
                                                        formData.image_url ||
                                                        `http://127.0.0.1:8000/storage/${formData.image}`
                                                    }
                                                    alt="Preview"
                                                    className="mt-2 w-full h-40 object-cover rounded-lg"
                                                />
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-zen-800 font-medium mb-2">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.title || ""}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        title: e.target.value,
                                                    })
                                                }
                                                className="input-zen"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-zen-800 font-medium mb-2">
                                                Content
                                            </label>
                                            <textarea
                                                value={formData.content || ""}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        content: e.target.value,
                                                    })
                                                }
                                                className="input-zen"
                                                rows="8"
                                                required
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-zen-800 font-medium mb-2">
                                                Image
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file =
                                                        e.target.files[0];
                                                    if (file) {
                                                        setFormData({
                                                            ...formData,
                                                            image: file,
                                                            imagePreview:
                                                                URL.createObjectURL(
                                                                    file,
                                                                ),
                                                        });
                                                    }
                                                }}
                                                className="input-zen"
                                            />
                                            {(formData.imagePreview ||
                                                formData.image_url ||
                                                formData.image) && (
                                                <img
                                                    src={
                                                        formData.imagePreview ||
                                                        formData.image_url ||
                                                        `http://127.0.0.1:8000/storage/${formData.image}`
                                                    }
                                                    alt="Preview"
                                                    className="mt-2 w-full h-48 object-cover rounded-lg"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-zen-800 font-medium mb-2">
                                                Status
                                            </label>
                                            <select
                                                value={
                                                    formData.status ||
                                                    "Published"
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        status: e.target.value,
                                                    })
                                                }
                                                className="input-zen"
                                            >
                                                <option value="Published">
                                                    Published
                                                </option>
                                                <option value="Draft">
                                                    Draft
                                                </option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2 border border-zen-300 text-zen-800 rounded-lg hover:bg-zen-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 btn-zen"
                                    >
                                        {editingItem ? "Update" : "Add"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            <AnimatePresence>
                {showCreateUserModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-white border-b border-zen-200 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-zen-800">
                                    Create New User
                                </h3>
                                <button
                                    onClick={closeCreateUserModal}
                                    className="text-zen-600 hover:text-zen-800"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form
                                onSubmit={handleCreateUser}
                                className="p-6 space-y-4"
                            >
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={newUserData.name}
                                            onChange={(e) =>
                                                setNewUserData({
                                                    ...newUserData,
                                                    name: e.target.value,
                                                })
                                            }
                                            className="input-zen"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Username *
                                        </label>
                                        <input
                                            type="text"
                                            value={newUserData.username}
                                            onChange={(e) =>
                                                setNewUserData({
                                                    ...newUserData,
                                                    username: e.target.value,
                                                })
                                            }
                                            className="input-zen"
                                            placeholder="stylist_a"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={newUserData.email}
                                            onChange={(e) =>
                                                setNewUserData({
                                                    ...newUserData,
                                                    email: e.target.value,
                                                })
                                            }
                                            className="input-zen"
                                            placeholder="stylist.a@zenstyle.com"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={newUserData.phone_number}
                                            onChange={(e) =>
                                                setNewUserData({
                                                    ...newUserData,
                                                    phone_number:
                                                        e.target.value,
                                                })
                                            }
                                            className="input-zen"
                                            placeholder="0901234567"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Password *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={
                                                    newUserShowPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={newUserData.password}
                                                onChange={(e) =>
                                                    setNewUserData({
                                                        ...newUserData,
                                                        password:
                                                            e.target.value,
                                                    })
                                                }
                                                className="input-zen pr-11"
                                                placeholder="Minimum 8 characters"
                                                minLength="8"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setNewUserShowPassword(
                                                        !newUserShowPassword,
                                                    )
                                                }
                                                className="absolute right-3 top-3.5 text-zen-400"
                                            >
                                                {newUserShowPassword ? (
                                                    <EyeOff size={18} />
                                                ) : (
                                                    <Eye size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Role *
                                        </label>
                                        <select
                                            value={newUserData.role}
                                            onChange={(e) =>
                                                setNewUserData({
                                                    ...newUserData,
                                                    role: e.target.value,
                                                })
                                            }
                                            className="input-zen"
                                            required
                                        >
                                            <option value="Client">
                                                Customer
                                            </option>
                                            <option value="Stylist">
                                                Stylist
                                            </option>
                                            <option value="Admin">
                                                Administrator
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> Password must be
                                        at least 8 characters. Account will be
                                        created in active status.
                                    </p>
                                </div>

                                <div className="flex space-x-3 pt-4 border-t border-zen-200">
                                    <button
                                        type="button"
                                        onClick={closeCreateUserModal}
                                        className="flex-1 px-4 py-2 border border-zen-300 text-zen-800 rounded-lg hover:bg-zen-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 btn-zen"
                                    >
                                        Create Account
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create Appointment Modal */}
            <AnimatePresence>
                {showCreateAppointmentModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-white border-b border-zen-200 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-zen-800">
                                    Create Appointment
                                </h3>
                                <button
                                    onClick={closeCreateAppointmentModal}
                                    className="text-zen-600 hover:text-zen-800"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form
                                onSubmit={handleCreateAppointment}
                                className="p-6 space-y-4"
                            >
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Customer (optional)
                                        </label>
                                        <select
                                            value={newAppointmentData.client_id}
                                            onChange={(e) =>
                                                setNewAppointmentData({
                                                    ...newAppointmentData,
                                                    client_id: e.target.value,
                                                })
                                            }
                                            className="input-zen"
                                        >
                                            <option value="">
                                                -- Select Customer --
                                            </option>
                                            {users
                                                .filter(
                                                    (u) => u.role === "Client",
                                                )
                                                .map((c) => (
                                                    <option
                                                        key={c.id}
                                                        value={c.id}
                                                    >
                                                        {c.name} - {c.email}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Service *
                                        </label>
                                        <select
                                            value={
                                                newAppointmentData.service_id
                                            }
                                            onChange={(e) =>
                                                setNewAppointmentData({
                                                    ...newAppointmentData,
                                                    service_id: e.target.value,
                                                })
                                            }
                                            className="input-zen"
                                            required
                                        >
                                            <option value="">
                                                -- Select Service --
                                            </option>
                                            {services.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.service_name} -{" "}
                                                    {formatCurrency(s.price)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Stylist (optional)
                                        </label>
                                        <select
                                            value={newAppointmentData.staff_id}
                                            onChange={(e) =>
                                                setNewAppointmentData({
                                                    ...newAppointmentData,
                                                    staff_id: e.target.value,
                                                })
                                            }
                                            className="input-zen"
                                        >
                                            <option value="">
                                                -- Auto assign --
                                            </option>
                                            {staffList.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={
                                                newAppointmentData.appointment_date
                                            }
                                            onChange={(e) =>
                                                setNewAppointmentData({
                                                    ...newAppointmentData,
                                                    appointment_date:
                                                        e.target.value,
                                                })
                                            }
                                            className="input-zen"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Time *
                                        </label>
                                        <input
                                            type="time"
                                            value={
                                                newAppointmentData.appointment_time
                                            }
                                            onChange={(e) =>
                                                setNewAppointmentData({
                                                    ...newAppointmentData,
                                                    appointment_time:
                                                        e.target.value,
                                                })
                                            }
                                            className="input-zen"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-zen-800 font-medium mb-2">
                                        Notes (optional)
                                    </label>
                                    <textarea
                                        value={newAppointmentData.notes}
                                        onChange={(e) =>
                                            setNewAppointmentData({
                                                ...newAppointmentData,
                                                notes: e.target.value,
                                            })
                                        }
                                        className="input-zen h-24"
                                        placeholder="Notes for the appointment"
                                    />
                                </div>

                                <div className="flex space-x-3 pt-4 border-t border-zen-200">
                                    <button
                                        type="button"
                                        onClick={closeCreateAppointmentModal}
                                        className="flex-1 px-4 py-2 border border-zen-300 text-zen-800 rounded-lg hover:bg-zen-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 btn-zen"
                                        disabled={creatingAppointment}
                                    >
                                        {creatingAppointment
                                            ? "Creating..."
                                            : "Create Appointment"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* User Edit Modal */}
            <AnimatePresence>
                {showUserEditModal && editingUser && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-white border-b border-zen-200 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-zen-800">
                                    Edit User Information
                                </h3>
                                <button
                                    onClick={closeUserEditModal}
                                    className="text-zen-600 hover:text-zen-800"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form
                                onSubmit={handleUpdateUser}
                                className="p-6 space-y-4"
                            >
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={editingUser.name}
                                            onChange={(e) =>
                                                setEditingUser({
                                                    ...editingUser,
                                                    name: e.target.value,
                                                })
                                            }
                                            className="input-zen"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Username *
                                        </label>
                                        <input
                                            type="text"
                                            value={editingUser.username}
                                            onChange={(e) =>
                                                setEditingUser({
                                                    ...editingUser,
                                                    username: e.target.value,
                                                })
                                            }
                                            className="input-zen"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={editingUser.email}
                                            onChange={(e) =>
                                                setEditingUser({
                                                    ...editingUser,
                                                    email: e.target.value,
                                                })
                                            }
                                            className="input-zen"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={
                                                editingUser.phone_number || ""
                                            }
                                            onChange={(e) =>
                                                setEditingUser({
                                                    ...editingUser,
                                                    phone_number:
                                                        e.target.value,
                                                })
                                            }
                                            className="input-zen"
                                            placeholder="0901234567"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Role *
                                        </label>
                                        <select
                                            value={editingUser.role}
                                            onChange={(e) =>
                                                setEditingUser({
                                                    ...editingUser,
                                                    role: e.target.value,
                                                })
                                            }
                                            className="input-zen"
                                            required
                                        >
                                            <option value="Client">
                                                Customer
                                            </option>
                                            <option value="Stylist">
                                                Stylist
                                            </option>
                                            <option value="Admin">
                                                Administrator
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Status
                                        </label>
                                        <div className="flex items-center space-x-2 mt-3">
                                            <span
                                                className={`px-4 py-2 rounded-full text-sm font-medium ${
                                                    editingUser.is_active
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {editingUser.is_active
                                                    ? "Active"
                                                    : "Locked"}
                                            </span>
                                            <span className="text-sm text-zen-600">
                                                (Use Lock/Unlock button to
                                                change)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-zen-50 border border-zen-200 rounded-lg p-4">
                                    <p className="text-sm text-zen-600">
                                        <strong>Note:</strong> To change
                                        password, please use "Reset Password"
                                        button. To change active status, use
                                        "Lock/Unlock" button.
                                    </p>
                                </div>

                                <div className="flex space-x-3 pt-4 border-t border-zen-200">
                                    <button
                                        type="button"
                                        onClick={closeUserEditModal}
                                        className="flex-1 px-4 py-2 border border-zen-300 text-zen-800 rounded-lg hover:bg-zen-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 btn-zen"
                                    >
                                        Update Information
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
