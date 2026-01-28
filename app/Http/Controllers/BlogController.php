<?php

namespace App\Http\Controllers;

use App\Models\Blog; // Note: Make sure you created Blog Model
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class BlogController extends Controller
{
    // PUBLIC: View published news
    public function index()
    {
        return response()->json(Blog::where('status', 'Published')->get());
    }

    // ADMIN: View all blogs (including drafts)
    public function getAll()
    {
        $blogs = Blog::with('author:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'message' => 'All blogs retrieved successfully',
            'data' => $blogs
        ]);
    }

    // PROTECTED (Admin/Staff): Write article
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = ImageService::optimizeAndStore(
                $request->file('image'), 
                'blogs',
                1200, // max width
                1200, // max height
                85    // quality
            );
        }

        $blog = Blog::create([
            'author_id' => Auth::id(),
            'title' => $request->input('title'),
            'slug' => Str::slug($request->input('title')),
            'content' => $request->input('content'),
            'image' => $imagePath,
            'status' => $request->input('status', 'Published')
        ]);

        return response()->json(['message' => 'Blog posted', 'data' => $blog], 201);
    }

    // PROTECTED (Admin/Staff): Update article
    public function update(Request $request, $id)
    {
        $blog = Blog::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|required|string',
            'content' => 'sometimes|required|string',
            'status' => 'sometimes|in:Published,Draft',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($request->has('title')) {
            $blog->title = $request->input('title');
            $blog->slug = Str::slug($request->input('title'));
        }
        if ($request->has('content')) {
            $blog->content = $request->input('content');
        }
        if ($request->has('status')) {
            $blog->status = $request->input('status');
        }
        if ($request->hasFile('image')) {
            // Delete old image if exists
            ImageService::deleteImage($blog->image);
            
            $blog->image = ImageService::optimizeAndStore(
                $request->file('image'), 
                'blogs',
                1200,
                1200,
                85
            );
        }

        $blog->save();

        return response()->json(['message' => 'Blog updated', 'data' => $blog]);
    }

    // PROTECTED (Admin ONLY): Delete article
    public function destroy($id)
    {
        $blog = Blog::findOrFail($id);
        
        // Delete associated image
        ImageService::deleteImage($blog->image);
        
        $blog->delete();

        return response()->json(['message' => 'Blog deleted successfully']);
    }
}