<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Appointment;
use App\Models\Order;
use App\Models\Service;
use App\Models\Product;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardStatsController extends Controller
{
    /**
     * Get comprehensive dashboard statistics
     */
    public function getStats(Request $request)
    {
        $request->validate([
            'period' => 'nullable|in:week,month,year,custom',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $period = $request->input('period', 'month');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Determine date range
        $dateRange = $this->getDateRange($period, $startDate, $endDate);

        $stats = [
            'period' => $period,
            'date_range' => [
                'start' => $dateRange['start']->format('Y-m-d'),
                'end' => $dateRange['end']->format('Y-m-d'),
            ],

            // Overview Stats
            'overview' => $this->getOverviewStats($dateRange),

            // Revenue Stats
            'revenue' => $this->getRevenueStats($dateRange),

            // Appointments Stats
            'appointments' => $this->getAppointmentsStats($dateRange),

            // Orders Stats
            'orders' => $this->getOrdersStats($dateRange),

            // Users Stats
            'users' => $this->getUsersStats($dateRange),

            // Services Stats
            'services' => $this->getServicesStats($dateRange),

            // Products Stats
            'products' => $this->getProductsStats($dateRange),

            // Feedback Stats
            'feedback' => $this->getFeedbackStats($dateRange),

            // Charts Data
            'charts' => $this->getChartsData($dateRange),
        ];

        return response()->json($stats);
    }

    /**
     * Get date range based on period
     */
    private function getDateRange($period, $startDate = null, $endDate = null)
    {
        if ($period === 'custom' && $startDate && $endDate) {
            return [
                'start' => Carbon::parse($startDate)->startOfDay(),
                'end' => Carbon::parse($endDate)->endOfDay(),
            ];
        }

        $end = Carbon::now()->endOfDay();

        switch ($period) {
            case 'week':
                $start = Carbon::now()->subWeek()->startOfDay();
                break;
            case 'year':
                $start = Carbon::now()->subYear()->startOfDay();
                break;
            case 'month':
            default:
                $start = Carbon::now()->subMonth()->startOfDay();
                break;
        }

        return ['start' => $start, 'end' => $end];
    }

    /**
     * Get overview statistics
     */
    private function getOverviewStats($dateRange)
    {
        $totalRevenue = Appointment::where('status', 'Completed')
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->sum('total_amount');

        $orderRevenue = Order::where('payment_status', 'Paid')
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->sum('total_amount');

        $totalCustomers = User::where('role', 'Client')
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->count();

        $totalAppointments = Appointment::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->count();

        $totalOrders = Order::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->count();

        return [
            'total_revenue' => $totalRevenue + $orderRevenue,
            'appointment_revenue' => $totalRevenue,
            'order_revenue' => $orderRevenue,
            'total_customers' => $totalCustomers,
            'total_appointments' => $totalAppointments,
            'total_orders' => $totalOrders,
        ];
    }

    /**
     * Get revenue statistics
     */
    private function getRevenueStats($dateRange)
    {
        // Revenue by source
        $appointmentRevenue = Appointment::where('status', 'Completed')
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->sum('total_amount');

        $orderRevenue = Order::where('payment_status', 'Paid')
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->sum('total_amount');

        // Top services by revenue
        $topServices = DB::table('appointment_details')
            ->join('appointments', 'appointment_details.appointment_id', '=', 'appointments.appointment_id')
            ->join('services', 'appointment_details.service_id', '=', 'services.id')
            ->where('appointments.status', 'Completed')
            ->whereBetween('appointments.created_at', [$dateRange['start'], $dateRange['end']])
            ->select('services.service_name', DB::raw('SUM(appointment_details.service_price) as revenue'))
            ->groupBy('services.id', 'services.service_name')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get();

        // Top products by revenue
        $topProducts = DB::table('order_details')
            ->join('orders', 'order_details.order_id', '=', 'orders.id')
            ->join('products', 'order_details.product_id', '=', 'products.id')
            ->where('orders.payment_status', 'Paid')
            ->whereBetween('orders.created_at', [$dateRange['start'], $dateRange['end']])
            ->select('products.product_name', DB::raw('SUM(order_details.quantity * order_details.unit_price) as revenue'))
            ->groupBy('products.id', 'products.product_name')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get();

        return [
            'total' => $appointmentRevenue + $orderRevenue,
            'by_source' => [
                'appointments' => $appointmentRevenue,
                'orders' => $orderRevenue,
            ],
            'top_services' => $topServices,
            'top_products' => $topProducts,
        ];
    }

    /**
     * Get appointments statistics
     */
    private function getAppointmentsStats($dateRange)
    {
        $total = Appointment::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->count();

        $byStatus = Appointment::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        $completed = $byStatus['Completed'] ?? 0;
        $pending = $byStatus['Pending'] ?? 0;
        $confirmed = $byStatus['Confirmed'] ?? 0;
        $cancelled = $byStatus['Cancelled'] ?? 0;

        // Average rating from completed appointments
        $avgRating = Feedback::join('appointments', 'feedbacks.appointment_id', '=', 'appointments.appointment_id')
            ->whereBetween('feedbacks.created_at', [$dateRange['start'], $dateRange['end']])
            ->avg('feedbacks.rating');

        return [
            'total' => $total,
            'by_status' => [
                'completed' => $completed,
                'pending' => $pending,
                'confirmed' => $confirmed,
                'cancelled' => $cancelled,
            ],
            'completion_rate' => $total > 0 ? round(($completed / $total) * 100, 2) : 0,
            'average_rating' => $avgRating ? round($avgRating, 2) : null,
        ];
    }

    /**
     * Get orders statistics
     */
    private function getOrdersStats($dateRange)
    {
        $total = Order::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->count();

        $byStatus = Order::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        $byPaymentStatus = Order::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->select('payment_status', DB::raw('count(*) as count'))
            ->groupBy('payment_status')
            ->get()
            ->pluck('count', 'payment_status');

        return [
            'total' => $total,
            'by_status' => $byStatus,
            'by_payment_status' => $byPaymentStatus,
        ];
    }

    /**
     * Get users statistics
     */
    private function getUsersStats($dateRange)
    {
        $newCustomers = User::where('role', 'Client')
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->count();

        $newStaff = User::where('role', 'Stylist')
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->count();

        $totalClients = User::where('role', 'Client')->count();
        $totalStaff = User::where('role', 'Stylist')->count();
        $totalAdmins = User::where('role', 'Admin')->count();

        return [
            'new_customers' => $newCustomers,
            'new_staff' => $newStaff,
            'total_by_role' => [
                'clients' => $totalClients,
                'staff' => $totalStaff,
                'admins' => $totalAdmins,
            ],
        ];
    }

    /**
     * Get services statistics
     */
    private function getServicesStats($dateRange)
    {
        $totalServices = Service::count();

        $mostBooked = DB::table('appointment_details')
            ->join('appointments', 'appointment_details.appointment_id', '=', 'appointments.appointment_id')
            ->join('services', 'appointment_details.service_id', '=', 'services.id')
            ->whereBetween('appointments.created_at', [$dateRange['start'], $dateRange['end']])
            ->select('services.service_name', DB::raw('count(*) as bookings'))
            ->groupBy('services.id', 'services.service_name')
            ->orderByDesc('bookings')
            ->limit(5)
            ->get();

        return [
            'total' => $totalServices,
            'most_booked' => $mostBooked,
        ];
    }

    /**
     * Get products statistics
     */
    private function getProductsStats($dateRange)
    {
        $totalProducts = Product::count();
        $lowStock = Product::where('stock_quantity', '<', 5)->count();
        $outOfStock = Product::where('stock_quantity', 0)->count();

        $mostSold = DB::table('order_details')
            ->join('orders', 'order_details.order_id', '=', 'orders.id')
            ->join('products', 'order_details.product_id', '=', 'products.id')
            ->whereBetween('orders.created_at', [$dateRange['start'], $dateRange['end']])
            ->select('products.product_name', DB::raw('SUM(order_details.quantity) as sold'))
            ->groupBy('products.id', 'products.product_name')
            ->orderByDesc('sold')
            ->limit(5)
            ->get();

        return [
            'total' => $totalProducts,
            'low_stock' => $lowStock,
            'out_of_stock' => $outOfStock,
            'most_sold' => $mostSold,
        ];
    }

    /**
     * Get feedback statistics
     */
    private function getFeedbackStats($dateRange)
    {
        $totalFeedbacks = Feedback::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->count();

        $avgOverallRating = Feedback::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->avg('rating');

        $avgServiceQuality = Feedback::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->whereNotNull('service_quality_rating')
            ->avg('service_quality_rating');

        $avgStaffFriendliness = Feedback::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->whereNotNull('staff_friendliness_rating')
            ->avg('staff_friendliness_rating');

        $avgCleanliness = Feedback::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->whereNotNull('cleanliness_rating')
            ->avg('cleanliness_rating');

        $avgValueForMoney = Feedback::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->whereNotNull('value_for_money_rating')
            ->avg('value_for_money_rating');

        $ratingDistribution = Feedback::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->select('rating', DB::raw('count(*) as count'))
            ->groupBy('rating')
            ->orderBy('rating')
            ->get()
            ->pluck('count', 'rating');

        return [
            'total' => $totalFeedbacks,
            'average_ratings' => [
                'overall' => $avgOverallRating ? round($avgOverallRating, 2) : null,
                'service_quality' => $avgServiceQuality ? round($avgServiceQuality, 2) : null,
                'staff_friendliness' => $avgStaffFriendliness ? round($avgStaffFriendliness, 2) : null,
                'cleanliness' => $avgCleanliness ? round($avgCleanliness, 2) : null,
                'value_for_money' => $avgValueForMoney ? round($avgValueForMoney, 2) : null,
            ],
            'rating_distribution' => $ratingDistribution,
        ];
    }

    /**
     * Get charts data (daily trends)
     */
    private function getChartsData($dateRange)
    {
        // Revenue by day
        $revenueByDay = Appointment::where('status', 'Completed')
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_amount) as revenue'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Appointments by day
        $appointmentsByDay = Appointment::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Orders by day
        $ordersByDay = Order::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'revenue_by_day' => $revenueByDay,
            'appointments_by_day' => $appointmentsByDay,
            'orders_by_day' => $ordersByDay,
        ];
    }
}
