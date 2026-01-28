<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = ['service_name', 'price', 'duration_minutes', 'category', 'image', 'description'];
    
    /**
     * Get the full URL for the service image
     */
    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return url('storage/' . $this->image);
        }
        return null;
    }
    
    /**
     * Append image_url to JSON
     */
    protected $appends = ['image_url'];
}
