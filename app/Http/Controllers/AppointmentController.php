<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\AppointmentDetail;
use App\Models\Service;
use App\Models\User;
use App\Services\CouponService;
use Illuminate\Http\Request;
use Carbon\Carbon; // Library for time calculation
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    /**
     * Check staff availability for a specific date
     * PUBLIC endpoint - anyone can check availability
     */
    public function checkAvailability(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'staff_id' => 'required|exists:users,id'
        ]);

        $date = Carbon::parse($request->date)->format('Y-m-d');
        $staffId = $request->staff_id;

        // Get staff info
        $staff = User::find($staffId);

        if (!$staff || !in_array($staff->role, ['Stylist', 'Admin'])) {
            return response()->json([
                'message' => 'Invalid staff member'
            ], 404);
        }

        // Get all appointments for this staff on this date
        $appointments = Appointment::where('staff_id', $staffId)
            ->whereDate('appointment_date', $date)
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->orderBy('appointment_date')
            ->get(['appointment_id', 'appointment_date', 'end_time', 'status']);

        // Working hours (9 AM - 6 PM)
        $workStart = Carbon::parse($date . ' 09:00:00');
        $workEnd = Carbon::parse($date . ' 18:00:00');

        // Calculate busy times
        $busySlots = [];
        $availableSlots = [];

        foreach ($appointments as $apt) {
            $busySlots[] = [
                'start' => Carbon::parse($apt->appointment_date)->format('H:i'),
                'end' => Carbon::parse($apt->end_time)->format('H:i'),
                'appointment_id' => $apt->appointment_id
            ];
        }

        // Simple availability calculation
        $totalMinutes = $workStart->diffInMinutes($workEnd);
        $busyMinutes = 0;

        foreach ($appointments as $apt) {
            $start = Carbon::parse($apt->appointment_date);
            $end = Carbon::parse($apt->end_time);
            $busyMinutes += $start->diffInMinutes($end);
        }

        $availableMinutes = $totalMinutes - $busyMinutes;

        return response()->json([
            'date' => $date,
            'staff' => [
                'id' => $staff->id,
                'name' => $staff->name,
                'role' => $staff->role
            ],
            'working_hours' => [
                'start' => '09:00',
                'end' => '18:00'
            ],
            'busy_slots' => $busySlots,
            'statistics' => [
                'total_appointments' => $appointments->count(),
                'total_minutes' => $totalMinutes,
                'busy_minutes' => $busyMinutes,
                'available_minutes' => $availableMinutes,
                'availability_percentage' => $totalMinutes > 0 ? round(($availableMinutes / $totalMinutes) * 100, 2) : 100
            ],
            'is_available' => $availableMinutes > 0
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validate incoming request
        $validated = $request->validate([
            'staff_id' => 'nullable|exists:users,id', // Optional - auto-assign if not provided
            'appointment_date' => 'required|date|after:now', // Start time must be in future
            'service_ids' => 'required|array', // List of services selected
            'service_ids.*' => 'exists:services,id',
            'coupon_code' => 'nullable|string',
        ]);

        // Get current User ID (The Client)
        $user = Auth::user();

        if ($user->role === 'Client') {
            // If it's a client, they book for themselves
            $clientId = $user->id;
        } else {
            // If Admin/Receptionist is booking FOR a client
            // Validate that 'client_id' is sent in the request
            $request->validate(['client_id' => 'required|exists:users,id']);
            $clientId = $request->client_id;
        }

        // --- REQUIREMENT: SPAM PREVENTION ---
        // Check if user has too many pending appointments (Limit: 3)
        $pendingCount = Appointment::where('client_id', $clientId)
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->count();

        if ($pendingCount >= 3) {
            return response()->json(['message' => 'Limit reached: You have 3 active bookings.'], 422);
        }

        // --- REQUIREMENT: DURATION CALCULATION ---
        // Calculate total time based on selected services
        $services = Service::whereIn('id', $request->service_ids)->get();
        $totalDuration = (int) $services->sum('duration_minutes'); // Cast to integer
        $totalAmount = $services->sum('price');

        $startTime = Carbon::parse($request->appointment_date);
        $endTime = $startTime->copy()->addMinutes($totalDuration); // Auto-calculate End Time

        // --- AUTO-ASSIGN STAFF IF NOT PROVIDED ---
        $staffId = $request->staff_id;

        if (!$staffId) {
            // Find an available staff member (Stylist or Admin)
            $availableStaff = User::whereIn('role', ['Stylist', 'Admin'])
                ->where('is_active', true)
                ->whereDoesntHave('staffAppointments', function ($query) use ($startTime, $endTime) {
                    $query->whereIn('status', ['Pending', 'Confirmed'])
                        ->where('appointment_date', '<', $endTime)
                        ->where('end_time', '>', $startTime);
                })
                ->first();

            if (!$availableStaff) {
                return response()->json(['message' => 'No staff available at this time. Please choose another time.'], 422);
            }

            $staffId = $availableStaff->id;
        }

        // --- REQUIREMENT: STAFF CAPACITY CHECK ---
        // Check if the selected staff is busy in the calculated time range
        $isConflict = Appointment::where('staff_id', $staffId)
            ->whereIn('status', ['Pending', 'Confirmed']) // Only check valid bookings
            ->where(function ($query) use ($startTime, $endTime) {
                // Logic: (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)
                $query->where('appointment_date', '<', $endTime)
                    ->where('end_time', '>', $startTime);
            })
            ->exists();

        if ($isConflict) {
            return response()->json(['message' => 'The selected stylist is busy at this time.'], 422);
        }

        // --- APPLY COUPON DISCOUNT ---
        $discountAmount = 0;
        $finalAmount = $totalAmount;
        $couponCode = null;

        if ($request->filled('coupon_code')) {
            $couponResult = CouponService::applyCoupon(
                $request->coupon_code,
                $totalAmount,
                $user->id
            );

            if (!$couponResult['valid']) {
                return response()->json([
                    'message' => $couponResult['message']
                ], 422);
            }

            $discountAmount = $couponResult['discount'];
            $finalAmount = $couponResult['final_amount'];
            $couponCode = strtoupper(trim($request->coupon_code));
        }

        // --- SAVE TO DATABASE ---
        try {
            DB::beginTransaction();

            // Create Appointment Header
            $appointment = Appointment::create([
                'client_id' => $clientId,
                'staff_id' => $staffId,
                'appointment_date' => $startTime,
                'end_time' => $endTime, // We save this to check overlaps easily later
                'total_amount' => $totalAmount,
                'coupon_code' => $couponCode,
                'discount_amount' => $discountAmount,
                'final_amount' => $finalAmount,
                'status' => 'Pending',
                'notes' => $request->notes
            ]);

            // Create Appointment Details
            foreach ($services as $service) {
                AppointmentDetail::create([
                    'appointment_id' => $appointment->appointment_id,
                    'service_id' => $service->id,
                    'service_price' => $service->price
                ]);
            }

            DB::commit();

            // Check if there's a capacity warning from middleware
            $capacityWarning = $request->attributes->get('capacity_warning');

            $response = [
                'message' => 'Booking successful!',
                'data' => $appointment,
                'debug_status' => 201
            ];

            if ($capacityWarning) {
                $response['capacity_warning'] = $capacityWarning;
            }

            return response()->json($response, 201)->header('X-Custom-Status', '201');
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update appointment status (Admin/Staff only)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Pending,Confirmed,Completed,Cancelled'
        ]);

        $appointment = Appointment::where('appointment_id', $id)->firstOrFail();
        $oldStatus = $appointment->status;
        $newStatus = $request->status;

        $appointment->status = $newStatus;
        $appointment->save();

        // Log revenue when appointment is completed
        $revenueInfo = null;
        if ($newStatus === 'Completed' && $oldStatus !== 'Completed') {
            $revenueInfo = [
                'appointment_id' => $appointment->appointment_id,
                'revenue_added' => $appointment->total_amount,
                'client_id' => $appointment->client_id,
                'staff_id' => $appointment->staff_id,
                'completed_at' => now()->toDateTimeString()
            ];
        }

        return response()->json([
            'message' => 'Appointment status updated!',
            'data' => $appointment,
            'revenue_info' => $revenueInfo
        ]);
    }

    /**
     * Get user's appointments (Client - view own appointments)
     */
    public function myAppointments()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $appointments = Appointment::with(['details.service', 'user', 'staff', 'feedback'])
            ->where('client_id', $user->id)
            ->orderBy('appointment_date', 'desc')
            ->get();

        return response()->json([
            'message' => 'Your appointments retrieved successfully',
            'data' => $appointments
        ]);
    }

    /**
     * Get all appointments (Staff/Admin)
     */
    public function index()
    {
        $user = Auth::user();

        // Staff (Stylist/Admin with staff role) only see their own appointments
        if ($user->role === 'Stylist') {
            $appointments = Appointment::with(['details.service', 'user', 'staff'])
                ->where('staff_id', $user->id)
                ->orderBy('appointment_date', 'desc')
                ->get();
        } else {
            // Admin sees all appointments
            $appointments = Appointment::with(['details.service', 'user', 'staff'])
                ->orderBy('appointment_date', 'desc')
                ->get();
        }

        return response()->json([
            'message' => 'Appointments retrieved successfully',
            'data' => $appointments
        ]);
    }

    /**
     * Get single appointment details
     */
    public function show($id)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $appointment = Appointment::with(['details.service', 'user', 'staff'])
            ->findOrFail($id);

        // Client can only view their own appointments
        if ($user->role === 'Client' && $appointment->client_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized to view this appointment'
            ], 403);
        }

        return response()->json([
            'message' => 'Appointment details retrieved successfully',
            'data' => $appointment
        ]);
    }

    /**
     * Cancel appointment (Client can cancel their own upcoming appointments)
     */
    public function cancel($id)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $appointment = Appointment::where('appointment_id', $id)->firstOrFail();

        // Client can only cancel their own appointments
        if ($user->role === 'Client' && $appointment->client_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized to cancel this appointment'
            ], 403);
        }

        // Can't cancel completed or already cancelled appointments
        if (in_array($appointment->status, ['Completed', 'Cancelled'])) {
            return response()->json([
                'message' => 'Cannot cancel this appointment (status: ' . $appointment->status . ')'
            ], 400);
        }

        $appointment->status = 'Cancelled';
        $appointment->save();

        return response()->json([
            'message' => 'Appointment cancelled successfully',
            'data' => $appointment
        ]);
    }

    /**
     * Update appointment (Client can update their own pending appointments)
     */
    public function update(Request $request, $id)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $appointment = Appointment::where('appointment_id', $id)->firstOrFail();

        // Client can only update their own appointments
        if ($user->role === 'Client' && $appointment->client_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized to update this appointment'
            ], 403);
        }

        // Can only update pending appointments
        if ($appointment->status !== 'Pending') {
            return response()->json([
                'message' => 'Can only update pending appointments (current status: ' . $appointment->status . ')'
            ], 400);
        }

        // Validate new appointment date
        $request->validate([
            'appointment_date' => 'required|date|after:now'
        ]);

        $newAppointmentDate = Carbon::parse($request->appointment_date);

        // Calculate duration from existing appointment details
        $totalDuration = AppointmentDetail::where('appointment_id', $appointment->appointment_id)
            ->join('services', 'appointment_details.service_id', '=', 'services.id')
            ->sum('services.duration_minutes');

        // Ensure $totalDuration is an integer, fallback to 60 minutes if no details found
        $totalDuration = intval($totalDuration) ?: 60;

        $newEndTime = (clone $newAppointmentDate)->addMinutes($totalDuration);

        // Check if staff is available at new time
        $isConflict = Appointment::where('staff_id', $appointment->staff_id)
            ->where('appointment_id', '!=', $id) // Exclude current appointment
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->where(function ($query) use ($newAppointmentDate, $newEndTime) {
                $query->where('appointment_date', '<', $newEndTime)
                    ->where('end_time', '>', $newAppointmentDate);
            })
            ->exists();

        if ($isConflict) {
            return response()->json([
                'message' => 'The selected time conflicts with another appointment. Please choose a different time.'
            ], 422);
        }

        // Update appointment
        $appointment->appointment_date = $newAppointmentDate;
        $appointment->end_time = $newEndTime;
        $appointment->save();

        return response()->json([
            'message' => 'Appointment updated successfully',
            'data' => $appointment->load(['details.service', 'user', 'staff'])
        ]);
    }
}
