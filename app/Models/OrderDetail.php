<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'unit_price',
        'subtotal'
    ];

    // Relationship: Belongs to an Order
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Relationship: Belongs to a Product
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
