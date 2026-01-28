<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageService
{
    /**
     * Upload and convert image to WebP format
     * 
     * @param UploadedFile $file
     * @param string $folder
     * @param int $quality
     * @return string|null
     */
    public static function uploadAndConvertToWebP(UploadedFile $file, string $folder = 'images', int $quality = 85): ?string
    {
        try {
            // Check if WebP is supported
            if (!function_exists('imagewebp')) {
                // Fallback: store original if WebP not supported
                return $file->store($folder, 'public');
            }

            // Generate unique filename
            $filename = Str::uuid() . '.webp';
            $path = $folder . '/' . $filename;

            // Get image resource
            $imageResource = self::createImageResource($file);

            if (!$imageResource) {
                // Fallback: store original if conversion fails
                return $file->store($folder, 'public');
            }

            // Create temporary file for WebP
            $tempPath = sys_get_temp_dir() . '/' . $filename;

            // Convert to WebP
            imagewebp($imageResource, $tempPath, $quality);
            imagedestroy($imageResource);

            // Store in public disk
            Storage::disk('public')->put($path, file_get_contents($tempPath));

            // Clean up temp file
            @unlink($tempPath);

            return $path;
        } catch (\Exception $e) {
            \Log::error('Image conversion error: ' . $e->getMessage());
            // Fallback to original upload
            return $file->store($folder, 'public');
        }
    }

    /**
     * Create image resource from uploaded file
     * 
     * @param UploadedFile $file
     * @return resource|false
     */
    private static function createImageResource(UploadedFile $file)
    {
        $mimeType = $file->getMimeType();
        $filePath = $file->getRealPath();

        return match ($mimeType) {
            'image/jpeg', 'image/jpg' => imagecreatefromjpeg($filePath),
            'image/png' => imagecreatefrompng($filePath),
            'image/gif' => imagecreatefromgif($filePath),
            'image/webp' => imagecreatefromwebp($filePath),
            default => false,
        };
    }

    /**
     * Optimize and resize image if needed
     * 
     * @param UploadedFile $file
     * @param string $folder
     * @param int $maxWidth
     * @param int $maxHeight
     * @param int $quality
     * @return string|null
     */
    public static function optimizeAndStore(UploadedFile $file, string $folder = 'images', int $maxWidth = 1920, int $maxHeight = 1080, int $quality = 85): ?string
    {
        try {
            // Check if WebP is supported
            $webpSupported = function_exists('imagewebp');

            // Get image resource
            $imageResource = self::createImageResource($file);

            if (!$imageResource) {
                return $file->store($folder, 'public');
            }

            // Get original dimensions
            $originalWidth = imagesx($imageResource);
            $originalHeight = imagesy($imageResource);

            // Calculate new dimensions while maintaining aspect ratio
            $ratio = min($maxWidth / $originalWidth, $maxHeight / $originalHeight, 1);
            $newWidth = intval($originalWidth * $ratio);
            $newHeight = intval($originalHeight * $ratio);

            // If no resize needed and WebP not supported, just store original
            if ($ratio >= 1 && !$webpSupported) {
                imagedestroy($imageResource);
                return $file->store($folder, 'public');
            }

            // Create new image with new dimensions
            $resizedImage = imagecreatetruecolor($newWidth, $newHeight);

            // Preserve transparency for PNG and GIF
            if (in_array($file->getMimeType(), ['image/png', 'image/gif'])) {
                imagealphablending($resizedImage, false);
                imagesavealpha($resizedImage, true);
                $transparent = imagecolorallocatealpha($resizedImage, 255, 255, 255, 127);
                imagefilledrectangle($resizedImage, 0, 0, $newWidth, $newHeight, $transparent);
            }

            // Copy and resize
            imagecopyresampled($resizedImage, $imageResource, 0, 0, 0, 0, $newWidth, $newHeight, $originalWidth, $originalHeight);

            // Determine output format and extension
            $extension = $webpSupported ? 'webp' : self::getExtensionFromMime($file->getMimeType());
            $filename = Str::uuid() . '.' . $extension;
            $path = $folder . '/' . $filename;
            $tempPath = sys_get_temp_dir() . '/' . $filename;

            // Save image based on format support
            if ($webpSupported) {
                imagewebp($resizedImage, $tempPath, $quality);
            } else {
                // Fallback to original format
                switch ($file->getMimeType()) {
                    case 'image/jpeg':
                    case 'image/jpg':
                        imagejpeg($resizedImage, $tempPath, $quality);
                        break;
                    case 'image/png':
                        imagepng($resizedImage, $tempPath, intval(9 - ($quality / 10)));
                        break;
                    case 'image/gif':
                        imagegif($resizedImage, $tempPath);
                        break;
                    default:
                        imagejpeg($resizedImage, $tempPath, $quality);
                }
            }

            // Clean up
            imagedestroy($imageResource);
            imagedestroy($resizedImage);

            // Store in public disk
            Storage::disk('public')->put($path, file_get_contents($tempPath));

            // Clean up temp file
            @unlink($tempPath);

            return $path;
        } catch (\Exception $e) {
            \Log::error('Image optimization error: ' . $e->getMessage());
            return $file->store($folder, 'public');
        }
    }

    /**
     * Get file extension from MIME type
     * 
     * @param string $mimeType
     * @return string
     */
    private static function getExtensionFromMime(string $mimeType): string
    {
        return match ($mimeType) {
            'image/jpeg', 'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            default => 'jpg',
        };
    }

    /**
     * Delete image from storage
     * 
     * @param string|null $imagePath
     * @return bool
     */
    public static function deleteImage(?string $imagePath): bool
    {
        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            return Storage::disk('public')->delete($imagePath);
        }
        return false;
    }
}
