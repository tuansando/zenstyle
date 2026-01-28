<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppointmentDetail extends Model
{
    protected $fillable = [
        'appointment_id',
        'service_id',
        'service_price'
    ];

    // Relationship: Belongs to an Appointment
    public function appointment()
    {
        return $this->belongsTo(Appointment::class, 'appointment_id', 'appointment_id');
    }

    // Relationship: Belongs to a Service
    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id');
    }
}
