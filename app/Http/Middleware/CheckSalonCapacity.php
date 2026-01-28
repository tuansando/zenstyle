<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Appointment;
use App\Models\SalonSetting;
use Carbon\Carbon;

class CheckSalonCapacity
{
    /**
     * Handle an incoming request.
     * 
     * This middleware checks salon capacity limits:
     * 1. Maximum concurrent appointments (salon physical capacity)
     * 2. Maximum daily appointments
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if capacity checking is enabled
        $isEnabled = SalonSetting::getValue('enable_capacity_check', true);
        
        if (!$isEnabled) {
            return $next($request);
        }

        // Get appointment details from request
        $appointmentDate = $request->appointment_date;
        
        if (!$appointmentDate) {
            return $next($request);
        }

        $startTime = Carbon::parse($appointmentDate);
        
        // Calculate end time based on selected services
        $serviceDuration = 0;
        if ($request->has('service_ids') && is_array($request->service_ids)) {
            // Cast to integer to avoid passing string values to Carbon::addMinutes()
            $serviceDuration = (int) \App\Models\Service::whereIn('id', $request->service_ids)
                ->sum('duration_minutes');
        }
        
        $endTime = $startTime->copy()->addMinutes($serviceDuration ?: 60);
        $date = $startTime->format('Y-m-d');

        // CHECK 1: Maximum Daily Appointments
        $maxDailyAppointments = SalonSetting::getValue('max_daily_appointments', 30);
        
        $dailyCount = Appointment::whereDate('appointment_date', $date)
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->count();

        if ($dailyCount >= $maxDailyAppointments) {
            return response()->json([
                'message' => "The salon is fully booked for this day. Maximum daily appointments ({$maxDailyAppointments}) reached.",
                'error' => 'Daily capacity exceeded',
                'capacity_info' => [
                    'current_bookings' => $dailyCount,
                    'max_allowed' => $maxDailyAppointments,
                    'available_slots' => 0
                ],
                'suggestion' => 'Please choose another date or contact us for waiting list.',
                'date' => $date
            ], 422);
        }

        // CHECK 2: Maximum Concurrent Appointments (Physical Capacity)
        $maxConcurrent = SalonSetting::getValue('max_concurrent_appointments', 5);
        
        // Find all appointments that overlap with the requested time slot
        $concurrentCount = Appointment::where(function ($query) use ($startTime, $endTime) {
                $query->where('appointment_date', '<', $endTime)
                      ->where('end_time', '>', $startTime);
            })
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->count();

        if ($concurrentCount >= $maxConcurrent) {
            // Get next available time slot
            $nextAvailable = $this->findNextAvailableSlot($date, $maxConcurrent);
            
            return response()->json([
                'message' => "The salon is at full capacity for this time slot. All {$maxConcurrent} service stations are occupied.",
                'error' => 'Concurrent capacity exceeded',
                'capacity_info' => [
                    'current_concurrent' => $concurrentCount,
                    'max_capacity' => $maxConcurrent,
                    'available_stations' => 0
                ],
                'next_available_slot' => $nextAvailable,
                'suggestion' => 'Please choose another time or we can add you to the waiting list.'
            ], 422);
        }

        // CHECK 3: Capacity Warning (Near Full)
        $warningThreshold = SalonSetting::getValue('capacity_warning_threshold', 80);
        $capacityPercentage = ($concurrentCount / $maxConcurrent) * 100;

        if ($capacityPercentage >= $warningThreshold) {
            // Add warning to response but allow booking
            $request->attributes->add([
                'capacity_warning' => [
                    'message' => 'Salon is near capacity',
                    'current_capacity' => round($capacityPercentage, 1) . '%',
                    'available_stations' => $maxConcurrent - $concurrentCount
                ]
            ]);
        }

        return $next($request);
    }

    /**
     * Find next available time slot
     */
    private function findNextAvailableSlot(string $date, int $maxConcurrent): ?array
    {
        $workStart = Carbon::parse($date . ' ' . SalonSetting::getValue('working_hours_start', '09:00'));
        $workEnd = Carbon::parse($date . ' ' . SalonSetting::getValue('working_hours_end', '18:00'));
        
        $currentTime = $workStart->copy();
        
        // Check every 30-minute interval
        while ($currentTime->lessThan($workEnd)) {
            $slotStart = $currentTime->copy();
            $slotEnd = $currentTime->copy()->addMinutes(30);
            
            $count = Appointment::where('appointment_date', '<', $slotEnd)
                ->where('end_time', '>', $slotStart)
                ->whereIn('status', ['Pending', 'Confirmed'])
                ->count();
            
            if ($count < $maxConcurrent) {
                return [
                    'date' => $slotStart->format('Y-m-d'),
                    'time' => $slotStart->format('H:i'),
                    'datetime' => $slotStart->format('Y-m-d H:i:s'),
                    'available_stations' => $maxConcurrent - $count
                ];
            }
            
            $currentTime->addMinutes(30);
        }
        
        return null; // No available slot today
    }
}
