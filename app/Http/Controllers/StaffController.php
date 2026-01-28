<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StaffController extends Controller
{
    /**
     * Danh sách tất cả nhân viên (Admin only)
     */
    public function index()
    {
        $staff = User::whereIn('role', ['Stylist', 'Admin'])
            ->select('id', 'name', 'username', 'email', 'role', 'phone_number', 'is_active', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'message' => 'Staff list retrieved successfully',
            'total' => $staff->count(),
            'data' => $staff
        ]);
    }

    /**
     * Thống kê tổng quan nhân viên
     */
    public function statistics()
    {
        $totalStaff = User::whereIn('role', ['Stylist', 'Admin'])->count();
        $activeStaff = User::whereIn('role', ['Stylist', 'Admin'])->where('is_active', true)->count();
        $inactiveStaff = User::whereIn('role', ['Stylist', 'Admin'])->where('is_active', false)->count();
        
        $byRole = User::whereIn('role', ['Stylist', 'Admin'])
            ->select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->get();

        // Total appointments
        $totalAppointments = Appointment::count();

        return response()->json([
            'message' => 'Staff statistics retrieved successfully',
            'data' => [
                'total_staff' => $totalStaff,
                'active_staff' => $activeStaff,
                'inactive_staff' => $inactiveStaff,
                'by_role' => $byRole,
                'active_percentage' => $totalStaff > 0 ? round(($activeStaff / $totalStaff) * 100, 2) : 0,
                'total_appointments' => $totalAppointments
            ]
        ]);
    }

    /**
     * Thống kê hiệu suất nhân viên (số lượng lịch hẹn đã xử lý)
     */
    public function performance(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());

        $staffPerformance = User::whereIn('role', ['Stylist', 'Admin'])
            ->with(['staffAppointments' => function($query) use ($startDate, $endDate) {
                $query->whereBetween('appointment_date', [$startDate, $endDate]);
            }])
            ->get()
            ->map(function($staff) {
                $appointments = $staff->staffAppointments;
                
                return [
                    'staff_id' => $staff->id,
                    'staff_name' => $staff->name,
                    'email' => $staff->email,
                    'role' => $staff->role,
                    'total_appointments' => $appointments->count(),
                    'completed' => $appointments->where('status', 'Completed')->count(),
                    'confirmed' => $appointments->where('status', 'Confirmed')->count(),
                    'pending' => $appointments->where('status', 'Pending')->count(),
                    'cancelled' => $appointments->where('status', 'Cancelled')->count(),
                    'completion_rate' => $appointments->count() > 0 
                        ? round(($appointments->where('status', 'Completed')->count() / $appointments->count()) * 100, 2) 
                        : 0
                ];
            })
            ->sortByDesc('total_appointments')
            ->values();

        return response()->json([
            'message' => 'Staff performance retrieved successfully',
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate
            ],
            'data' => $staffPerformance
        ]);
    }

    /**
     * Lịch làm việc của nhân viên (xem lịch hẹn theo nhân viên)
     */
    public function schedule($staffId, Request $request)
    {
        $staff = User::whereIn('role', ['Stylist', 'Admin'])->findOrFail($staffId);
        
        $startDate = $request->input('start_date', now()->startOfWeek());
        $endDate = $request->input('end_date', now()->endOfWeek());

        $appointments = Appointment::with(['user', 'details.service'])
            ->where('staff_id', $staffId)
            ->whereBetween('appointment_date', [$startDate, $endDate])
            ->orderBy('appointment_date', 'asc')
            ->get();

        return response()->json([
            'message' => 'Staff schedule retrieved successfully',
            'staff' => [
                'id' => $staff->id,
                'name' => $staff->name,
                'email' => $staff->email,
                'role' => $staff->role
            ],
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate
            ],
            'total_appointments' => $appointments->count(),
            'appointments' => $appointments
        ]);
    }

    /**
     * Top nhân viên theo số lịch hẹn hoàn thành
     */
    public function topPerformers(Request $request)
    {
        $limit = $request->input('limit', 5);
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());

        $topStaff = User::whereIn('role', ['Stylist', 'Admin'])
            ->withCount(['staffAppointments as completed_appointments' => function($query) use ($startDate, $endDate) {
                $query->where('status', 'Completed')
                      ->whereBetween('appointment_date', [$startDate, $endDate]);
            }])
            ->having('completed_appointments', '>', 0)
            ->orderBy('completed_appointments', 'desc')
            ->limit($limit)
            ->get(['id', 'name', 'email', 'role', 'phone_number'])
            ->map(function($staff) {
                return [
                    'staff_id' => $staff->id,
                    'staff_name' => $staff->name,
                    'email' => $staff->email,
                    'role' => $staff->role,
                    'phone_number' => $staff->phone_number,
                    'completed_appointments' => $staff->completed_appointments
                ];
            });

        return response()->json([
            'message' => 'Top performers retrieved successfully',
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate
            ],
            'data' => $topStaff
        ]);
    }

    /**
     * Thống kê nhân viên theo ngày (số lượng active mỗi ngày)
     */
    public function dailyAvailability(Request $request)
    {
        $date = $request->input('date', now()->format('Y-m-d'));

        $availableStaff = User::whereIn('role', ['Stylist', 'Admin'])
            ->where('is_active', true)
            ->with(['staffAppointments' => function($query) use ($date) {
                $query->whereDate('appointment_date', $date)
                      ->select('staff_id', 'appointment_date', 'status');
            }])
            ->get()
            ->map(function($staff) {
                return [
                    'staff_id' => $staff->id,
                    'staff_name' => $staff->name,
                    'email' => $staff->email,
                    'role' => $staff->role,
                    'appointments_today' => $staff->staffAppointments->count(),
                    'busy_slots' => $staff->staffAppointments->pluck('appointment_date')
                ];
            });

        return response()->json([
            'message' => 'Daily staff availability retrieved successfully',
            'date' => $date,
            'total_available_staff' => $availableStaff->count(),
            'data' => $availableStaff
        ]);
    }

    /**
     * Chi tiết nhân viên với thống kê
     */
    public function show($id)
    {
        $staff = User::whereIn('role', ['Stylist', 'Admin'])->findOrFail($id);

        // Thống kê tổng quan
        $totalAppointments = Appointment::where('staff_id', $id)->count();
        $completedAppointments = Appointment::where('staff_id', $id)->where('status', 'Completed')->count();
        $thisMonthAppointments = Appointment::where('staff_id', $id)
            ->whereBetween('appointment_date', [now()->startOfMonth(), now()->endOfMonth()])
            ->count();

        return response()->json([
            'message' => 'Staff details retrieved successfully',
            'data' => [
                'info' => [
                    'id' => $staff->id,
                    'name' => $staff->name,
                    'username' => $staff->username,
                    'email' => $staff->email,
                    'role' => $staff->role,
                    'phone_number' => $staff->phone_number,
                    'is_active' => $staff->is_active,
                    'created_at' => $staff->created_at
                ],
                'statistics' => [
                    'total_appointments' => $totalAppointments,
                    'completed_appointments' => $completedAppointments,
                    'this_month_appointments' => $thisMonthAppointments,
                    'completion_rate' => $totalAppointments > 0 
                        ? round(($completedAppointments / $totalAppointments) * 100, 2) 
                        : 0
                ]
            ]
        ]);
    }

    /**
     * So sánh hiệu suất giữa các nhân viên
     */
    public function compare(Request $request)
    {
        $request->validate([
            'staff_ids' => 'required|array|min:2',
            'staff_ids.*' => 'exists:users,id'
        ]);

        $staffIds = $request->staff_ids;
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());

        $comparison = User::whereIn('id', $staffIds)
            ->whereIn('role', ['Stylist', 'Admin'])
            ->with(['staffAppointments' => function($query) use ($startDate, $endDate) {
                $query->whereBetween('appointment_date', [$startDate, $endDate]);
            }])
            ->get()
            ->map(function($staff) {
                $appointments = $staff->staffAppointments;
                
                return [
                    'staff_id' => $staff->id,
                    'staff_name' => $staff->name,
                    'role' => $staff->role,
                    'total_appointments' => $appointments->count(),
                    'completed' => $appointments->where('status', 'Completed')->count(),
                    'completion_rate' => $appointments->count() > 0 
                        ? round(($appointments->where('status', 'Completed')->count() / $appointments->count()) * 100, 2) 
                        : 0
                ];
            });

        return response()->json([
            'message' => 'Staff comparison retrieved successfully',
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate
            ],
            'data' => $comparison
        ]);
    }

    /**
     * Thống kê của nhân viên hiện tại (Staff only)
     */
    public function myStatistics(Request $request)
    {
        $user = $request->user();
        
        // Chỉ cho phép Staff/Stylist xem
        if (!in_array($user->role, ['Stylist', 'Admin'])) {
            return response()->json([
                'message' => 'Unauthorized. Only staff can access this.'
            ], 403);
        }

        // Tổng số lịch hẹn được phân công
        $totalAppointments = Appointment::where('staff_id', $user->id)->count();
        
        // Lịch hẹn theo trạng thái
        $appointmentsByStatus = Appointment::where('staff_id', $user->id)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        $pending = $appointmentsByStatus->firstWhere('status', 'Pending')?->count ?? 0;
        $confirmed = $appointmentsByStatus->firstWhere('status', 'Confirmed')?->count ?? 0;
        $completed = $appointmentsByStatus->firstWhere('status', 'Completed')?->count ?? 0;
        $cancelled = $appointmentsByStatus->firstWhere('status', 'Cancelled')?->count ?? 0;

        // Lịch hẹn hôm nay
        $todayAppointments = Appointment::where('staff_id', $user->id)
            ->whereDate('appointment_date', today())
            ->count();

        // Lịch hẹn tuần này
        $thisWeekAppointments = Appointment::where('staff_id', $user->id)
            ->whereBetween('appointment_date', [now()->startOfWeek(), now()->endOfWeek()])
            ->count();

        // Lịch hẹn tháng này
        $thisMonthAppointments = Appointment::where('staff_id', $user->id)
            ->whereBetween('appointment_date', [now()->startOfMonth(), now()->endOfMonth()])
            ->count();

        // Completion rate
        $completionRate = $totalAppointments > 0 
            ? round(($completed / $totalAppointments) * 100, 2) 
            : 0;

        return response()->json([
            'message' => 'My statistics retrieved successfully',
            'data' => [
                'total_appointments' => $totalAppointments,
                'pending' => $pending,
                'confirmed' => $confirmed,
                'completed' => $completed,
                'cancelled' => $cancelled,
                'today_appointments' => $todayAppointments,
                'this_week_appointments' => $thisWeekAppointments,
                'this_month_appointments' => $thisMonthAppointments,
                'completion_rate' => $completionRate,
                'staff_info' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role
                ]
            ]
        ]);
    }
}
