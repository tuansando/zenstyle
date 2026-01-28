<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  mixed ...$roles  List of allowed roles (e.g. 'Admin', 'Staff')
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // 1. Check if user is logged in
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated: Please log in.'], 401);
        }

        $user = Auth::user();

        // 2. Check if the user's role is in the list of allowed roles
        // Example: If route requires 'Admin', but user is 'Staff' -> Fail
        if (!in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Unauthorized: You do not have permission to access this resource.',
                'your_role' => $user->role,
                'required_roles' => $roles
            ], 403);
        }

        // 3. If passed, allow request to proceed
        return $next($request);
    }
}