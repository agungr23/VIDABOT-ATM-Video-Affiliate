<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Simulate processing delay (like real VEO3 API)
sleep(3);

// Get form data
$apiKey = $_POST['apiKey'] ?? '';
$prompt = $_POST['prompt'] ?? '';
$aspectRatio = $_POST['aspectRatio'] ?? '16:9';
$resolution = $_POST['resolution'] ?? '720p';

// Basic validation
if (empty($apiKey)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'API Key is required'
    ]);
    exit();
}

if (empty($prompt)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Prompt is required'
    ]);
    exit();
}

// Validate API key format (basic check)
if (!preg_match('/^AIza[A-Za-z0-9_-]{35,}$/', $apiKey)) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid API Key format. Please check your Google AI Studio API Key.'
    ]);
    exit();
}

// Mock video URLs (working videos from Google Cloud Storage)
$mockVideos = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
];

// Select random video for variety
$randomVideo = $mockVideos[array_rand($mockVideos)];

// Log the request for debugging
error_log("VEO3 Mock API Request: " . json_encode([
    'prompt' => substr($prompt, 0, 100) . '...',
    'aspectRatio' => $aspectRatio,
    'resolution' => $resolution,
    'apiKey' => substr($apiKey, 0, 10) . '...',
    'selectedVideo' => $randomVideo
]));

// Return successful response (following Filament pattern)
echo json_encode([
    'success' => true,
    'videoUrl' => $randomVideo,
    'thumbnail_url' => 'https://via.placeholder.com/640x360/4F46E5/FFFFFF?text=VEO3+Generated+Video',
    'duration' => 8,
    'job_id' => 'mock_job_' . time(),
    'created_at' => date('c'),
    'enhanced_prompt' => 'Enhanced VEO3 prompt: ' . $prompt,
    'used_imagen' => !isset($_FILES['image']),
    'description' => 'Video generated using VEO 3 (Mock Implementation)',
    'config' => [
        'aspectRatio' => $aspectRatio,
        'resolution' => $resolution
    ],
    'prompt' => $prompt,
    'video_file' => 'mock_video_' . time() . '.mp4'
]);
?>
