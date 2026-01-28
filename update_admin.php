<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Update admin password
$admin = User::where('email', 'admin@zenstyle.com')->first();
if ($admin) {
    $admin->password = Hash::make('admin123');
    $admin->is_active = true;
    $admin->save();
    echo "✅ Admin password updated to: admin123\n";
} else {
    echo "❌ Admin not found!\n";
}

// Update staff password
$staff = User::where('email', 'minh@zenstyle.com')->first();
if ($staff) {
    $staff->password = Hash::make('123456');
    $staff->is_active = true;
    $staff->save();
    echo "✅ Staff password updated to: 123456\n";
} else {
    echo "❌ Staff not found!\n";
}

// Update client password
$client = User::where('email', 'client@example.com')->first();
if ($client) {
    $client->password = Hash::make('123456');
    $client->is_active = true;
    $client->save();
    echo "✅ Client password updated to: 123456\n";
} else {
    echo "❌ Client not found!\n";
}

echo "\n🎉 Done! You can now login with:\n";
echo "   Admin: admin@zenstyle.com / admin123\n";
echo "   Staff: minh@zenstyle.com / 123456\n";
echo "   Client: client@example.com / 123456\n";
