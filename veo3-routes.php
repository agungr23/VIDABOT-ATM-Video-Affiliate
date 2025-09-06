<?php

use App\Http\Controllers\VEO3Controller;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| VEO 3 API Routes
|--------------------------------------------------------------------------
|
| Add these routes to your web.php or api.php file
|
*/

// VEO 3 API Routes
Route::prefix('api')->middleware(['web'])->group(function () {
    // Test Google GenAI API key
    Route::post('/test-genai-key', [VEO3Controller::class, 'testGenAIKey'])
        ->name('api.test-genai-key');
    
    // Generate video (proxy to Node.js bridge)
    Route::post('/generate-video', [VEO3Controller::class, 'generateVideo'])
        ->name('api.generate-video');
    
    // Health check for bridge server
    Route::get('/veo3/health', [VEO3Controller::class, 'healthCheck'])
        ->name('api.veo3.health');
});

/*
|--------------------------------------------------------------------------
| Filament Page Route (if using custom page)
|--------------------------------------------------------------------------
*/

// If you want to add this as a standalone page outside Filament
Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/veo3-generator', function () {
        return view('veo3-generation-filament');
    })->name('veo3.generator');
});
