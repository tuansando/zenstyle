<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class RateLimitServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // General API rate limiting
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Strict rate limiting for authentication endpoints (prevent brute force)
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Too many login attempts. Please try again later.',
                        'error' => 'Rate limit exceeded'
                    ], 429);
                });
        });

        // Booking rate limiting (prevent spam bookings)
        RateLimiter::for('booking', function (Request $request) {
            $userId = $request->user()?->id;
            
            if (!$userId) {
                // If not authenticated, limit by IP (relaxed for testing)
                return Limit::perMinute(10)->by($request->ip());
            }
            
            // Authenticated users (relaxed limits for testing):
            // - Max 20 bookings per minute (increased for testing)
            // - Max 50 bookings per hour (increased for testing)
            return [
                Limit::perMinute(20)->by($userId)->response(function () {
                    return response()->json([
                        'message' => 'You are booking too quickly. Please wait a moment.',
                        'error' => 'Booking rate limit exceeded',
                        'retry_after' => 60
                    ], 429);
                }),
                Limit::perHour(50)->by($userId)->response(function () {
                    return response()->json([
                        'message' => 'You have reached your hourly booking limit (50 bookings). Please try again later.',
                        'error' => 'Hourly booking limit exceeded',
                        'retry_after' => 3600
                    ], 429);
                })
            ];
        });

        // Contact form rate limiting (prevent spam)
        RateLimiter::for('contact', function (Request $request) {
            return [
                Limit::perMinute(3)->by($request->ip())->response(function () {
                    return response()->json([
                        'message' => 'Too many contact messages. Please wait before sending another.',
                        'error' => 'Contact rate limit exceeded'
                    ], 429);
                }),
                Limit::perHour(10)->by($request->ip())
            ];
        });

        // Availability check rate limiting
        RateLimiter::for('check-availability', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Too many availability checks. Please slow down.',
                        'error' => 'Rate limit exceeded'
                    ], 429);
                });
        });

        // Order creation rate limiting
        RateLimiter::for('orders', function (Request $request) {
            $userId = $request->user()?->id ?: $request->ip();
            
            return [
                Limit::perMinute(5)->by($userId),
                Limit::perHour(20)->by($userId)->response(function () {
                    return response()->json([
                        'message' => 'You have reached your hourly order limit. Please try again later.',
                        'error' => 'Order rate limit exceeded'
                    ], 429);
                })
            ];
        });
    }
}
