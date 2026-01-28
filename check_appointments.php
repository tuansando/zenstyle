<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Appointment;

echo "=== APPOINTMENT DATA CHECK ===\n\n";

$nullEndTime = Appointment::whereNull('end_time')->count();
$totalAppointments = Appointment::count();
$withEndTime = Appointment::whereNotNull('end_time')->count();

echo "Total appointments: {$totalAppointments}\n";
echo "With end_time: {$withEndTime}\n";
echo "NULL end_time: {$nullEndTime}\n\n";

if ($nullEndTime > 0) {
    echo "❌ PROBLEM FOUND: {$nullEndTime} appointments have NULL end_time!\n";
    echo "This causes capacity check to fail.\n\n";
    
    echo "Sample appointments with NULL end_time:\n";
    $samples = Appointment::whereNull('end_time')->limit(5)->get();
    foreach ($samples as $apt) {
        echo "- ID {$apt->appointment_id}: {$apt->appointment_date} (Status: {$apt->status})\n";
    }
    
    echo "\nFIX: Run this SQL to calculate end_time:\n";
    echo "UPDATE appointments SET end_time = DATE_ADD(appointment_date, INTERVAL 60 MINUTE) WHERE end_time IS NULL;\n";
} else {
    echo "✅ All appointments have end_time set.\n";
}

echo "\nAppointments by date:\n";
$byDate = Appointment::selectRaw('DATE(appointment_date) as date, COUNT(*) as count')
    ->groupBy('date')
    ->orderBy('date', 'desc')
    ->limit(10)
    ->get();

foreach ($byDate as $row) {
    echo "- {$row->date}: {$row->count} appointments\n";
}
