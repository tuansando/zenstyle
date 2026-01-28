<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Appointment;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class PreventBookingSpam
{
    /**
     * Handle an incoming request.
     * 
     * This middleware prevents booking spam by checking:
     * 1. Maximum pending appointments per user
     * 2. Minimum time between bookings
     * 3. Maximum bookings per day
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        
        if (!$user) {
            return $next($request);
        }

        $clientId = $user->role === 'Client' ? $user->id : $request->client_id;

        if (!$clientId) {
            return $next($request);
        }

        // Check 1: Maximum pending appointments (already in controller, but double-check here)
        $pendingCount = Appointment::where('client_id', $clientId)
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->count();

        if ($pendingCount >= 3) {
            return response()->json([
                'message' => 'Booking limit reached. You have 3 active bookings.',
                'error' => 'Maximum pending appointments exceeded',
                'current_pending' => $pendingCount,
                'max_allowed' => 3
            ], 429);
        }

        // Check 2: Minimum time between bookings (prevent rapid spam)
        // User must wait at least 5 seconds between booking attempts (reduced for testing)
        $lastBooking = Appointment::where('client_id', $clientId)
            ->latest('created_at')
            ->first();

        if ($lastBooking) {
            $timeSinceLastBooking = Carbon::now()->diffInSeconds($lastBooking->created_at);
            $minimumWaitTime = 5; // seconds (reduced from 30 for better UX during testing)

            if ($timeSinceLastBooking < $minimumWaitTime) {
                $waitTime = $minimumWaitTime - $timeSinceLastBooking;
                return response()->json([
                    'message' => "Please wait {$waitTime} seconds before making another booking.",
                    'error' => 'Booking too quickly',
                    'wait_seconds' => $waitTime,
                    'retry_after' => $waitTime
                ], 429);
            }
        }

        // Check 3: Maximum bookings per day (prevent excessive bookings)
        $todayBookingsCount = Appointment::where('client_id', $clientId)
            ->whereDate('created_at', Carbon::today())
            ->count();

        $maxBookingsPerDay = 5;

        if ($todayBookingsCount >= $maxBookingsPerDay) {
            return response()->json([
                'message' => "You have reached the maximum bookings per day ({$maxBookingsPerDay}).",
                'error' => 'Daily booking limit exceeded',
                'current_today' => $todayBookingsCount,
                'max_allowed' => $maxBookingsPerDay
            ], 429);
        }

        // Check 4: Prevent booking same time slot multiple times (duplicate prevention)
        if ($request->has('appointment_date') && $request->has('staff_id')) {
            $appointmentDate = $request->appointment_date;
            $staffId = $request->staff_id;

            $duplicateBooking = Appointment::where('client_id', $clientId)
                ->where('staff_id', $staffId)
                ->where('appointment_date', $appointmentDate)
                ->whereIn('status', ['Pending', 'Confirmed'])
                ->exists();

            if ($duplicateBooking) {
                return response()->json([
                    'message' => 'You already have a booking at this time with this staff.',
                    'error' => 'Duplicate booking detected'
                ], 422);
            }
        }

        return $next($request);
    }
}
