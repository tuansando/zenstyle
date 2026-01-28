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
        Schema::table('orders', function (Blueprint $table) {
            // Coupon fields
            $table->string('coupon_code')->nullable()->after('total_amount');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('coupon_code');
            $table->decimal('final_amount', 10, 2)->default(0)->after('discount_amount');

            // Payment fields
            $table->enum('payment_method', ['COD', 'VNPay', 'MoMo', 'BankTransfer'])->default('COD')->after('status');
            $table->enum('payment_status', ['Pending', 'Paid', 'Unpaid', 'Refunded'])->default('Pending')->after('payment_method');
            $table->string('payment_transaction_id')->nullable()->after('payment_status');
            $table->timestamp('paid_at')->nullable()->after('payment_transaction_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'coupon_code',
                'discount_amount',
                'final_amount',
                'payment_method',
                'payment_status',
                'payment_transaction_id',
                'paid_at'
            ]);
        });
    }
};
