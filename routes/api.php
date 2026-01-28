<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\SalonCapacityController;
use App\Http\Controllers\CouponController;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES (No Login Required)
|--------------------------------------------------------------------------
*/
// Authentication routes - Rate limited to prevent brute force attacks
Route::middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']); // Max 5 attempts per minute
    Route::post('/login', [AuthController::class, 'login']); // Max 5 attempts per minute
});

// Password Reset routes - Simplified (Email → Token → Reset)
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']); // Get reset token
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']); // Reset password
});

// Anyone can view catalogs and news
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/feedbacks', [FeedbackController::class, 'index']);

// Contact form (Public - anyone can send message) - Rate limited to prevent spam
Route::middleware('throttle:contact')->post('/contact', [ContactController::class, 'store']);

// Check staff availability (Public - for booking form) - Rate limited
Route::middleware('throttle:check-availability')->post('/appointments/check', [AppointmentController::class, 'checkAvailability']);

// Salon Capacity - Public endpoints (anyone can check capacity before booking)
Route::get('/capacity/dashboard', [SalonCapacityController::class, 'dashboard']); // View capacity dashboard
Route::post('/capacity/check', [SalonCapacityController::class, 'checkCapacity']); // Check specific time slot
Route::get('/capacity/available-slots', [SalonCapacityController::class, 'getAvailableSlots']); // Get available time slots

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES (Login Required via Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    // Profile Management (All authenticated users)
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);

    // Get available stylists for booking (All authenticated users)
    Route::get('/stylists', [UserController::class, 'getStylists']);

    // Booking (All authenticated users - Client/Staff/Admin can book)
    // Temporarily disabled rate limiting for testing
    // TODO: Re-enable in production with: ['throttle:booking', 'prevent.booking.spam', 'check.salon.capacity']
    Route::middleware(['check.salon.capacity'])
        ->post('/booking', [AppointmentController::class, 'store']);

    // Ordemiddleware('throttle:orders')->post('/orders', [OrderController::class, 'store']); // Place new order - Rate limited
    // IMPORTANT: /orders/all MUST come BEFORE /orders/{id} to avoid route collision
    Route::get('/orders/all', [OrderController::class, 'index']); // Admin/Staff view all orders (uses same index method with role check)
    Route::get('/orders/coupons', [OrderController::class, 'getAvailableCoupons']); // Get available coupons
    Route::post('/orders/validate-coupon', [OrderController::class, 'validateCoupon']); // Validate coupon code
    Route::post('/orders', [OrderController::class, 'store']); // Place new order - Client/Admin/Staff
    Route::get('/orders/{id}', [OrderController::class, 'show']); // View order details
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']); // Cancel order
    Route::post('/orders/{id}/payment', [OrderController::class, 'processPayment']); // Process payment

    /*
    |--------------------------------------------------------------------------
    | CLIENT ROLE - Quyền của Khách hàng
    |--------------------------------------------------------------------------
    | - Xem thông tin dịch vụ/sản phẩm
    | - Đặt lịch hẹn & quản lý lịch hẹn của mình
    | - Mua sản phẩm & quản lý đơn hàng của mình
    | - Gửi feedback
    | - Quản lý thông tin cá nhân
    */
    Route::middleware('role:Client')->group(function () {
        // Appointment Management (Client)
        Route::get('/my-appointments', [AppointmentController::class, 'myAppointments']); // View own appointments
        Route::get('/appointments/{id}', [AppointmentController::class, 'show']); // View appointment details
        Route::post('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']); // Cancel own appointment
        Route::put('/appointments/{id}', [AppointmentController::class, 'update']); // Update own appointment

        // Feedback
        Route::post('/feedbacks', [FeedbackController::class, 'store']); // Write review
        Route::get('/feedbacks/appointment/{appointmentId}', [FeedbackController::class, 'getByAppointment']); // Get feedback by appointment

        // Order Management (Client - View own orders)
        Route::get('/orders', [OrderController::class, 'index']); // View own orders
    });

    /*
    |--------------------------------------------------------------------------
    | STAFF ROLE (Receptionist, Stylist) - Quyền của Nhân viên
    |--------------------------------------------------------------------------
    | - Có thể XEM, THÊM, CẬP NHẬT (View, Create, Update)
    | - KHÔNG có quyền XÓA (No Delete)
    | - KHÔNG thể khóa/mở khóa tài khoản khách hàng
    | - KHÔNG quản lý nhân viên khác
    */
    Route::middleware('role:Stylist,Admin')->group(function () {
        // Staff Statistics (Staff can view their own stats)
        Route::get('/staff/my-statistics', [StaffController::class, 'myStatistics']); // View own statistics

        // Product Management (View, Create, Update ONLY - No Delete)
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);

        // Service Management (View, Create, Update ONLY - No Delete)
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{id}', [ServiceController::class, 'update']);

        // Blog/News Management (View, Create, Update ONLY)
        Route::get('/blogs/all', [BlogController::class, 'getAll']); // View all blogs including drafts
        Route::post('/blogs', [BlogController::class, 'store']);
        Route::put('/blogs/{id}', [BlogController::class, 'update']);

        // Appointment Management (Staff can view all and update status)
        Route::get('/appointments', [AppointmentController::class, 'index']); // View all appointments
        Route::put('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']); // Update status

        // Order Management (Staff can view all orders and update status)
        // Note: /orders/all is already defined above in auth:sanctum middleware
        Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']); // Update order status

        // Contact Management (Staff can view and reply to messages)
        Route::get('/contacts', [ContactController::class, 'index']); // View all contact messages
        Route::get('/contacts/{id}', [ContactController::class, 'show']); // View message details
        Route::post('/contacts/{id}/reply', [ContactController::class, 'reply']); // Reply to message
        Route::put('/contacts/{id}/status', [ContactController::class, 'updateStatus']); // Update message status
    });

    /*
    |--------------------------------------------------------------------------
    | ADMIN ROLE - Toàn quyền Quản trị viên
    |--------------------------------------------------------------------------
    | - Toàn quyền CRUD (Create, Read, Update, Delete)
    | - Quản lý khách hàng (bao gồm khóa/mở khóa tài khoản)
    | - Quản lý nhân viên (đăng ký, phân vai trò)
    | - Cài đặt hệ thống
    */
    Route::middleware('role:Admin')->group(function () {
        // Dashboard Statistics (Admin ONLY)
        Route::get('/dashboard/stats', [App\Http\Controllers\DashboardStatsController::class, 'getStats']); // Get comprehensive dashboard statistics

        // User Management (Admin ONLY)
        Route::get('/users', [UserController::class, 'index']); // View all users
        Route::post('/users', [UserController::class, 'store']); // Create staff/user account
        Route::get('/users/{id}', [UserController::class, 'show']); // View user details
        Route::put('/users/{id}', [UserController::class, 'update']); // Update user info
        Route::delete('/users/{id}', [UserController::class, 'destroy']); // Delete user
        Route::post('/users/{id}/lock', [UserController::class, 'lock']); // Lock account
        Route::post('/users/{id}/unlock', [UserController::class, 'unlock']); // Unlock account
        Route::patch('/users/{id}/role', [UserController::class, 'updateRole']); // Update user role
        Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword']); // Reset user password

        // Staff Management & Statistics (Admin ONLY)
        Route::get('/staff', [StaffController::class, 'index']); // Danh sách nhân viên
        Route::get('/staff/statistics', [StaffController::class, 'statistics']); // Thống kê tổng quan
        Route::get('/staff/performance', [StaffController::class, 'performance']); // Hiệu suất nhân viên
        Route::get('/staff/top-performers', [StaffController::class, 'topPerformers']); // Top nhân viên
        Route::get('/staff/daily-availability', [StaffController::class, 'dailyAvailability']); // Nhân viên available hôm nay
        Route::post('/staff/compare', [StaffController::class, 'compare']); // So sánh nhân viên
        Route::get('/staff/{id}', [StaffController::class, 'show']); // Chi tiết nhân viên + stats
        Route::get('/staff/{id}/schedule', [StaffController::class, 'schedule']); // Lịch làm việc nhân viên

        // Customer Management & Statistics (Admin ONLY)
        Route::get('/customers', [CustomerController::class, 'index']); // Danh sách khách hàng
        Route::get('/customers/statistics', [CustomerController::class, 'statistics']); // Thống kê tổng quan
        Route::get('/customers/top-spenders', [CustomerController::class, 'topSpenders']); // Khách hàng chi tiêu nhiều nhất
        Route::get('/customers/loyalty', [CustomerController::class, 'loyaltyAnalysis']); // Phân tích độ trung thành
        Route::get('/customers/activity', [CustomerController::class, 'activityReport']); // Báo cáo hoạt động
        Route::get('/customers/retention', [CustomerController::class, 'retentionRate']); // Tỷ lệ giữ chân khách hàng
        Route::get('/customers/growth', [CustomerController::class, 'growthTrend']); // xu hướng tăng trưởng
        Route::get('/customers/{id}', [CustomerController::class, 'show']); // Chi tiết khách hàng

        // Salon Capacity Settings (Admin ONLY)
        Route::get('/capacity/settings', [SalonCapacityController::class, 'getSettings']); // View settings
        Route::put('/capacity/settings', [SalonCapacityController::class, 'updateSettings']); // Update settings

        // Contact Statistics & Management (Admin ONLY)
        Route::get('/contacts/statistics', [ContactController::class, 'statistics']); // Contact statistics

        // Coupon Management (Admin ONLY)
        Route::get('/coupons', [CouponController::class, 'getAllCoupons']); // Get all coupons (including expired)
        Route::post('/coupons', [CouponController::class, 'store']); // Create new coupon
        Route::put('/coupons/{code}', [CouponController::class, 'update']); // Update coupon
        Route::delete('/coupons/{code}', [CouponController::class, 'destroy']); // Delete coupon
        Route::post('/coupons/{code}/send', [CouponController::class, 'sendToCustomers']); // Send coupon to customers

        // Delete Permissions (Admin ONLY)
        Route::delete('/products/{id}', [ProductController::class, 'destroy']); // Delete product
        Route::delete('/services/{id}', [ServiceController::class, 'destroy']); // Delete service
        Route::delete('/blogs/{id}', [BlogController::class, 'destroy']); // Delete blog
        Route::delete('/orders/{id}', [OrderController::class, 'destroy']); // Delete order
        Route::delete('/contacts/{id}', [ContactController::class, 'destroy']); // Delete contact message
    });
});
