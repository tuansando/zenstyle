<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Service;
use App\Models\Product;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // 1. Tạo Admin (kiểm tra trước)
        User::firstOrCreate(
            ['email' => 'admin@zenstyle.com'],
            [
                'username' => 'admin',
                'name' => 'Admin',
                'password' => Hash::make('admin123'),
                'role' => 'Admin',
                'is_active' => true
            ]
        );

        // 2. Tạo Thợ (Stylist)
        User::firstOrCreate(
            ['email' => 'minh@zenstyle.com'],
            [
                'username' => 'minh',
                'name' => 'Minh Stylist',
                'password' => Hash::make('123456'),
                'role' => 'Stylist',
                'phone_number' => '0909123456',
                'is_active' => true
            ]
        );

        // 3. Tạo Khách hàng mẫu
        User::firstOrCreate(
            ['email' => 'client@example.com'],
            [
                'username' => 'client',
                'name' => 'Khách Hàng Demo',
                'password' => Hash::make('123456'),
                'role' => 'Client',
                'is_active' => true
            ]
        );

        // 4. Tạo Dịch vụ mẫu
        Service::firstOrCreate(
            ['service_name' => 'Cắt tóc nam ZenStyle'],
            [
                'price' => 150000,
                'duration_minutes' => 30,
                'category' => 'Hair'
            ]
        );
        
        Service::firstOrCreate(
            ['service_name' => 'Nhuộm tóc thời trang'],
            [
                'price' => 500000,
                'duration_minutes' => 120,
                'category' => 'Hair'
            ]
        );

        // 5. Tạo Sản phẩm mẫu
        Product::firstOrCreate(
            ['product_name' => 'Dầu gội Zen Care'],
            [
                'category' => 'Retail',
                'stock_quantity' => 50,
                'unit_price' => 250000
            ]
        );
    }
}