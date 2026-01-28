import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    TrendingUp,
    DollarSign,
    Calendar,
    ShoppingCart,
    Users,
    Star,
    BarChart3,
    PieChart,
    Filter,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { formatCurrency } from "../../utils/currency";

const AdminStatsView = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("month"); // week, month, year, custom
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

    useEffect(() => {
        fetchStats();
    }, [period]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const params = {
                period: period,
            };

            if (period === "custom" && startDate && endDate) {
                params.start_date = startDate;
                params.end_date = endDate;
            }

            const response = await api.get("/dashboard/stats", { params });
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
            toast.error("Failed to load statistics");
        } finally {
            setLoading(false);
        }
    };

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        if (newPeriod !== "custom") {
            setShowCustomDatePicker(false);
        } else {
            setShowCustomDatePicker(true);
        }
    };

    const handleCustomDateSubmit = () => {
        if (!startDate || !endDate) {
            toast.error("Please select both start and end dates");
            return;
        }
        fetchStats();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zen-600"></div>
            </div>
        );
    }

    if (!stats) {
        return <div className="text-center py-8">No data available</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header with Period Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div>
                    <h2 className="text-3xl font-zen font-bold text-zen-800">
                        Dashboard Statistics
                    </h2>
                    <p className="text-zen-600 mt-1">
                        {stats.date_range.start} to {stats.date_range.end}
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Period Buttons */}
                    <div className="flex space-x-2">
                        {["week", "month", "year", "custom"].map((p) => (
                            <button
                                key={p}
                                onClick={() => handlePeriodChange(p)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    period === p
                                        ? "bg-zen-600 text-white"
                                        : "bg-white text-zen-700 hover:bg-zen-50 border border-zen-300"
                                }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Custom Date Picker */}
            {showCustomDatePicker && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="card-zen"
                >
                    <div className="flex items-end space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-zen-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-600"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-zen-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-600"
                            />
                        </div>
                        <button
                            onClick={handleCustomDateSubmit}
                            className="px-6 py-2 bg-zen-600 text-white rounded-lg hover:bg-zen-700 transition-colors"
                        >
                            Apply
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatsCard
                    icon={<DollarSign className="text-green-600" />}
                    title="Total Revenue"
                    value={formatCurrency(stats.overview.total_revenue)}
                    subtitle={`Appointments: ${formatCurrency(stats.overview.appointment_revenue)} | Orders: ${formatCurrency(stats.overview.order_revenue)}`}
                    bgColor="bg-green-50"
                />
                <StatsCard
                    icon={<Calendar className="text-blue-600" />}
                    title="Total Appointments"
                    value={stats.overview.total_appointments}
                    subtitle={`Completion: ${stats.appointments.completion_rate}%`}
                    bgColor="bg-blue-50"
                />
                <StatsCard
                    icon={<ShoppingCart className="text-purple-600" />}
                    title="Total Orders"
                    value={stats.overview.total_orders}
                    subtitle={`Paid: ${stats.orders.by_payment_status.Paid || 0}`}
                    bgColor="bg-purple-50"
                />
                <StatsCard
                    icon={<Users className="text-amber-600" />}
                    title="New Customers"
                    value={stats.users.new_customers}
                    subtitle={`Total Clients: ${stats.users.total_by_role.clients}`}
                    bgColor="bg-amber-50"
                />
                <StatsCard
                    icon={<Star className="text-yellow-600" />}
                    title="Average Rating"
                    value={
                        stats.feedback.average_ratings.overall
                            ? `${stats.feedback.average_ratings.overall} ⭐`
                            : "N/A"
                    }
                    subtitle={`${stats.feedback.total} feedbacks`}
                    bgColor="bg-yellow-50"
                />
                <StatsCard
                    icon={<TrendingUp className="text-pink-600" />}
                    title="Services & Products"
                    value={`${stats.services.total} / ${stats.products.total}`}
                    subtitle={`Low stock: ${stats.products.low_stock}`}
                    bgColor="bg-pink-50"
                />
            </div>

            {/* Detailed Stats Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appointments Breakdown */}
                <div className="card-zen">
                    <h3 className="text-xl font-bold text-zen-800 mb-4 flex items-center">
                        <Calendar className="mr-2" size={24} />
                        Appointments by Status
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(stats.appointments.by_status).map(
                            ([status, count]) => (
                                <div
                                    key={status}
                                    className="flex justify-between items-center"
                                >
                                    <span className="text-zen-700 capitalize">
                                        {status}
                                    </span>
                                    <span className="font-bold text-zen-800">
                                        {count}
                                    </span>
                                </div>
                            ),
                        )}
                    </div>
                </div>

                {/* Orders Breakdown */}
                <div className="card-zen">
                    <h3 className="text-xl font-bold text-zen-800 mb-4 flex items-center">
                        <ShoppingCart className="mr-2" size={24} />
                        Orders by Payment Status
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(stats.orders.by_payment_status).map(
                            ([status, count]) => (
                                <div
                                    key={status}
                                    className="flex justify-between items-center"
                                >
                                    <span className="text-zen-700">
                                        {status}
                                    </span>
                                    <span className="font-bold text-zen-800">
                                        {count}
                                    </span>
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </div>

            {/* Top Services & Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Services */}
                <div className="card-zen">
                    <h3 className="text-xl font-bold text-zen-800 mb-4">
                        Top Services by Revenue
                    </h3>
                    <div className="space-y-3">
                        {stats.revenue.top_services.map((service, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center"
                            >
                                <span className="text-zen-700">
                                    {service.service_name}
                                </span>
                                <span className="font-bold text-green-600">
                                    {formatCurrency(service.revenue)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="card-zen">
                    <h3 className="text-xl font-bold text-zen-800 mb-4">
                        Top Products by Revenue
                    </h3>
                    <div className="space-y-3">
                        {stats.revenue.top_products.map((product, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center"
                            >
                                <span className="text-zen-700">
                                    {product.product_name}
                                </span>
                                <span className="font-bold text-green-600">
                                    {formatCurrency(product.revenue)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Most Booked Services */}
            <div className="card-zen">
                <h3 className="text-xl font-bold text-zen-800 mb-4">
                    Most Booked Services
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {stats.services.most_booked.map((service, index) => (
                        <div
                            key={index}
                            className="text-center p-4 bg-zen-50 rounded-lg"
                        >
                            <div className="text-2xl font-bold text-zen-800">
                                {service.bookings}
                            </div>
                            <div className="text-sm text-zen-600 mt-1">
                                {service.service_name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Most Sold Products */}
            <div className="card-zen">
                <h3 className="text-xl font-bold text-zen-800 mb-4">
                    Most Sold Products
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {stats.products.most_sold.map((product, index) => (
                        <div
                            key={index}
                            className="text-center p-4 bg-zen-50 rounded-lg"
                        >
                            <div className="text-2xl font-bold text-zen-800">
                                {product.sold}
                            </div>
                            <div className="text-sm text-zen-600 mt-1">
                                {product.product_name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feedback Ratings */}
            {stats.feedback.average_ratings.overall && (
                <div className="card-zen">
                    <h3 className="text-xl font-bold text-zen-800 mb-4 flex items-center">
                        <Star className="mr-2 text-yellow-500" size={24} />
                        Detailed Feedback Ratings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <RatingBox
                            title="Overall"
                            rating={stats.feedback.average_ratings.overall}
                        />
                        <RatingBox
                            title="Service Quality"
                            rating={
                                stats.feedback.average_ratings.service_quality
                            }
                        />
                        <RatingBox
                            title="Staff Friendliness"
                            rating={
                                stats.feedback.average_ratings
                                    .staff_friendliness
                            }
                        />
                        <RatingBox
                            title="Cleanliness"
                            rating={stats.feedback.average_ratings.cleanliness}
                        />
                        <RatingBox
                            title="Value for Money"
                            rating={
                                stats.feedback.average_ratings.value_for_money
                            }
                        />
                    </div>
                </div>
            )}

            {/* Charts Preview (Placeholder) */}
            <div className="card-zen">
                <h3 className="text-xl font-bold text-zen-800 mb-4 flex items-center">
                    <BarChart3 className="mr-2" size={24} />
                    Daily Trends
                </h3>
                <div className="text-center py-12 bg-zen-50 rounded-lg">
                    <BarChart3
                        className="mx-auto text-zen-300 mb-4"
                        size={64}
                    />
                    <p className="text-zen-600">
                        {stats.charts.revenue_by_day.length} days of data
                        available
                    </p>
                    <p className="text-sm text-zen-500 mt-2">
                        Chart visualization coming soon
                    </p>
                </div>
            </div>
        </div>
    );
};

// Stats Card Component
const StatsCard = ({ icon, title, value, subtitle, bgColor }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${bgColor} rounded-xl p-6 border border-zen-200`}
    >
        <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-white rounded-lg shadow-sm">{icon}</div>
        </div>
        <h3 className="text-sm font-medium text-zen-600 mb-1">{title}</h3>
        <div className="text-2xl font-bold text-zen-800 mb-1">{value}</div>
        <p className="text-xs text-zen-600">{subtitle}</p>
    </motion.div>
);

// Rating Box Component
const RatingBox = ({ title, rating }) => (
    <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="text-3xl font-bold text-yellow-600">
            {rating ? rating.toFixed(1) : "N/A"}
        </div>
        <div className="text-sm text-zen-700 mt-1">{title}</div>
        {rating && (
            <div className="flex justify-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={14}
                        className={
                            star <= Math.round(rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                        }
                    />
                ))}
            </div>
        )}
    </div>
);

export default AdminStatsView;
