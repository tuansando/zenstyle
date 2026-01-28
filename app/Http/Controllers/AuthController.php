<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Rules\VietnamesePhoneNumber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // 1. Register - For new customers
    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|string|unique:users|regex:/^\S*$/|max:50',
            'email' => 'required|email:rfc|unique:users',
            'password' => 'required|min:6|regex:/^\S*$/',
            'phone_number' => ['nullable', new VietnamesePhoneNumber]
        ], [
            'username.regex' => 'Username cannot contain spaces',
            'password.regex' => 'Password cannot contain spaces',
            'email.email' => 'Email must be a valid email address'
        ]);

        // Trim email to prevent leading/trailing spaces
        $email = trim($request->email);

        $user = User::create([
            'name' => $request->username, // Sửa thành 'name'
            'username' => $request->username,
            'email' => $email,
            'password' => Hash::make($request->password),
            'role' => 'Client',
            'phone_number' => $request->phone_number
        ]);

        // Create login token immediately
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful!',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 201);
    }

    // 2. Login - For Admin, Staff, Client
    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        // Check if account is locked
        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account has been locked. Please contact the administrator.'
            ], 403);
        }

        // Delete old tokens for security (optional)
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful ' . $user->username,
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'phone_number' => $user->phone_number,
                'avatar' => $user->avatar,
            ]
        ]);
    }

    // 3. Logout
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logout successful']);
    }
}
