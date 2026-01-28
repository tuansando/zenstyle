<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\CheckRole;
use App\Http\Middleware\PreventBookingSpam;
use App\Http\Middleware\CheckSalonCapacity;
use Illuminate\Auth\AuthenticationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => CheckRole::class,
            'prevent.booking.spam' => PreventBookingSpam::class,
            'check.salon.capacity' => CheckSalonCapacity::class,
        ]);
        
        // Configure API Rate Limiting
        $middleware->throttleApi();
        
        // Custom rate limiters for specific endpoints
        $middleware->group('api', [
            \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Always return JSON for API routes
        $exceptions->shouldRenderJsonWhen(function ($request, $exception) {
            if ($request->is('api/*')) {
                return true;
            }
            return $request->expectsJson();
        });
        
        // Handle authentication exceptions specifically
        $exceptions->render(function (AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated. Please login first.',
                    'error' => 'Authentication required'
                ], 401);
            }
        });
    })->create();