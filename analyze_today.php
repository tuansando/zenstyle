<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Appointment;
use App\Models\SalonSetting;
use Carbon\Carbon;

echo "=== TODAY'S CAPACITY ANALYSIS ===\n\n";

$today = '2026-01-19';
$maxConcurrent = SalonSetting::getValue('max_concurrent_appointments', 5);
$maxDaily = SalonSetting::getValue('max_daily_appointments', 30);

echo "Date: {$today}\n";
echo "Max Concurrent: {$maxConcurrent}\n";
echo "Max Daily: {$maxDaily}\n\n";

$appointments = Appointment::whereDate('appointment_date', $today)
    ->orderBy('appointment_date')
    ->get();

echo "Total appointments today: " . $appointments->count() . "\n\n";

if ($appointments->count() > 0) {
    echo "Detailed Schedule:\n";
    echo "==================\n";
    foreach ($appointments as $apt) {
        $start = Carbon::parse($apt->appointment_date);
        $end = Carbon::parse($apt->end_time);
        $duration = $start->diffInMinutes($end);
        
        echo sprintf(
            "ID %d: %s - %s (%d min) [%s]\n",
            $apt->appointment_id,
            $start->format('H:i'),
            $end->format('H:i'),
            $duration,
            $apt->status
        );
    }
    
    echo "\nConcurrent Analysis:\n";
    echo "====================\n";
    
    // Check each time slot
    $workStart = Carbon::parse("{$today} 09:00");
    $workEnd = Carbon::parse("{$today} 18:00");
    $current = $workStart->copy();
    
    $overloadedSlots = [];
    
    while ($current->lessThan($workEnd)) {
        $slotEnd = $current->copy()->addMinutes(30);
        
        $concurrent = Appointment::where('appointment_date', '<', $slotEnd)
            ->where('end_time', '>', $current)
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->count();
        
        if ($concurrent > 0 || $concurrent >= $maxConcurrent) {
            $status = $concurrent >= $maxConcurrent ? '❌ FULL' : '✅ OK';
            echo sprintf(
                "%s: %d/%d concurrent %s\n",
                $current->format('H:i'),
                $concurrent,
                $maxConcurrent,
                $status
            );
            
            if ($concurrent >= $maxConcurrent) {
                $overloadedSlots[] = $current->format('H:i');
            }
        }
        
        $current->addMinutes(30);
    }
    
    if (count($overloadedSlots) > 0) {
        echo "\n❌ OVERLOADED TIME SLOTS:\n";
        foreach ($overloadedSlots as $slot) {
            echo "- {$slot}\n";
        }
        
        echo "\nREASON: max_concurrent_appointments = {$maxConcurrent} is too low!\n";
        echo "SOLUTION: Increase max_concurrent_appointments in salon_settings\n";
        echo "  OR     : Cancel/reschedule some appointments\n";
    }
}

// Check if daily limit exceeded
$todayPending = Appointment::whereDate('appointment_date', $today)
    ->whereIn('status', ['Pending', 'Confirmed'])
    ->count();

echo "\n\nDaily Capacity:\n";
echo "===============\n";
echo "Pending/Confirmed: {$todayPending} / {$maxDaily}\n";

if ($todayPending >= $maxDaily) {
    echo "❌ DAILY LIMIT REACHED!\n";
} else {
    echo "✅ Daily limit OK ({$todayPending}/{$maxDaily})\n";
}
