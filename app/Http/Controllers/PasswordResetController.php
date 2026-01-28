<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PasswordResetController extends Controller
{
    /**
     * Send password reset token to user's email
     * PUBLIC endpoint - anyone can request password reset
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Email không tồn tại trong hệ thống.'
            ], 404);
        }

        // Check if account is active
        if (!$user->is_active) {
            return response()->json([
                'message' => 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.'
            ], 403);
        }

        // Generate reset token
        $resetToken = Str::random(64);
        
        // Store reset token (hashed for security)
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => Hash::make($resetToken),
                'created_at' => Carbon::now()
            ]
        );

        // In production, send email with reset token link
        // For now, return the token in response (REMOVE IN PRODUCTION!)
        return response()->json([
            'message' => 'Reset token đã được tạo thành công.',
            'email' => $request->email,
            'reset_token' => $resetToken, // ONLY FOR DEVELOPMENT - Remove in production
            'expires_in' => '60 minutes',
            'note' => 'Use this token to reset your password.'
        ]);
    }

    /**
     * Reset password using reset token from forgot-password
     * PUBLIC endpoint
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|min:6|confirmed'
        ]);

        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'message' => 'Token khôi phục không hợp lệ.'
            ], 404);
        }

        // Check if token is expired (60 minutes)
        $createdAt = Carbon::parse($resetRecord->created_at);
        if ($createdAt->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->delete();
            
            return response()->json([
                'message' => 'Token đã hết hạn. Vui lòng yêu cầu khôi phục mật khẩu lại.'
            ], 410);
        }

        // Verify token
        if (!Hash::check($request->token, $resetRecord->token)) {
            return response()->json([
                'message' => 'Token không hợp lệ.'
            ], 401);
        }

        // Find user and update password
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Không tìm thấy người dùng.'
            ], 404);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete reset token
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        // Revoke all existing tokens for security
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập với mật khẩu mới.',
            'email' => $user->email
        ]);
    }

}
