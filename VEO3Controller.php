<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VEO3Controller extends Controller
{
    /**
     * Test Google GenAI API key
     */
    public function testGenAIKey(Request $request): JsonResponse
    {
        $request->validate([
            'apiKey' => 'required|string|min:20'
        ]);

        $apiKey = $request->input('apiKey');

        // Basic validation
        if (!str_starts_with($apiKey, 'AIza')) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid API key format. Google GenAI API keys should start with "AIza"'
            ]);
        }

        try {
            // Test API key with a simple Imagen request
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages?key={$apiKey}", [
                'prompt' => 'A simple test image',
                'numberOfImages' => 1
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['generatedImages']) && count($data['generatedImages']) > 0) {
                    return response()->json([
                        'success' => true,
                        'message' => 'API key is valid and working!'
                    ]);
                }
            }

            // Check for specific error messages
            $errorData = $response->json();
            $errorMessage = 'Invalid API key or insufficient permissions';
            
            if (isset($errorData['error']['message'])) {
                $errorMessage = $errorData['error']['message'];
            }

            return response()->json([
                'success' => false,
                'error' => $errorMessage
            ]);

        } catch (\Exception $e) {
            Log::error('GenAI API key test failed', [
                'error' => $e->getMessage(),
                'api_key_prefix' => substr($apiKey, 0, 10) . '...'
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to test API key. Please check your internet connection.'
            ]);
        }
    }

    /**
     * Get Gemini API key from environment or config
     */
    public function getGeminiKey(): ?string
    {
        return config('services.gemini.api_key') ?? env('GEMINI_API_KEY');
    }

    /**
     * Proxy request to Node.js VEO3 bridge
     */
    public function generateVideo(Request $request): JsonResponse
    {
        $request->validate([
            'apiKey' => 'required|string|min:20',
            'prompt' => 'required|string|min:10',
            'config' => 'sometimes|array',
            'referenceImage' => 'sometimes|file|image|max:10240' // 10MB max
        ]);

        try {
            // Prepare data for Node.js bridge
            $bridgeUrl = config('services.veo3.bridge_url', 'http://localhost:3005');
            
            $multipart = [
                [
                    'name' => 'apiKey',
                    'contents' => $request->input('apiKey')
                ],
                [
                    'name' => 'prompt',
                    'contents' => $request->input('prompt')
                ],
                [
                    'name' => 'config',
                    'contents' => json_encode($request->input('config', []))
                ]
            ];

            // Add reference image if provided
            if ($request->hasFile('referenceImage')) {
                $file = $request->file('referenceImage');
                $multipart[] = [
                    'name' => 'referenceImage',
                    'contents' => fopen($file->getPathname(), 'r'),
                    'filename' => $file->getClientOriginalName()
                ];
            }

            // Forward request to Node.js bridge
            $response = Http::timeout(300) // 5 minutes timeout
                ->asMultipart()
                ->post("{$bridgeUrl}/generate-video", $multipart);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'success' => false,
                'error' => 'Bridge server error: ' . $response->body()
            ], $response->status());

        } catch (\Exception $e) {
            Log::error('VEO3 generation failed', [
                'error' => $e->getMessage(),
                'prompt' => $request->input('prompt')
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Video generation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Health check for VEO3 bridge server
     */
    public function healthCheck(): JsonResponse
    {
        try {
            $bridgeUrl = config('services.veo3.bridge_url', 'http://localhost:3005');
            $response = Http::timeout(5)->get("{$bridgeUrl}/health");

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'bridge_status' => 'online',
                    'bridge_data' => $response->json()
                ]);
            }

            return response()->json([
                'success' => false,
                'bridge_status' => 'offline',
                'error' => 'Bridge server not responding'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'bridge_status' => 'error',
                'error' => $e->getMessage()
            ]);
        }
    }
}
