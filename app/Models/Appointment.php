<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $primaryKey = 'appointment_id'; // Define Custom Primary Key

    protected $fillable = [
        'client_id',
        'staff_id',
        'appointment_date',
        'end_time',
        'status',
        'total_amount',
        'notes',
        'appointment_id',
        'coupon_code',
        'discount_amount',
        'final_amount'
    ];

    // Relationship: Belongs to a Client
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    // Relationship: Belongs to a Staff Member
    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    // Relationship: User (alias for client)
    public function user()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    // Relationship: Has many appointment details
    public function details()
    {
        return $this->hasMany(AppointmentDetail::class, 'appointment_id');
    }

    // Relationship: Has one feedback
    public function feedback()
    {
        return $this->hasOne(Feedback::class, 'appointment_id', 'appointment_id');
    }

    // Accessor: Check if appointment has feedback
    public function getHasFeedbackAttribute()
    {
        // Use relationship to check if feedback exists
        return !is_null($this->getRelationValue('feedback'));
    }

    // Eager load feedback by default for has_feedback check
    protected $with = [];

    // Appended attributes
    protected $appends = ['has_feedback'];
}
