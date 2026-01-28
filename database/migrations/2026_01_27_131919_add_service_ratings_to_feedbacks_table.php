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
        Schema::table('feedbacks', function (Blueprint $table) {
            // Service quality ratings (1-5 scale)
            $table->integer('service_quality_rating')->nullable()->after('rating')->comment('Rating for service quality (1-5)');
            $table->integer('staff_friendliness_rating')->nullable()->after('service_quality_rating')->comment('Rating for staff friendliness (1-5)');
            $table->integer('cleanliness_rating')->nullable()->after('staff_friendliness_rating')->comment('Rating for cleanliness (1-5)');
            $table->integer('value_for_money_rating')->nullable()->after('cleanliness_rating')->comment('Rating for value for money (1-5)');

            // Keep overall rating as average or separate overall rating
            // The existing 'rating' field will be overall rating
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('feedbacks', function (Blueprint $table) {
            $table->dropColumn([
                'service_quality_rating',
                'staff_friendliness_rating',
                'cleanliness_rating',
                'value_for_money_rating'
            ]);
        });
    }
};
