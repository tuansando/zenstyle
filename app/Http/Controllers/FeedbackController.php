<?php

namespace App\Http\Controllers;

use App\Models\Feedback; // Make sure Model exists
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FeedbackController extends Controller
{
    // PUBLIC: View reviews
    public function index()
    {
        return response()->json(Feedback::with('appointment.client')->get());
    }

    // CLIENT ONLY: Submit review
    public function store(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,appointment_id',
            'rating' => 'required|integer|min:1|max:5',
            'service_quality_rating' => 'nullable|integer|min:1|max:5',
            'staff_friendliness_rating' => 'nullable|integer|min:1|max:5',
            'cleanliness_rating' => 'nullable|integer|min:1|max:5',
            'value_for_money_rating' => 'nullable|integer|min:1|max:5',
            'comments' => 'nullable|string'
        ]);

        // Security Check: Does this appointment belong to this user?
        $appointment = Appointment::where('appointment_id', $request->appointment_id)->firstOrFail();

        if ($appointment->client_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized: You can only rate your own appointments.'], 403);
        }

        if ($appointment->status !== 'Completed') {
            return response()->json(['message' => 'You can only rate completed appointments.'], 400);
        }

        // Check if feedback already exists for this appointment
        $existingFeedback = Feedback::where('appointment_id', $request->appointment_id)->first();
        if ($existingFeedback) {
            return response()->json(['message' => 'You have already submitted feedback for this appointment.'], 400);
        }

        $feedbackData = $request->only([
            'appointment_id',
            'rating',
            'service_quality_rating',
            'staff_friendliness_rating',
            'cleanliness_rating',
            'value_for_money_rating',
            'comments'
        ]);

        $feedback = Feedback::create($feedbackData);

        return response()->json([
            'message' => 'Thank you for your detailed feedback!',
            'data' => $feedback
        ], 201);
    }

    // Get feedback by appointment
    public function getByAppointment($appointmentId)
    {
        $feedback = Feedback::where('appointment_id', $appointmentId)->first();
        return response()->json($feedback);
    }
}
