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
            $table->enum('payment_method', ['COD', 'VNPay', 'MoMo', 'BankTransfer'])->default('COD')->after('status');
            $table->enum('payment_status', ['Unpaid', 'Paid', 'Refunded'])->default('Unpaid')->after('payment_method');
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
            $table->dropColumn(['payment_method', 'payment_status', 'payment_transaction_id', 'paid_at']);
        });
    }
};
