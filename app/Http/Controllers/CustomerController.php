<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Appointment;
use App\Models\Order;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    /**
     * 1. Get all customers list
     * GET /api/customers
     * Admin only
     */
    public function index()
    {
        $customers = User::where('role', 'Client')
            ->select('id', 'name', 'username', 'email', 'phone_number', 'is_active', 'created_at')
            ->withCount([
                'clientAppointments as total_appointments',
                'clientAppointments as completed_appointments' => function ($query) {
                    $query->where('status', 'Completed');
                }
            ])
            ->withSum('orders as total_spent', 'total_price')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'message' => 'Customers retrieved successfully',
            'total' => $customers->count(),
            'data' => $customers
        ]);
    }

    /**
     * 2. Customer statistics overview
     * GET /api/customers/statistics
     * Admin only
     */
    public function statistics()
    {
        $totalCustomers = User::where('role', 'Client')->count();
        $activeCustomers = User::where('role', 'Client')->where('is_active', true)->count();
        $inactiveCustomers = $totalCustomers - $activeCustomers;

        // New customers this month
        $newThisMonth = User::where('role', 'Client')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Customers with appointments
        $customersWithAppointments = User::where('role', 'Client')
            ->whereHas('clientAppointments')
            ->count();

        // Customers with orders
        $customersWithOrders = User::where('role', 'Client')
            ->whereHas('orders')
            ->count();

        // Total revenue from orders (products)
        $revenueFromOrders = Order::sum('total_amount');

        // Total revenue from completed appointments (services)
        $revenueFromAppointments = Appointment::where('status', 'Completed')
            ->sum('total_amount');

        // Total revenue (orders + appointments)
        $totalRevenue = $revenueFromOrders + $revenueFromAppointments;

        // Average spending per customer
        $avgSpendingPerCustomer = $totalCustomers > 0 ? $totalRevenue / $totalCustomers : 0;

        return response()->json([
            'message' => 'Customer statistics retrieved successfully',
            'data' => [
                'total_customers' => $totalCustomers,
                'active_customers' => $activeCustomers,
                'inactive_customers' => $inactiveCustomers,
                'new_this_month' => $newThisMonth,
                'customers_with_appointments' => $customersWithAppointments,
                'customers_with_orders' => $customersWithOrders,
                'total_revenue' => round($totalRevenue, 2),
                'revenue_from_orders' => round($revenueFromOrders, 2),
                'revenue_from_appointments' => round($revenueFromAppointments, 2),
                'avg_spending_per_customer' => round($avgSpendingPerCustomer, 2)
            ]
        ]);
    }

    /**
     * 3. Top customers by spending
     * GET /api/customers/top-spenders?limit=10
     * Admin only
     */
    public function topSpenders(Request $request)
    {
        $limit = $request->input('limit', 10);

        $topCustomers = User::where('role', 'Client')
            ->withSum('orders as total_spent_orders', 'total_amount')
            ->withSum(['clientAppointments as total_spent_appointments' => function($query) {
                $query->where('status', 'Completed');
            }], 'total_amount')
            ->withCount('clientAppointments as total_appointments')
            ->withCount('orders as total_orders')
            ->get([
                'id', 'name', 'email', 'phone_number', 'created_at'
            ])
            ->map(function($customer) {
                $customer->total_spent = ($customer->total_spent_orders ?? 0) + ($customer->total_spent_appointments ?? 0);
                return $customer;
            })
            ->sortByDesc('total_spent')
            ->take($limit)
            ->values();

        return response()->json([
            'message' => 'Top spending customers retrieved successfully',
            'limit' => $limit,
            'data' => $topCustomers
        ]);
    }

    /**
     * 4. Customer loyalty analysis (by appointment frequency)
     * GET /api/customers/loyalty
     * Admin only
     */
    public function loyaltyAnalysis()
    {
        $customers = User::where('role', 'Client')
            ->withCount([
                'clientAppointments as total_visits',
                'clientAppointments as completed_visits' => function ($query) {
                    $query->where('status', 'Completed');
                }
            ])
            ->withSum('orders as spent_on_orders', 'total_amount')
            ->withSum(['clientAppointments as spent_on_appointments' => function($query) {
                $query->where('status', 'Completed');
            }], 'total_amount')
            ->get()
            ->map(function ($customer) {
                // Calculate loyalty tier
                $visits = $customer->completed_visits ?? 0;
                if ($visits >= 20) {
                    $tier = 'VIP';
                } elseif ($visits >= 10) {
                    $tier = 'Gold';
                } elseif ($visits >= 5) {
                    $tier = 'Silver';
                } else {
                    $tier = 'Bronze';
                }

                $totalSpent = ($customer->spent_on_orders ?? 0) + ($customer->spent_on_appointments ?? 0);

                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'phone_number' => $customer->phone_number,
                    'total_visits' => $visits,
                    'total_spent' => round($totalSpent, 2),
                    'spent_on_orders' => round($customer->spent_on_orders ?? 0, 2),
                    'spent_on_appointments' => round($customer->spent_on_appointments ?? 0, 2),
                    'loyalty_tier' => $tier,
                    'member_since' => $customer->created_at->format('Y-m-d')
                ];
            });

        // Group by tier
        $tierCounts = $customers->groupBy('loyalty_tier')->map->count();

        return response()->json([
            'message' => 'Customer loyalty analysis retrieved successfully',
            'tier_distribution' => $tierCounts,
            'customers' => $customers->sortByDesc('total_visits')->values()
        ]);
    }

    /**
     * 5. Customer activity report
     * GET /api/customers/activity?from=2026-01-01&to=2026-01-31
     * Admin only
     */
    public function activityReport(Request $request)
    {
        $from = $request->input('from', now()->startOfMonth());
        $to = $request->input('to', now()->endOfMonth());

        $customers = User::where('role', 'Client')
            ->withCount([
                'clientAppointments as appointments_in_period' => function ($query) use ($from, $to) {
                    $query->whereBetween('appointment_date', [$from, $to]);
                },
                'orders as orders_in_period' => function ($query) use ($from, $to) {
                    $query->whereBetween('created_at', [$from, $to]);
                }
            ])
            ->having('appointments_in_period', '>', 0)
            ->orHaving('orders_in_period', '>', 0)
            ->orderByDesc('appointments_in_period')
            ->get([
                'id', 'name', 'email', 'phone_number'
            ]);

        return response()->json([
            'message' => 'Customer activity report retrieved successfully',
            'period' => [
                'from' => $from,
                'to' => $to
            ],
            'active_customers' => $customers->count(),
            'data' => $customers
        ]);
    }

    /**
     * 6. Show individual customer details with full history
     * GET /api/customers/{id}
     * Admin only
     */
    public function show($id)
    {
        $customer = User::where('role', 'Client')
            ->with([
                'clientAppointments' => function ($query) {
                    $query->with(['service', 'staff'])
                        ->orderBy('appointment_date', 'desc')
                        ->limit(10);
                },
                'orders' => function ($query) {
                    $query->with('orderDetails.product')
                        ->orderBy('created_at', 'desc')
                        ->limit(10);
                }
            ])
            ->withCount('clientAppointments')
            ->withCount('orders')
            ->withSum('orders as total_spent', 'total_price')
            ->findOrFail($id);

        // Calculate statistics
        $completedAppointments = $customer->clientAppointments
            ->where('status', 'Completed')
            ->count();

        $cancelledAppointments = $customer->clientAppointments
            ->where('status', 'Cancelled')
            ->count();

        $lastAppointment = $customer->clientAppointments->first();

        return response()->json([
            'message' => 'Customer details retrieved successfully',
            'data' => [
                'customer_info' => [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'username' => $customer->username,
                    'phone_number' => $customer->phone_number,
                    'is_active' => $customer->is_active,
                    'member_since' => $customer->created_at->format('Y-m-d'),
                ],
                'statistics' => [
                    'total_appointments' => $customer->client_appointments_count,
                    'completed_appointments' => $completedAppointments,
                    'cancelled_appointments' => $cancelledAppointments,
                    'total_orders' => $customer->orders_count,
                    'total_spent' => $customer->total_spent ?? 0,
                    'last_visit' => $lastAppointment ? $lastAppointment->appointment_date : null
                ],
                'recent_appointments' => $customer->clientAppointments,
                'recent_orders' => $customer->orders
            ]
        ]);
    }

    /**
     * 7. Customer retention rate
     * GET /api/customers/retention
     * Admin only
     */
    public function retentionRate()
    {
        // Customers who had appointments in the last 3 months
        $threeMonthsAgo = now()->subMonths(3);
        $customersWithRecentActivity = User::where('role', 'Client')
            ->whereHas('clientAppointments', function ($query) use ($threeMonthsAgo) {
                $query->where('appointment_date', '>=', $threeMonthsAgo);
            })
            ->count();

        // Total customers who ever had appointments
        $totalActiveCustomers = User::where('role', 'Client')
            ->whereHas('clientAppointments')
            ->count();

        $retentionRate = $totalActiveCustomers > 0 
            ? ($customersWithRecentActivity / $totalActiveCustomers) * 100 
            : 0;

        // Monthly retention breakdown
        $monthlyRetention = [];
        for ($i = 0; $i < 6; $i++) {
            $monthStart = now()->subMonths($i)->startOfMonth();
            $monthEnd = now()->subMonths($i)->endOfMonth();
            
            $activeInMonth = User::where('role', 'Client')
                ->whereHas('clientAppointments', function ($query) use ($monthStart, $monthEnd) {
                    $query->whereBetween('appointment_date', [$monthStart, $monthEnd]);
                })
                ->count();

            $monthlyRetention[] = [
                'month' => $monthStart->format('Y-m'),
                'active_customers' => $activeInMonth
            ];
        }

        return response()->json([
            'message' => 'Customer retention analysis retrieved successfully',
            'data' => [
                'retention_rate_3months' => round($retentionRate, 2) . '%',
                'customers_with_recent_activity' => $customersWithRecentActivity,
                'total_active_customers' => $totalActiveCustomers,
                'monthly_breakdown' => array_reverse($monthlyRetention)
            ]
        ]);
    }

    /**
     * 8. New customers growth trend
     * GET /api/customers/growth
     * Admin only
     */
    public function growthTrend()
    {
        $monthlyGrowth = [];
        
        for ($i = 11; $i >= 0; $i--) {
            $monthStart = now()->subMonths($i)->startOfMonth();
            $monthEnd = now()->subMonths($i)->endOfMonth();
            
            $newCustomers = User::where('role', 'Client')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->count();

            $monthlyGrowth[] = [
                'month' => $monthStart->format('Y-m'),
                'new_customers' => $newCustomers
            ];
        }

        return response()->json([
            'message' => 'Customer growth trend retrieved successfully',
            'data' => $monthlyGrowth
        ]);
    }
}
