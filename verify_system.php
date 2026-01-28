<?php
/**
 * ZenStyle Salon - Database & API Verification Script
 * Run: php verify_system.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "\n╔════════════════════════════════════════════════════════════╗\n";
echo "║  ZenStyle Salon - System Verification                     ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";

// 1. CHECK DATABASE CONNECTION
echo "✓ Checking Database Connection...\n";
try {
    DB::connection()->getPdo();
    $dbName = DB::connection()->getDatabaseName();
    echo "  ✅ Connected to database: {$dbName}\n\n";
} catch (\Exception $e) {
    echo "  ❌ Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// 2. CHECK REQUIRED TABLES
echo "✓ Checking Database Tables...\n";
$requiredTables = [
    'users',
    'services', 
    'products',
    'appointments',
    'appointment_details',
    'blogs',
    'feedbacks'
];

$missingTables = [];
foreach ($requiredTables as $table) {
    if (Schema::hasTable($table)) {
        echo "  ✅ {$table}\n";
    } else {
        echo "  ❌ {$table} - MISSING\n";
        $missingTables[] = $table;
    }
}

if (!empty($missingTables)) {
    echo "\n⚠️  Missing tables detected. Run: php artisan migrate\n";
    exit(1);
}

// 3. CHECK APPOINTMENTS TABLE SCHEMA
echo "\n✓ Checking 'appointments' table schema...\n";
$appointmentsColumns = Schema::getColumnListing('appointments');
$requiredColumns = ['appointment_id', 'client_id', 'staff_id', 'appointment_date', 'status', 'total_amount'];

foreach ($requiredColumns as $col) {
    if (in_array($col, $appointmentsColumns)) {
        echo "  ✅ Column: {$col}\n";
    } else {
        echo "  ❌ Column: {$col} - MISSING\n";
    }
}

// 4. CHECK USERS (SEEDED DATA)
echo "\n✓ Checking Seeded Users...\n";
$adminUser = DB::table('users')->where('role', 'Admin')->first();
$stylistUser = DB::table('users')->where('role', 'Stylist')->first();

if ($adminUser) {
    echo "  ✅ Admin User: {$adminUser->email}\n";
} else {
    echo "  ❌ Admin User - NOT FOUND\n";
}

if ($stylistUser) {
    echo "  ✅ Stylist User: {$stylistUser->email}\n";
} else {
    echo "  ⚠️  Stylist User - NOT FOUND\n";
}

// 5. CHECK SERVICES
echo "\n✓ Checking Services...\n";
$servicesCount = DB::table('services')->count();
echo "  ✅ Total Services: {$servicesCount}\n";

if ($servicesCount > 0) {
    $services = DB::table('services')->limit(3)->get(['id', 'service_name', 'price']);
    foreach ($services as $service) {
        echo "     - [{$service->id}] {$service->service_name} - " . number_format($service->price) . " VND\n";
    }
}

// 6. CHECK PRODUCTS
echo "\n✓ Checking Products...\n";
$productsCount = DB::table('products')->count();
echo "  ✅ Total Products: {$productsCount}\n";

// 7. API ROUTES CHECK
echo "\n✓ Checking API Routes...\n";
$routes = \Illuminate\Support\Facades\Route::getRoutes();
$apiRoutes = collect($routes)->filter(function ($route) {
    return str_starts_with($route->uri(), 'api/');
})->count();
echo "  ✅ Total API Routes: {$apiRoutes}\n";

// 8. MIDDLEWARE CHECK
echo "\n✓ Checking Middleware...\n";
$middlewares = app('router')->getMiddleware();
if (isset($middlewares['role'])) {
    echo "  ✅ 'role' middleware registered\n";
} else {
    echo "  ❌ 'role' middleware NOT registered\n";
}

// 9. SANCTUM CHECK
echo "\n✓ Checking Laravel Sanctum...\n";
if (Schema::hasTable('personal_access_tokens')) {
    echo "  ✅ Sanctum installed (personal_access_tokens table exists)\n";
} else {
    echo "  ❌ Sanctum NOT properly installed\n";
}

// FINAL SUMMARY
echo "\n";
echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║  VERIFICATION COMPLETE                                     ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n";

if (empty($missingTables) && $adminUser) {
    echo "\n✅ System is ready! You can test API endpoints.\n";
    echo "\nQuick Test:\n";
    echo "  POST http://localhost:8000/api/login\n";
    echo "  Body: {\"email\": \"{$adminUser->email}\", \"password\": \"password123\"}\n";
} else {
    echo "\n⚠️  System has issues. Please run:\n";
    echo "  php artisan migrate:fresh --seed\n";
}

echo "\n";
