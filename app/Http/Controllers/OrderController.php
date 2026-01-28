<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Rules\VietnamesePhoneNumber;
use App\Services\CouponService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    /**
     * Get all orders for logged-in client
     * CLIENT: View their own orders
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'Client') {
            // Client chỉ xem được đơn hàng của mình
            $orders = Order::where('client_id', $user->id)
                ->with(['orderDetails.product'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Admin/Staff xem được tất cả đơn hàng
            $orders = Order::with(['client', 'orderDetails.product'])
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($orders);
    }

    /**
     * Get single order details
     */
    public function show($id)
    {
        $user = Auth::user();

        $order = Order::with(['orderDetails.product', 'client'])->findOrFail($id);

        // Security: Client chỉ xem được đơn hàng của mình
        if ($user->role === 'Client' && $order->client_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized: You can only view your own orders.'
            ], 403);
        }

        return response()->json($order);
    }

    /**
     * Create new order (Place order)
     * CLIENT, ADMIN, STAFF can create orders
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'nullable|exists:users,id', // For Admin/Staff creating order for customer
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'coupon_code' => 'nullable|string',
            'payment_method' => 'nullable|in:COD,VNPay,MoMo,BankTransfer',
            'shipping_address' => 'nullable|string',
            'phone_number' => ['nullable', new VietnamesePhoneNumber],
            'notes' => 'nullable|string'
        ]);

        $user = Auth::user();

        // Determine client_id
        if ($user->role === 'Client') {
            $clientId = $user->id;
        } else {
            // Admin/Staff creating order for customer
            $request->validate(['client_id' => 'required|exists:users,id']);
            $clientId = $request->client_id;
        }

        $totalAmount = 0;
        $orderItems = [];

        // Validate và tính tổng tiền
        foreach ($request->items as $item) {
            $product = Product::find($item['product_id']);

            // Check stock availability
            if ($product->stock_quantity < $item['quantity']) {
                return response()->json([
                    'message' => "Product '{$product->product_name}' only has {$product->stock_quantity} items in stock.",
                    'product_id' => $product->id,
                    'available_stock' => $product->stock_quantity,
                    'requested_quantity' => $item['quantity']
                ], 422);
            }

            $subtotal = $product->unit_price * $item['quantity'];
            $totalAmount += $subtotal;

            $orderItems[] = [
                'product' => $product,
                'quantity' => $item['quantity'],
                'unit_price' => $product->unit_price,
                'subtotal' => $subtotal
            ];
        }

        // Apply coupon discount
        $discountAmount = 0;
        $finalAmount = $totalAmount;
        $couponCode = null;

        if ($request->filled('coupon_code')) {
            $couponResult = CouponService::applyCoupon(
                $request->coupon_code,
                $totalAmount,
                $user->id
            );

            if (!$couponResult['valid']) {
                return response()->json([
                    'message' => $couponResult['message']
                ], 422);
            }

            $discountAmount = $couponResult['discount'];
            $finalAmount = $couponResult['final_amount'];
            $couponCode = strtoupper(trim($request->coupon_code));
        }

        try {
            DB::beginTransaction();

            // Create Order
            $paymentMethod = $request->payment_method ?? 'COD';

            $order = Order::create([
                'client_id' => $clientId,
                'total_amount' => $totalAmount,
                'coupon_code' => $couponCode,
                'discount_amount' => $discountAmount,
                'final_amount' => $finalAmount,
                'status' => 'Pending',
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentMethod === 'COD' ? 'Unpaid' : 'Unpaid', // Changed from 'Pending' to 'Unpaid'
                'shipping_address' => $request->shipping_address,
                'phone_number' => $request->phone_number,
                'notes' => $request->notes
            ]);

            // Create Order Details & Update Stock
            foreach ($orderItems as $item) {
                OrderDetail::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product']->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['subtotal']
                ]);

                // Giảm stock
                $item['product']->decrement('stock_quantity', $item['quantity']);
            }

            DB::commit();

            // Load relationships
            $order->load('orderDetails.product');

            return response()->json([
                'message' => 'Order placed successfully!',
                'order' => $order
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error creating order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update order status
     * STAFF/ADMIN only
     * 
     * LOGIC FLOW:
     * 1. Pending (Chờ xử lý) - Đơn mới tạo, chưa xử lý
     * 2. Processing (Đang xử lý) - Đã xác nhận, đang chuẩn bị hàng/giao hàng
     * 3. Completed (Hoàn thành) - Đã giao hàng thành công, khách đã nhận
     * 4. Cancelled (Đã hủy) - Đơn bị hủy (hoàn lại kho)
     * 
     * QUY TẮC:
     * - Chỉ Cancelled mới hoàn stock về kho
     * - Không thể thay đổi từ Completed/Cancelled sang trạng thái khác
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Pending,Processing,Completed,Cancelled'
        ]);

        $order = Order::findOrFail($id);

        // Không cho phép thay đổi đơn đã hoàn thành hoặc đã hủy
        if (in_array($order->status, ['Completed', 'Cancelled'])) {
            return response()->json([
                'message' => 'Cannot update order with status: ' . $order->status
            ], 422);
        }

        // Nếu cancel order, hoàn lại stock
        if ($request->status === 'Cancelled' && $order->status !== 'Cancelled') {
            foreach ($order->orderDetails as $detail) {
                $detail->product->increment('stock_quantity', $detail->quantity);
            }
        }

        $order->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order
        ]);
    }

    /**
     * Cancel order
     * CLIENT: Can cancel their own pending orders
     */
    public function cancel($id)
    {
        $user = Auth::user();
        $order = Order::findOrFail($id);

        // Security check
        if ($user->role === 'Client' && $order->client_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized: You can only cancel your own orders.'
            ], 403);
        }

        // Only allow canceling pending/processing orders
        if (!in_array($order->status, ['Pending', 'Processing'])) {
            return response()->json([
                'message' => 'Cannot cancel order with status: ' . $order->status
            ], 422);
        }

        // Hoàn lại stock
        foreach ($order->orderDetails as $detail) {
            $detail->product->increment('stock_quantity', $detail->quantity);
        }

        $order->update(['status' => 'Cancelled']);

        return response()->json([
            'message' => 'Order cancelled successfully',
            'order' => $order
        ]);
    }

    /**
     * Delete order (Admin only)
     */
    public function destroy($id)
    {
        $order = Order::findOrFail($id);

        // Hoàn lại stock nếu chưa cancelled
        if ($order->status !== 'Cancelled') {
            foreach ($order->orderDetails as $detail) {
                $detail->product->increment('stock_quantity', $detail->quantity);
            }
        }

        $order->delete();

        return response()->json([
            'message' => 'Order deleted successfully'
        ]);
    }

    /**
     * Process payment for order (Demo - simulates payment gateway)
     */
    public function processPayment(Request $request, $id)
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:COD,VNPay,MoMo,BankTransfer'
        ]);

        $order = Order::findOrFail($id);
        $user = Auth::user();

        // Security: Client chỉ thanh toán đơn hàng của mình
        if ($user->role === 'Client' && $order->client_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized: You can only pay for your own orders.'
            ], 403);
        }

        // Check if already paid
        if ($order->payment_status === 'Paid') {
            return response()->json([
                'message' => 'Order already paid'
            ], 422);
        }

        // Check if order is cancelled
        if ($order->status === 'Cancelled') {
            return response()->json([
                'message' => 'Cannot pay for cancelled order'
            ], 422);
        }

        // Demo payment simulation
        $paymentMethod = $request->payment_method;

        if ($paymentMethod === 'COD') {
            // COD: Admin/Staff xác nhận đã nhận tiền mặt khi giao hàng
            $order->update([
                'payment_method' => $paymentMethod,
                'payment_status' => 'Paid',
                'paid_at' => now(),
                'status' => 'Processing'
            ]);

            return response()->json([
                'message' => 'Payment confirmed! Cash received on delivery.',
                'order' => $order->fresh()
            ]);
        } else {
            // Online payment methods (VNPay, MoMo, BankTransfer)
            // Simulate successful payment
            $transactionId = strtoupper($paymentMethod) . '-' . time() . '-' . rand(1000, 9999);

            $order->update([
                'payment_method' => $paymentMethod,
                'payment_status' => 'Paid',
                'payment_transaction_id' => $transactionId,
                'paid_at' => now(),
                'status' => 'Processing'
            ]);

            return response()->json([
                'message' => 'Payment successful! Your order is being processed.',
                'transaction_id' => $transactionId,
                'order' => $order->fresh()
            ]);
        }
    }

    /**
     * Get available coupons
     */
    public function getAvailableCoupons()
    {
        $coupons = CouponService::getAvailableCoupons();

        return response()->json([
            'message' => 'Available coupons retrieved successfully',
            'coupons' => $coupons
        ]);
    }

    /**
     * Validate coupon code
     */
    public function validateCoupon(Request $request)
    {
        $request->validate([
            'coupon_code' => 'required|string',
            'total_amount' => 'required|numeric|min:0'
        ]);

        /** @var \App\Models\User $user */
        $user = auth()->user();

        $result = CouponService::applyCoupon(
            $request->coupon_code,
            $request->total_amount,
            $user->id
        );

        if (!$result['valid']) {
            return response()->json([
                'valid' => false,
                'message' => $result['message']
            ], 422);
        }

        return response()->json([
            'valid' => true,
            'discount' => $result['discount'],
            'final_amount' => $result['final_amount'],
            'message' => $result['message'],
            'description' => $result['description']
        ]);
    }
}
