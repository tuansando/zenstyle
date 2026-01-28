<?php

/**
 * Fix Service Images - Assign orphaned images to services
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Fix Service Images ===\n\n";

// Get orphaned images
$storageFiles = \Illuminate\Support\Facades\Storage::disk('public')->files('services');
$dbImages = \App\Models\Service::whereNotNull('image')->pluck('image')->toArray();
$orphaned = array_diff($storageFiles, $dbImages);

echo "Found " . count($orphaned) . " orphaned images\n";

// Get services without images
$servicesWithoutImages = \App\Models\Service::whereNull('image')->get();
echo "Found " . count($servicesWithoutImages) . " services without images\n\n";

if (count($orphaned) > 0 && count($servicesWithoutImages) > 0) {
    $orphanedArray = array_values($orphaned);

    foreach ($servicesWithoutImages as $index => $service) {
        if (isset($orphanedArray[$index])) {
            $imagePath = $orphanedArray[$index];
            $service->image = $imagePath;
            $service->save();

            echo "✓ Assigned '{$imagePath}' to '{$service->service_name}'\n";
            echo "  Image URL: {$service->image_url}\n\n";
        }
    }

    echo "=== Services Updated Successfully ===\n";
} else {
    echo "⚠ No orphaned images or services without images found\n";
}
