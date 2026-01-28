<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_name',
        'category',
        'image',
        'stock_quantity',
        'unit_price',
        'description'
    ];

    /**
     * Get the full URL for the product image
     */
    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return url('storage/' . $this->image);
        }
        return null;
    }

    /**
     * Check if product stock is low (below threshold)
     */
    public function getIsLowStockAttribute()
    {
        return $this->stock_quantity > 0 && $this->stock_quantity < 5;
    }

    /**
     * Check if product is out of stock
     */
    public function getIsOutOfStockAttribute()
    {
        return $this->stock_quantity === 0;
    }

    /**
     * Get stock status badge info
     */
    public function getStockStatusAttribute()
    {
        if ($this->stock_quantity === 0) {
            return [
                'status' => 'out_of_stock',
                'label' => 'Out of Stock',
                'color' => 'red'
            ];
        } elseif ($this->stock_quantity < 5) {
            return [
                'status' => 'low_stock',
                'label' => 'Low Stock',
                'color' => 'orange'
            ];
        } else {
            return [
                'status' => 'in_stock',
                'label' => 'In Stock',
                'color' => 'green'
            ];
        }
    }

    /**
     * Append computed attributes to JSON
     */
    protected $appends = ['image_url', 'is_low_stock', 'is_out_of_stock', 'stock_status'];
}
