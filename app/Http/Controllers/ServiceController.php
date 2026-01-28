<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ServiceController extends Controller
{
    // PUBLIC: List all services
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Service::all()
        ]);
    }

    // PROTECTED (Staff/Admin): Add new service
    public function store(Request $request)
    {
        $request->validate([
            'service_name' => 'required|string',
            'price' => 'required|numeric',
            'duration_minutes' => 'required|integer|min:15', // Logic constraint
            'category' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120'
        ]);

        $data = $request->all();

        // Handle image upload with WebP conversion
        if ($request->hasFile('image')) {
            $imagePath = ImageService::optimizeAndStore(
                $request->file('image'),
                'services',
                1200, // max width
                1200, // max height
                85    // quality
            );
            $data['image'] = $imagePath;
        }

        $service = Service::create($data);

        return response()->json(['message' => 'Service created successfully', 'data' => $service], 201);
    }

    // PROTECTED (Staff/Admin): Update service details
    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        $request->validate([
            'service_name' => 'nullable|string',
            'price' => 'nullable|numeric',
            'duration_minutes' => 'nullable|integer|min:15',
            'category' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120'
        ]);

        $data = $request->all();

        // Handle image upload with WebP conversion - ONLY if new image provided
        if ($request->hasFile('image')) {
            // Delete old image if exists
            ImageService::deleteImage($service->image);

            $imagePath = ImageService::optimizeAndStore(
                $request->file('image'),
                'services',
                1200,
                1200,
                85
            );
            $data['image'] = $imagePath;
        } else {
            // Keep existing image if no new image uploaded
            unset($data['image']);
        }

        $service->update($data);
        return response()->json(['message' => 'Service updated', 'data' => $service]);
    }

    // ADMIN ONLY: Remove service
    public function destroy($id)
    {
        $service = Service::findOrFail($id);

        // Delete associated image
        ImageService::deleteImage($service->image);

        $service->delete();
        return response()->json(['message' => 'Service deleted']);
    }
}
