<?php

namespace App\Services;

class CouponService
{
    /**
     * Predefined coupon codes (since we don't create a new table)
     * Format: code => [type, value, min_amount, expiry_date, max_uses]
     */
    private static $coupons = [
        'WELCOME10' => [
            'type' => 'percentage',
            'value' => 10,
            'min_amount' => 0,
            'expiry_date' => '2026-12-31',
            'description' => 'Welcome discount 10%'
        ],
        'SAVE20' => [
            'type' => 'percentage',
            'value' => 20,
            'min_amount' => 500000,
            'expiry_date' => '2026-12-31',
            'description' => 'Save 20% for orders over 500K'
        ],
        'FIXED50K' => [
            'type' => 'fixed',
            'value' => 50000,
            'min_amount' => 200000,
            'expiry_date' => '2026-12-31',
            'description' => 'Fixed 50K discount for orders over 200K'
        ],
        'NEWYEAR2026' => [
            'type' => 'percentage',
            'value' => 15,
            'min_amount' => 300000,
            'expiry_date' => '2026-02-28',
            'description' => 'New Year 2026 - 15% off'
        ],
        'FREESHIP' => [
            'type' => 'fixed',
            'value' => 30000,
            'min_amount' => 0,
            'expiry_date' => '2026-12-31',
            'description' => 'Free shipping (30K discount)'
        ],
        'VIP30' => [
            'type' => 'percentage',
            'value' => 30,
            'min_amount' => 1000000,
            'expiry_date' => '2026-12-31',
            'description' => 'VIP discount 30% for orders over 1M'
        ]
    ];

    /**
     * Validate and apply coupon code
     * 
     * @param string $code
     * @param float $totalAmount
     * @param int|null $customerId
     * @return array ['valid' => bool, 'discount' => float, 'message' => string]
     */
    public static function applyCoupon($code, $totalAmount, $customerId = null)
    {
        if (empty($code)) {
            return [
                'valid' => false,
                'discount' => 0,
                'final_amount' => $totalAmount,
                'message' => 'Coupon code is required'
            ];
        }

        $code = strtoupper(trim($code));

        // Check if coupon exists
        if (!isset(self::$coupons[$code])) {
            return [
                'valid' => false,
                'discount' => 0,
                'final_amount' => $totalAmount,
                'message' => 'Invalid coupon code'
            ];
        }

        $coupon = self::$coupons[$code];

        // Special case: WELCOME10 is a public coupon available to all customers
        $isPublicCoupon = ($code === 'WELCOME10');

        // For non-public coupons: MUST have customer_id assigned
        if (!$isPublicCoupon) {
            if (!isset($coupon['customer_id']) || $coupon['customer_id'] === null) {
                return [
                    'valid' => false,
                    'discount' => 0,
                    'final_amount' => $totalAmount,
                    'message' => 'This coupon is not properly configured. Please contact admin.'
                ];
            }

            // Verify the customer matches
            if ($customerId === null || $coupon['customer_id'] != $customerId) {
                return [
                    'valid' => false,
                    'discount' => 0,
                    'final_amount' => $totalAmount,
                    'message' => 'This coupon is not available for your account'
                ];
            }
        }

        // Check expiry date
        if (strtotime($coupon['expiry_date']) < time()) {
            return [
                'valid' => false,
                'discount' => 0,
                'final_amount' => $totalAmount,
                'message' => 'Coupon has expired'
            ];
        }

        // Check minimum amount
        if ($totalAmount < $coupon['min_amount']) {
            return [
                'valid' => false,
                'discount' => 0,
                'final_amount' => $totalAmount,
                'message' => "Minimum order amount is " . number_format($coupon['min_amount']) . " VND"
            ];
        }

        // Calculate discount
        $discount = 0;
        if ($coupon['type'] === 'percentage') {
            $discount = ($totalAmount * $coupon['value']) / 100;
        } else if ($coupon['type'] === 'fixed') {
            $discount = $coupon['value'];
        }

        // Ensure discount doesn't exceed total amount
        $discount = min($discount, $totalAmount);
        $finalAmount = $totalAmount - $discount;

        return [
            'valid' => true,
            'discount' => $discount,
            'final_amount' => $finalAmount,
            'message' => "Coupon '{$code}' applied successfully! Discount: " . number_format($discount) . " VND",
            'description' => $coupon['description']
        ];
    }

