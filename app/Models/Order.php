<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'total_amount',
        'coupon_code',
        'discount_amount',
        'final_amount',
        'status',
        'payment_method',
        'payment_status',
        'payment_transaction_id',
        'paid_at',
        'shipping_address',
        'phone_number',
        'notes'
    ];

    // Relationship: Belongs to a Client
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    // Relationship: Has many order details
    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }

    // Relationship: Many-to-Many with Products through order_details
    public function products()
    {
        return $this->belongsToMany(Product::class, 'order_details')
                    ->withPivot('quantity', 'unit_price', 'subtotal')
                    ->withTimestamps();
    }
}
