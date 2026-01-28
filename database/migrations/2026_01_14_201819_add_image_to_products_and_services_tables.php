<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add image field to products table
        Schema::table('products', function (Blueprint $table) {
            $table->string('image')->nullable()->after('category');
        });

        // Add image field to services table
        Schema::table('services', function (Blueprint $table) {
            $table->string('image')->nullable()->after('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('image');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('image');
        });
    }
};
