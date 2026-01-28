<?php

namespace App\Http\Controllers;

use App\Services\CouponService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CouponController extends Controller
{
    /**
     * Get all coupons (Admin only)
     */
    public function index()
    {
        CouponService::loadCouponsFromFile();
        $coupons = CouponService::getAvailableCoupons();

        return response()->json([
            'message' => 'Coupons retrieved successfully',
            'data' => $coupons
        ]);
    }

    /**
     * Get all coupons including expired (Admin only)
     */
    public function getAllCoupons()
    {
        CouponService::loadCouponsFromFile();

        // Get all coupons from private property using reflection
        $reflection = new \ReflectionClass(CouponService::class);
        $property = $reflection->getProperty('coupons');
        $property->setAccessible(true);
        $allCoupons = $property->getValue();

        $result = [];
        foreach ($allCoupons as $code => $coupon) {
            $result[] = [
                'code' => $code,
                'type' => $coupon['type'],
                'value' => $coupon['value'],
                'min_amount' => $coupon['min_amount'],
                'expiry_date' => $coupon['expiry_date'],
                'description' => $coupon['description'],
                'customer_id' => $coupon['customer_id'] ?? null,
                'is_expired' => strtotime($coupon['expiry_date']) < time()
            ];
        }

        return response()->json([
            'message' => 'All coupons retrieved successfully',
            'data' => $result
        ]);
    }

    /**
     * Create new coupon (Admin only)
     */
    public function store(Request $request)
    {
        // Special case: WELCOME10 doesn't require customer_id (public coupon)
        $isPublicCoupon = strtoupper($request->code) === 'WELCOME10';

        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_amount' => 'nullable|numeric|min:0',
            'expiry_date' => 'required|date|after:today',
            'description' => 'required|string|max:255',
            'customer_id' => $isPublicCoupon ? 'nullable|exists:users,id' : 'required|exists:users,id'
        ]);

        CouponService::loadCouponsFromFile();
        $result = CouponService::addCoupon($validated['code'], $validated);

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message']
            ], 422);
        }

        return response()->json([
            'message' => $result['message'],
            'data' => $result['coupon']
        ], 201);
    }

    /**
     * Update coupon (Admin only)
     */
    public function update(Request $request, $code)
    {
        $validated = $request->validate([
            'type' => 'sometimes|in:percentage,fixed',
            'value' => 'sometimes|numeric|min:0',
            'min_amount' => 'nullable|numeric|min:0',
            'expiry_date' => 'sometimes|date',
            'description' => 'sometimes|string|max:255',
            'customer_id' => 'sometimes|exists:users,id'
        ]);

        CouponService::loadCouponsFromFile();
        $result = CouponService::updateCoupon($code, $validated);

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message']
            ], 404);
        }

        return response()->json([
            'message' => $result['message'],
            'data' => $result['coupon']
        ]);
    }

    /**
     * Delete coupon (Admin only)
     */
    public function destroy($code)
    {
        CouponService::loadCouponsFromFile();
        $result = CouponService::deleteCoupon($code);

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message']
            ], 404);
        }

        return response()->json([
            'message' => $result['message']
        ]);
    }

    /**
     * Send coupon to specific customers (Admin only)
     */
    public function sendToCustomers(Request $request, $code)
    {
        $validated = $request->validate([
            'customer_ids' => 'required|array|min:1',
            'customer_ids.*' => 'exists:users,id'
        ]);

        CouponService::loadCouponsFromFile();

        // Validate coupon exists
        $couponValidation = CouponService::validateCoupon($code);
        if (!$couponValidation['valid']) {
            return response()->json([
                'message' => 'Coupon not found or invalid'
            ], 404);
        }

        $coupon = $couponValidation['coupon'];

        // Get customers
        $customers = User::whereIn('id', $validated['customer_ids'])
            ->where('role', 'Client')
            ->get();

        if ($customers->isEmpty()) {
            return response()->json([
                'message' => 'No valid customers found'
            ], 404);
        }

        $sentCount = 0;
        $sentTo = [];

        foreach ($customers as $customer) {
            // In a real application, you would send an actual email here
            // For now, we'll simulate sending and log it

            // Simulate email sending
            Log::info("Coupon sent to customer", [
                'coupon_code' => $code,
                'customer_id' => $customer->id,
                'customer_name' => $customer->name,
                'customer_email' => $customer->email,
                'discount_type' => $coupon['type'],
                'discount_value' => $coupon['value'],
                'expiry_date' => $coupon['expiry_date']
            ]);

            $sentTo[] = [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email
            ];

            $sentCount++;
        }

        return response()->json([
            'message' => "Coupon sent successfully to {$sentCount} customer(s)",
            'coupon_code' => $code,
            'sent_to' => $sentTo,
            'coupon_details' => [
                'description' => $coupon['description'],
                'type' => $coupon['type'],
                'value' => $coupon['value'],
                'min_amount' => $coupon['min_amount'],
                'expiry_date' => $coupon['expiry_date']
            ]
        ]);
    }
}
