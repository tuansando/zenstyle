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
        Schema::create('salon_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // Setting key (e.g., 'max_concurrent_appointments')
            $table->text('value'); // Setting value (can be JSON)
            $table->string('type')->default('string'); // Data type: string, integer, boolean, json
            $table->text('description')->nullable(); // Description of what this setting does
            $table->timestamps();
        });

        // Insert default settings
        DB::table('salon_settings')->insert([
            [
                'key' => 'max_concurrent_appointments',
                'value' => '5',
                'type' => 'integer',
                'description' => 'Maximum number of concurrent appointments (salon capacity - number of service stations/chairs)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'max_daily_appointments',
                'value' => '30',
                'type' => 'integer',
                'description' => 'Maximum number of appointments per day',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'working_hours_start',
                'value' => '09:00',
                'type' => 'string',
                'description' => 'Salon opening time',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'working_hours_end',
                'value' => '18:00',
                'type' => 'string',
                'description' => 'Salon closing time',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'enable_capacity_check',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Enable salon capacity checking',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'capacity_warning_threshold',
                'value' => '80',
                'type' => 'integer',
                'description' => 'Show warning when capacity reaches this percentage',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'enable_waiting_list',
                'value' => 'false',
                'type' => 'boolean',
                'description' => 'Enable waiting list when salon is at full capacity',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salon_settings');
    }
};