    /**
     * Get all available coupons
     * 
     * @return array
     */
    public static function getAvailableCoupons()
    {
        $available = [];
        foreach (self::$coupons as $code => $coupon) {
            if (strtotime($coupon['expiry_date']) >= time()) {
                $available[] = [
                    'code' => $code,
                    'type' => $coupon['type'],
                    'value' => $coupon['value'],
                    'min_amount' => $coupon['min_amount'],
                    'expiry_date' => $coupon['expiry_date'],
                    'description' => $coupon['description']
                ];
            }
        }
        return $available;
    }

    /**
     * Validate coupon without applying (for preview)
     * 
     * @param string $code
     * @return array
     */
    public static function validateCoupon($code)
    {
        $code = strtoupper(trim($code));

        if (!isset(self::$coupons[$code])) {
            return [
                'valid' => false,
                'message' => 'Invalid coupon code'
            ];
        }

        $coupon = self::$coupons[$code];

        if (strtotime($coupon['expiry_date']) < time()) {
            return [
                'valid' => false,
                'message' => 'Coupon has expired'
            ];
        }

        return [
            'valid' => true,
            'coupon' => [
                'code' => $code,
                'type' => $coupon['type'],
                'value' => $coupon['value'],
                'min_amount' => $coupon['min_amount'],
                'expiry_date' => $coupon['expiry_date'],
                'description' => $coupon['description']
            ],
            'message' => 'Coupon is valid'
        ];
    }

    /**
     * Add new coupon (Admin only)
     */
    public static function addCoupon($code, $data)
    {
        $code = strtoupper(trim($code));

        if (isset(self::$coupons[$code])) {
            return [
                'success' => false,
                'message' => 'Coupon code already exists'
            ];
        }

        self::$coupons[$code] = [
            'type' => $data['type'],
            'value' => $data['value'],
            'min_amount' => $data['min_amount'] ?? 0,
            'expiry_date' => $data['expiry_date'],
            'description' => $data['description'],
            'customer_id' => $data['customer_id'] ?? null
        ];

        // Save to file
        self::saveCouponsToFile();

        return [
            'success' => true,
            'message' => 'Coupon created successfully',
            'coupon' => self::$coupons[$code]
        ];
    }

    /**
     * Update existing coupon (Admin only)
     */
    public static function updateCoupon($code, $data)
    {
        $code = strtoupper(trim($code));

        if (!isset(self::$coupons[$code])) {
            return [
                'success' => false,
                'message' => 'Coupon not found'
            ];
        }

        self::$coupons[$code] = [
            'type' => $data['type'] ?? self::$coupons[$code]['type'],
            'value' => $data['value'] ?? self::$coupons[$code]['value'],
            'min_amount' => $data['min_amount'] ?? self::$coupons[$code]['min_amount'],
            'expiry_date' => $data['expiry_date'] ?? self::$coupons[$code]['expiry_date'],
            'description' => $data['description'] ?? self::$coupons[$code]['description'],
            'customer_id' => $data['customer_id'] ?? self::$coupons[$code]['customer_id'] ?? null
        ];

        // Save to file
        self::saveCouponsToFile();

        return [
            'success' => true,
            'message' => 'Coupon updated successfully',
            'coupon' => self::$coupons[$code]
        ];
    }

    /**
     * Delete coupon (Admin only)
     */
    public static function deleteCoupon($code)
    {
        $code = strtoupper(trim($code));

        if (!isset(self::$coupons[$code])) {
            return [
                'success' => false,
                'message' => 'Coupon not found'
            ];
        }

        unset(self::$coupons[$code]);

        // Save to file
        self::saveCouponsToFile();

        return [
            'success' => true,
            'message' => 'Coupon deleted successfully'
        ];
    }

    /**
     * Save coupons to a JSON file for persistence
     */
    private static function saveCouponsToFile()
    {
        $filePath = storage_path('app/coupons.json');
        file_put_contents($filePath, json_encode(self::$coupons, JSON_PRETTY_PRINT));
    }

    /**
     * Load coupons from file (call this on app boot or in constructor)
     */
    public static function loadCouponsFromFile()
    {
        $filePath = storage_path('app/coupons.json');
        if (file_exists($filePath)) {
            $coupons = json_decode(file_get_contents($filePath), true);
            if ($coupons) {
                self::$coupons = $coupons;
            }
        }
    }
}
