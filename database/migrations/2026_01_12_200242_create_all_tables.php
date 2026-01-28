<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Users table
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['Admin', 'Stylist', 'Client'])->default('Client');
            $table->string('phone_number')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        // Services table
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('service_name');
            $table->decimal('price', 10, 2);
            $table->integer('duration_minutes');
            $table->string('category');
            $table->timestamps();
        });

        // Products table
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('product_name');
            $table->string('category');
            $table->integer('stock_quantity')->default(0);
            $table->decimal('unit_price', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
        Schema::dropIfExists('services');
        Schema::dropIfExists('users');
    }
};