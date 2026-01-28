                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\SalonSetting;
use App\Models\Appointment;
use Carbon\Carbon;

echo "=== CAPACITY DEBUG ===\n\n";

// 1. Check Settings
echo "1. SALON SETTINGS:\n";
echo "==================\n";
$settings = SalonSetting::all();
foreach ($settings as $setting) {
    echo "{$setting->key} = {$setting->value}\n";
}

echo "\n2. APPOINTMENTS TODAY:\n";
echo "======================\n";
$today = Carbon::today();
$appointments = Appointment::whereDate('appointment_date', $today)
    ->orderBy('appointment_date')
    ->get();

echo "Date: {$today->format('Y-m-d')}\n";
echo "Total appointments: " . $appointments->count() . "\n\n";

if ($appointments->count() > 0) {
    foreach ($appointments as $apt) {
        $aptTime = Carbon::parse($apt->appointment_date);
        echo "- {$aptTime->format('H:i')} (Status: {$apt->status}, Duration: {$apt->duration}min)\n";
    }
} else {
    echo "No appointments found for today.\n";
}

echo "\n3. APPOINTMENTS BY STATUS:\n";
echo "===========================\n";
$statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
foreach ($statuses as $status) {
    $count = Appointment::whereDate('appointment_date', $today)
        ->where('status', $status)
        ->count();
    echo "{$status}: {$count}\n";
}

echo "\n4. CHECK SPECIFIC TIME SLOT (09:00):\n";
echo "=====================================\n";
$time = '09:00:00';
$datetime = Carbon::parse("{$today->format('Y-m-d')} {$time}");

// Get all appointments that overlap with this slot
$overlapping = Appointment::whereDate('appointment_date', $today)
    ->whereIn('status', ['pending', 'confirmed'])
    ->where(function($q) use ($datetime) {
        $q->where(function($query) use ($datetime) {
            $slotEnd = $datetime->copy()->addMinutes(30);
            $query->whereRaw('TIME(appointment_date) < ?', [$slotEnd->format('H:i:s')])
                  ->whereRaw('DATE_ADD(appointment_date, INTERVAL COALESCE(duration, 60) MINUTE) > ?', 
                            [$datetime->format('H:i:s')]);
        });
    })
    ->get();

echo "Time slot: {$time}\n";
echo "Overlapping appointments: " . $overlapping->count() . "\n";

if ($overlapping->count() > 0) {
    foreach ($overlapping as $apt) {
        $startTime = Carbon::parse($apt->appointment_date);
        $endTime = $startTime->copy()->addMinutes($apt->duration ?? 60);
        echo "  - {$startTime->format('H:i')} to {$endTime->format('H:i')} (duration: {$apt->duration}min)\n";
    }
}

$maxConcurrent = SalonSetting::where('key', 'max_concurrent_appointments')->value('value') ?? 8;
$available = $maxConcurrent - $overlapping->count();
echo "Max concurrent: {$maxConcurrent}\n";
echo "Available stations: {$available}\n";

echo "\n5. CAPACITY CHECK FOR BOOKING:\n";
echo "===============================\n";
$testDate = '2026-01-19';
$testTime = '14:00';
$testDuration = 60;

$dailyCount = Appointment::whereDate('appointment_date', $testDate)
    ->whereIn('status', ['pending', 'confirmed'])
    ->count();

$maxDaily = SalonSetting::where('key', 'max_daily_appointments')->value('value') ?? 50;

echo "Test booking: {$testDate} {$testTime} ({$testDuration}min)\n";
echo "Daily appointments: {$dailyCount} / {$maxDaily}\n";

if ($dailyCount >= $maxDaily) {
    echo "❌ DAILY LIMIT REACHED!\n";
} else {
    echo "✅ Daily limit OK\n";
}

// Check concurrent for test time
$testDatetime = Carbon::parse("{$testDate} {$testTime}");
$overlappingTest = Appointment::whereDate('appointment_date', $testDate)
    ->whereIn('status', ['pending', 'confirmed'])
    ->where(function($q) use ($testDatetime, $testDuration) {
        $q->where(function($query) use ($testDatetime, $testDuration) {
            $slotEnd = $testDatetime->copy()->addMinutes($testDuration);
            $query->whereRaw('TIME(appointment_date) < ?', [$slotEnd->format('H:i:s')])
                  ->whereRaw('DATE_ADD(appointment_date, INTERVAL COALESCE(duration, 60) MINUTE) > ?', 
                            [$testDatetime->format('H:i:s')]);
        });
    })
    ->count();

$availableTest = $maxConcurrent - $overlappingTest;
echo "Concurrent appointments at {$testTime}: {$overlappingTest} / {$maxConcurrent}\n";
echo "Available stations: {$availableTest}\n";

if ($availableTest <= 0) {
    echo "❌ TIME SLOT FULL!\n";
} else {
    echo "✅ Time slot available\n";
}

echo "\n6. CLEAR OLD APPOINTMENTS (if needed):\n";
echo "=======================================\n";
echo "Run this command to clear test data:\n";
echo "DELETE FROM appointments WHERE appointment_date >= '2026-01-19';\n";
