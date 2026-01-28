<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Rules\VietnamesePhoneNumber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users (Admin only)
     */
    public function index()
    {
        $users = User::select('id', 'name', 'username', 'email', 'role', 'phone_number', 'is_active', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'message' => 'Users retrieved successfully',
            'data' => $users
        ]);
    }

    /**
     * Store a new user (Admin only - for staff registration)
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|unique:users,username|max:255',
            'email' => 'required|string|email|unique:users,email|max:255',
            'password' => 'required|string|min:8',
            'role' => 'required|in:Admin,Stylist,Client',
            'phone_number' => ['nullable', new VietnamesePhoneNumber]
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone_number' => $request->phone_number,
            'is_active' => true
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'phone_number' => $user->phone_number,
                'is_active' => $user->is_active
            ]
        ], 201);
    }

    /**
     * Display the specified user
     */
    public function show($id)
    {
        $user = User::select('id', 'name', 'username', 'email', 'role', 'phone_number', 'is_active', 'created_at')
            ->findOrFail($id);

        return response()->json([
            'message' => 'User retrieved successfully',
            'data' => $user
        ]);
    }

    /**
     * Update the specified user (Admin only)
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'username' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|required|string|min:8',
            'role' => 'sometimes|required|in:Admin,Stylist,Client',
            'phone_number' => ['nullable', new VietnamesePhoneNumber]
        ]);

        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('username')) {
            $user->username = $request->username;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }
        if ($request->has('role')) {
            $user->role = $request->role;
        }
        if ($request->has('phone_number')) {
            $user->phone_number = $request->phone_number;
        }

        $user->save();

        return response()->json([
            'message' => 'User updated successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'phone_number' => $user->phone_number,
                'is_active' => $user->is_active
            ]
        ]);
    }

    /**
     * Remove the specified user (Admin only)
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Prevent admin from deleting themselves
        if ($user->id == auth()->id()) {
            return response()->json([
                'message' => 'You cannot delete your own account'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Lock user account (Admin only)
     */
    public function lock($id)
    {
        $user = User::findOrFail($id);

        // Prevent admin from locking themselves
        if ($user->id == auth()->id()) {
            return response()->json([
                'message' => 'You cannot lock your own account'
            ], 403);
        }

        $user->is_active = false;
        $user->save();

        // Revoke all tokens for locked user
        $user->tokens()->delete();

        return response()->json([
            'message' => 'User account locked successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => $user->is_active
            ]
        ]);
    }

    /**
     * Unlock user account (Admin only)
     */
    public function unlock($id)
    {
        $user = User::findOrFail($id);

        $user->is_active = true;
        $user->save();

        return response()->json([
            'message' => 'User account unlocked successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => $user->is_active
            ]
        ]);
    }

    /**
     * Update user role (Admin only)
     */
    public function updateRole(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Prevent admin from changing their own role
        if ($user->id == auth()->id()) {
            return response()->json([
                'message' => 'You cannot change your own role'
            ], 403);
        }

        $request->validate([
            'role' => 'required|in:Admin,Stylist,Client'
        ]);

        $oldRole = $user->role;
        $user->role = $request->role;
        $user->save();

        return response()->json([
            'message' => "User role updated from {$oldRole} to {$request->role} successfully",
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => $user->is_active
            ]
        ]);
    }

    /**
     * Get list of available stylists (For booking - All authenticated users)
     */
    public function getStylists()
    {
        $stylists = User::select('id', 'name', 'role')
            ->whereIn('role', ['Admin', 'Stylist'])
            ->where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'message' => 'Stylists retrieved successfully',
            'data' => $stylists
        ]);
    }

    /**
     * Get current user profile
     */
    public function profile()
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        return response()->json([
            'message' => 'Profile retrieved successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'phone_number' => $user->phone_number,
                'avatar' => $user->avatar,
                'avatar_url' => $user->avatar_url,
                'is_active' => $user->is_active,
                'created_at' => $user->created_at
            ]
        ]);
    }

    /**
     * Update own profile (Client can update their own info)
     */
    public function updateProfile(Request $request)
    {
        /** @var \App\Models\User|null $user */
        $user = auth()->user();

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'password' => 'sometimes|required|string|min:8|confirmed',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('phone_number')) {
            $user->phone_number = $request->phone_number;
        }
        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            Log::info('Avatar upload detected', [
                'file_name' => $request->file('avatar')->getClientOriginalName(),
                'file_size' => $request->file('avatar')->getSize(),
                'mime_type' => $request->file('avatar')->getMimeType()
            ]);

            // Delete old avatar if exists
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Log::info('Deleting old avatar: ' . $user->avatar);
                Storage::disk('public')->delete($user->avatar);
            }

            try {
                $avatarPath = $request->file('avatar')->store('avatars', 'public');
                $user->avatar = $avatarPath;
                Log::info('Avatar saved successfully: ' . $avatarPath);
            } catch (\Exception $e) {
                Log::error('Avatar upload failed: ' . $e->getMessage());
                return response()->json([
                    'message' => 'Avatar upload failed: ' . $e->getMessage()
                ], 500);
            }
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'phone_number' => $user->phone_number,
                'avatar' => $user->avatar,
                'avatar_url' => $user->avatar_url
            ]
        ]);
    }

    /**
     * Reset user password (Admin only)
     */
    public function resetPassword(Request $request, $id)
    {
        $request->validate([
            'new_password' => 'required|string|min:8'
        ]);

        $user = User::findOrFail($id);

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password reset successfully for user: ' . $user->name,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email
            ]
        ]);
    }
}
