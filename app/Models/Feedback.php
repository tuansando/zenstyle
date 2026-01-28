<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasFactory;

    protected $table = 'feedbacks';

    protected $fillable = [
        'appointment_id',
        'rating',
        'service_quality_rating',
        'staff_friendliness_rating',
        'cleanliness_rating',
        'value_for_money_rating',
        'comments'
    ];

    /**
     * Calculate average rating from all service ratings
     */
    public function getAverageRatingAttribute()
    {
        $ratings = array_filter([
            $this->service_quality_rating,
            $this->staff_friendliness_rating,
            $this->cleanliness_rating,
            $this->value_for_money_rating
        ]);

        return count($ratings) > 0 ? round(array_sum($ratings) / count($ratings), 1) : $this->rating;
    }

    // Relationship: Belongs to an Appointment
    public function appointment()
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }
}
