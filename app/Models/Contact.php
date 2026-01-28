<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use HasFactory;

    protected $primaryKey = 'contact_id';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'message',
        'status',
        'admin_reply',
        'replied_by',
        'replied_at'
    ];

    protected $casts = [
        'replied_at' => 'datetime',
    ];

    /**
     * Relationship: Contact được trả lời bởi Admin/Staff
     */
    public function repliedByUser()
    {
        return $this->belongsTo(User::class, 'replied_by', 'id');
    }
}
