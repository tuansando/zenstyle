<?php

namespace App\Http\Controllers;

use App\Models\SalonSetting;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SalonCapacityController extends Controller
{
    /**
     * Get current salon capacity dashboard
     */
    public function dashboard(Request $request)
    {
        $date = $request->input('date', Carbon::today()->format('Y-m-d'));
        $parsedDate = Carbon::parse($date);
        
        // Get settings
        $maxConcurrent = SalonSetting::getValue('max_concurrent_appointments', 5);
        $maxDaily = SalonSetting::getValue('max_daily_appointments', 30);
        $workStart = SalonSetting::getValue('working_hours_start', '09:00');
        $workEnd = SalonSetting::getValue('working_hours_end', '18:00');
        
        // Get daily appointments
        $dailyAppointments = Appointment::whereDate('appointment_date', $date)
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->with(['client:id,name', 'staff:id,name', 'details.service:id,service_name'])
            ->orderBy('appointment_date')
            ->get();
        
        $dailyCount = $dailyAppointments->count();
        
        // Calculate hourly capacity
        $hourlyCapacity = $this->calculateHourlyCapacity($date, $maxConcurrent, $workStart, $workEnd);
        
        // Get peak hours
        $peakHours = $this->getPeakHours($date);
        
        // Current concurrent (if date is today)
        $currentConcurrent = 0;
        if ($parsedDate->isToday()) {
            $now = Carbon::now();
            $currentConcurrent = Appointment::where('appointment_date', '<=', $now)
                ->where('end_time', '>', $now)
                ->whereIn('status', ['Pending', 'Confirmed'])
                ->count();
        }
        
        return response()->json([
            'date' => $date,
            'capacity_settings' => [
                'max_concurrent_appointments' => $maxConcurrent,
                'max_daily_appointments' => $maxDaily,
                'working_hours' => [
                    'start' => $workStart,
                    'end' => $workEnd
                ]
            ],
            'currency_settings' => [
                'locale' => SalonSetting::getValue('currency_locale', 'vi-VN'),
                'currency' => SalonSetting::getValue('currency_code', 'VND'),
                'fraction_digits' => (int) SalonSetting::getValue('currency_fraction_digits', 0)
            ],
            'current_status' => [
                'total_appointments_today' => $dailyCount,
                'current_concurrent' => $currentConcurrent,
                'available_daily_slots' => max(0, $maxDaily - $dailyCount),
                'daily_capacity_percentage' => round(($dailyCount / $maxDaily) * 100, 1),
                'status' => $this->getCapacityStatus($dailyCount, $maxDaily)
            ],
            'appointments' => $dailyAppointments,
            'hourly_capacity' => $hourlyCapacity,
            'peak_hours' => $peakHours,
            'recommendations' => $this->getRecommendations($dailyCount, $maxDaily, $hourlyCapacity)
        ]);
    }

    /**
     * Get salon settings
     */
    public function getSettings()
    {
        $settings = SalonSetting::all();
        
        return response()->json([
            'settings' => $settings,
            'current_values' => SalonSetting::getAll()
        ]);
    }

    /**
     * Update salon settings (Admin only)
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|exists:salon_settings,key',
            'settings.*.value' => 'required',
        ]);

        foreach ($validated['settings'] as $setting) {
            $existingSetting = SalonSetting::where('key', $setting['key'])->first();
            
            if ($existingSetting) {
                SalonSetting::setValue(
                    $setting['key'],
                    $setting['value'],
                    $existingSetting->type
                );
            }
        }

        // Clear cache
        SalonSetting::clearCache();

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => SalonSetting::getAll()
        ]);
    }

    /**
     * Check availability for a specific time range
     */
    public function checkCapacity(Request $request)
    {
        $validated = $request->validate([
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
        ]);

        $startTime = Carbon::parse($validated['start_time']);
        $endTime = Carbon::parse($validated['end_time']);
        $date = $startTime->format('Y-m-d');

        $maxConcurrent = SalonSetting::getValue('max_concurrent_appointments', 5);
        $maxDaily = SalonSetting::getValue('max_daily_appointments', 30);

        // Check daily capacity
        $dailyCount = Appointment::whereDate('appointment_date', $date)
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->count();

        // Check concurrent capacity for this time slot
        $concurrentCount = Appointment::where('appointment_date', '<', $endTime)
            ->where('end_time', '>', $startTime)
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->count();

        $isAvailable = ($dailyCount < $maxDaily) && ($concurrentCount < $maxConcurrent);

        return response()->json([
            'is_available' => $isAvailable,
            'capacity_info' => [
                'daily' => [
                    'current' => $dailyCount,
                    'max' => $maxDaily,
                    'available' => $maxDaily - $dailyCount,
                    'percentage' => round(($dailyCount / $maxDaily) * 100, 1)
                ],
                'concurrent' => [
                    'current' => $concurrentCount,
                    'max' => $maxConcurrent,
                    'available' => $maxConcurrent - $concurrentCount,
                    'percentage' => round(($concurrentCount / $maxConcurrent) * 100, 1)
                ]
            ],
            'time_slot' => [
                'start' => $startTime->format('Y-m-d H:i:s'),
                'end' => $endTime->format('Y-m-d H:i:s')
            ]
        ]);
    }

    /**
     * Get available time slots for a date
     */
    public function getAvailableSlots(Request $request)
    {
        $date = $request->input('date', Carbon::today()->format('Y-m-d'));
        $duration = (int) $request->input('duration', 60); // Cast to integer
        
        $maxConcurrent = SalonSetting::getValue('max_concurrent_appointments', 5);
        $workStart = Carbon::parse($date . ' ' . SalonSetting::getValue('working_hours_start', '09:00'));
        $workEnd = Carbon::parse($date . ' ' . SalonSetting::getValue('working_hours_end', '18:00'));
        
        $availableSlots = [];
        $currentTime = $workStart->copy();
        
        // Check every 30-minute interval
        while ($currentTime->copy()->addMinutes($duration)->lessThanOrEqualTo($workEnd)) {
            $slotStart = $currentTime->copy();
            $slotEnd = $slotStart->copy()->addMinutes($duration);
            
            $concurrentCount = Appointment::where('appointment_date', '<', $slotEnd)
                ->where('end_time', '>', $slotStart)
                ->whereIn('status', ['Pending', 'Confirmed'])
                ->count();
            
            $available = $maxConcurrent - $concurrentCount;
            
            if ($available > 0) {
                $availableSlots[] = [
                    'time' => $slotStart->format('H:i'),
                    'start_time' => $slotStart->format('H:i'),
                    'end_time' => $slotEnd->format('H:i'),
                    'datetime' => $slotStart->format('Y-m-d H:i:s'),
                    'available_stations' => $available,
                    'max_capacity' => $maxConcurrent,
                    'capacity_percentage' => round((($maxConcurrent - $available) / $maxConcurrent) * 100, 1),
                    'status' => $this->getSlotStatus($available, $maxConcurrent)
                ];
            }
            
            $currentTime->addMinutes(30);
        }
        
        return response()->json([
            'date' => $date,
            'duration' => $duration,
            'total_available_slots' => count($availableSlots),
            'available_slots' => $availableSlots,
            'slots' => $availableSlots // Keep backward compatibility
        ]);
    }

    /**
     * Calculate hourly capacity
     */
    private function calculateHourlyCapacity(string $date, int $maxConcurrent, string $workStart, string $workEnd): array
    {
        $startHour = Carbon::parse($date . ' ' . $workStart);
        $endHour = Carbon::parse($date . ' ' . $workEnd);
        
        $hourlyData = [];
        $current = $startHour->copy();
        
        while ($current->lessThan($endHour)) {
            $hourEnd = $current->copy()->addHour();
            
            $count = Appointment::where('appointment_date', '<', $hourEnd)
                ->where('end_time', '>', $current)
                ->whereIn('status', ['Pending', 'Confirmed'])
                ->count();
            
            $hourlyData[] = [
                'hour' => $current->format('H:00'),
                'appointments' => $count,
                'capacity_percentage' => round(($count / $maxConcurrent) * 100, 1),
                'available' => max(0, $maxConcurrent - $count)
            ];
            
            $current->addHour();
        }
        
        return $hourlyData;
    }

    /**
     * Get peak hours
     */
    private function getPeakHours(string $date): array
    {
        $appointments = Appointment::whereDate('appointment_date', $date)
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->get();
        
        $hourCounts = [];
        
        foreach ($appointments as $apt) {
            $hour = Carbon::parse($apt->appointment_date)->format('H:00');
            $hourCounts[$hour] = ($hourCounts[$hour] ?? 0) + 1;
        }
        
        arsort($hourCounts);
        
        return array_slice($hourCounts, 0, 3, true);
    }

    /**
     * Get capacity status
     */
    private function getCapacityStatus(int $current, int $max): string
    {
        $percentage = ($current / $max) * 100;
        
        return match (true) {
            $percentage >= 90 => 'critical',
            $percentage >= 80 => 'high',
            $percentage >= 60 => 'moderate',
            default => 'low'
        };
    }

    /**
     * Get slot status
     */
    private function getSlotStatus(int $available, int $max): string
    {
        $percentage = (($max - $available) / $max) * 100;
        
        return match (true) {
            $available === $max => 'available',
            $percentage >= 80 => 'limited',
            default => 'available'
        };
    }

    /**
     * Get recommendations
     */
    private function getRecommendations(int $dailyCount, int $maxDaily, array $hourlyCapacity): array
    {
        $recommendations = [];
        
        // Check daily capacity
        $dailyPercentage = ($dailyCount / $maxDaily) * 100;
        
        if ($dailyPercentage >= 90) {
            $recommendations[] = [
                'type' => 'critical',
                'message' => 'Daily capacity is almost full. Consider limiting new bookings.',
                'action' => 'restrict_booking'
            ];
        } elseif ($dailyPercentage >= 80) {
            $recommendations[] = [
                'type' => 'warning',
                'message' => 'Daily capacity is high. Monitor closely.',
                'action' => 'monitor'
            ];
        }
        
        // Find best time slots
        $bestSlots = array_filter($hourlyData ?? $hourlyCapacity, function($slot) {
            return $slot['capacity_percentage'] < 50;
        });
        
        if (!empty($bestSlots)) {
            $recommendations[] = [
                'type' => 'info',
                'message' => 'Recommend these time slots with lower occupancy',
                'best_hours' => array_column(array_slice($bestSlots, 0, 3), 'hour')
            ];
        }
        
        return $recommendations;
    }
}
