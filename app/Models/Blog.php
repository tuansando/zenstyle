<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    use HasFactory;

    protected $fillable = [
        'author_id',
        'title',
        'slug',
        'content',
        'image',
        'status'
    ];

    // Relationship: Belongs to an Author (User)
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
    
    /**
     * Get the full URL for the blog image
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
