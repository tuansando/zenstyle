<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    // PUBLIC: Get list of products (For Clients & Website)
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Product::all()
        ]);
    }

    // PROTECTED (Staff/Admin): Create new product
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'stock_quantity' => 'required|integer|min:0',
            'unit_price' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120'
        ]);

        // Handle image upload with WebP conversion
        if ($request->hasFile('image')) {
            $imagePath = ImageService::optimizeAndStore(
                $request->file('image'),
                'products',
                1200, // max width
                1200, // max height
                85    // quality
            );
            $validated['image'] = $imagePath;
        }

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Product created successfully',
            'data' => $product
        ], 201);
    }

    // PROTECTED (Staff/Admin): Update product (e.g., Update stock)
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // Validate inputs (use sometimes to allow partial updates)
        $request->validate([
            'product_name' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|max:100',
            'stock_quantity' => 'sometimes|integer|min:0',
            'unit_price' => 'sometimes|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120'
        ]);

        $data = $request->all();

        // Handle image upload with WebP conversion - ONLY if new image provided
        if ($request->hasFile('image')) {
            // Delete old image if exists
            ImageService::deleteImage($product->image);

            $imagePath = ImageService::optimizeAndStore(
                $request->file('image'),
                'products',
                1200,
                1200,
                85
            );
            $data['image'] = $imagePath;
        } else {
            // Keep existing image if no new image uploaded
            unset($data['image']);
        }

        $product->update($data);

        return response()->json(['message' => 'Product updated successfully', 'data' => $product]);
    }

    // ADMIN ONLY: Delete product
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        // Delete associated image
        ImageService::deleteImage($product->image);

        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }
}
