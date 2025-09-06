@php
$geminiKey = $this->getGeminiKey();
@endphp

@push('head')
<meta name="csrf-token" content="{{ csrf_token() }}">
@endpush

<x-filament-panels::page>
    <style>
        /* Reset dan Base Styles */
        * {
            box-sizing: border-box;
        }

        .veo3-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .veo3-header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            color: white;
        }

        .veo3-header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .veo3-header p {
            font-size: 1.1rem;
            opacity: 0.9;
            margin: 0;
        }

        /* Steps Navigation */
        .steps-nav {
            display: flex;
            justify-content: center;
            margin-bottom: 40px;
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .step-item {
            display: flex;
            align-items: center;
            padding: 12px 20px;
            margin: 0 10px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #f8fafc;
            border: 2px solid #e2e8f0;
        }

        .step-item.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }

        .step-item.completed {
            background: #10b981;
            color: white;
            border-color: #10b981;
        }

        .step-number {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #cbd5e0;
            color: #4a5568;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.9rem;
            margin-right: 8px;
        }

        .step-item.active .step-number,
        .step-item.completed .step-number {
            background: rgba(255,255,255,0.2);
            color: white;
        }

        /* Form Container */
        .form-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 30px;
            margin-bottom: 30px;
            min-height: 400px;
        }

        .step-content {
            display: none;
        }

        .step-content.active {
            display: block;
        }

        .form-group {
            margin-bottom: 25px;
        }

        .form-label {
            display: block;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            font-size: 1rem;
        }

        .required {
            color: #ef4444;
        }

        .form-input,
        .form-select,
        .form-textarea {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.2s ease;
            background: white;
            color: #374151;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-textarea {
            min-height: 120px;
            resize: vertical;
            font-family: inherit;
        }

        /* Buttons */
        .buttons-container {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn-primary {
            background: #667eea;
            color: white;
        }

        .btn-primary:hover {
            background: #5a67d8;
            transform: translateY(-1px);
        }

        .btn-secondary {
            background: #6b7280;
            color: white;
        }

        .btn-secondary:hover {
            background: #4b5563;
        }

        .btn-success {
            background: #10b981;
            color: white;
        }

        .btn-success:hover {
            background: #059669;
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
        }

        /* Image Upload */
        .image-upload-area {
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            padding: 40px 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
            background: #f9fafb;
        }

        .image-upload-area:hover {
            border-color: #667eea;
            background: #f0f4ff;
        }

        .image-upload-area.has-image {
            border-color: #10b981;
            background: #f0fdf4;
        }

        .image-preview {
            max-width: 100%;
            max-height: 200px;
            border-radius: 8px;
            margin-top: 10px;
        }

        /* Progress Bar */
        .progress-container {
            background: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            display: none;
        }

        .progress-container.active {
            display: block;
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 10px;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            width: 0%;
            transition: width 0.3s ease;
        }

        .progress-text {
            text-align: center;
            color: #6b7280;
            font-weight: 500;
        }

        /* Video Result */
        .video-result {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 30px;
            margin-top: 30px;
            text-align: center;
            display: none;
        }

        .video-result.active {
            display: block;
        }

        .video-player {
            width: 100%;
            max-width: 640px;
            border-radius: 8px;
            margin: 20px auto;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .steps-nav {
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .step-item {
                margin: 0;
                flex: 1;
                min-width: 120px;
            }
            
            .veo3-header h1 {
                font-size: 2rem;
            }
            
            .buttons-container {
                flex-direction: column;
                gap: 10px;
            }
        }

        /* Loading Animation */
        .loading-spinner {
            border: 3px solid #f3f4f6;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
            margin-right: 8px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .hidden {
            display: none !important;
        }
    </style>

    <div class="veo3-container">
        <!-- Header -->
        <div class="veo3-header">
            <h1>🎬 VEO 3 Video Generator</h1>
            <p>Create stunning videos with Google's VEO 3 AI in 5 simple steps</p>
        </div>

        <!-- Steps Navigation -->
        <div class="steps-nav">
            <div class="step-item active" data-step="1">
                <div class="step-number">1</div>
                <span>API Setup</span>
            </div>
            <div class="step-item" data-step="2">
                <div class="step-number">2</div>
                <span>Video Prompt</span>
            </div>
            <div class="step-item" data-step="3">
                <div class="step-number">3</div>
                <span>Reference Image</span>
            </div>
            <div class="step-item" data-step="4">
                <div class="step-number">4</div>
                <span>Configuration</span>
            </div>
            <div class="step-item" data-step="5">
                <div class="step-number">5</div>
                <span>Generate</span>
            </div>
        </div>

        <!-- Form Container -->
        <div class="form-container">
            <!-- Step 1: API Setup -->
            <div class="step-content active" id="step-1">
                <h3 style="color: #374151; font-size: 1.5rem; font-weight: 600; margin-bottom: 20px;">
                    🔑 API Configuration
                </h3>
                <p style="color: #6b7280; margin-bottom: 30px;">
                    Enter your Google GenAI API key to access VEO 3 video generation capabilities.
                </p>

                <div class="form-group">
                    <label class="form-label" for="apiKey">
                        Google GenAI API Key <span class="required">*</span>
                    </label>
                    <input
                        type="password"
                        id="apiKey"
                        class="form-input"
                        placeholder="Enter your Google GenAI API key (starts with AIza...)"
                        value="{{ $geminiKey ?? '' }}"
                    >
                    <small style="color: #6b7280; margin-top: 5px; display: block;">
                        Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: #667eea;">Google AI Studio</a>
                    </small>
                </div>

                <div class="form-group">
                    <button type="button" class="btn btn-secondary" onclick="testApiKey()">
                        <span id="test-spinner" class="loading-spinner hidden"></span>
                        Test API Key
                    </button>
                    <div id="api-test-result" style="margin-top: 10px;"></div>
                </div>
            </div>

            <!-- Step 2: Video Prompt -->
            <div class="step-content" id="step-2">
                <h3 style="color: #374151; font-size: 1.5rem; font-weight: 600; margin-bottom: 20px;">
                    ✍️ Video Prompt
                </h3>
                <p style="color: #6b7280; margin-bottom: 30px;">
                    Describe the video you want to create. Be specific and detailed for best results.
                </p>

                <div class="form-group">
                    <label class="form-label" for="videoPrompt">
                        Video Description <span class="required">*</span>
                    </label>
                    <textarea
                        id="videoPrompt"
                        class="form-textarea"
                        placeholder="Describe your video in detail... (e.g., 'A cat walking through a beautiful garden with flowers blooming, cinematic lighting, 4K quality')"
                        style="min-height: 150px;"
                    ></textarea>
                    <small style="color: #6b7280; margin-top: 5px; display: block;">
                        💡 Tip: Include details about camera movement, lighting, style, and quality for better results
                    </small>
                </div>

                <div class="form-group">
                    <label class="form-label">Quick Prompt Templates</label>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
                        <button type="button" class="btn btn-secondary" onclick="setPromptTemplate('nature')">
                            🌿 Nature Scene
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="setPromptTemplate('urban')">
                            🏙️ Urban Scene
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="setPromptTemplate('abstract')">
                            🎨 Abstract Art
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="setPromptTemplate('portrait')">
                            👤 Portrait
                        </button>
                    </div>
                </div>
            </div>

            <!-- Step 3: Reference Image -->
            <div class="step-content" id="step-3">
                <h3 style="color: #374151; font-size: 1.5rem; font-weight: 600; margin-bottom: 20px;">
                    🖼️ Reference Image (Optional)
                </h3>
                <p style="color: #6b7280; margin-bottom: 30px;">
                    Upload a reference image to guide the video generation. This is optional but can improve results.
                </p>

                <div class="form-group">
                    <label class="form-label">Reference Image</label>
                    <div class="image-upload-area" onclick="document.getElementById('referenceImage').click()">
                        <div id="upload-placeholder">
                            <div style="font-size: 3rem; margin-bottom: 10px;">📁</div>
                            <p style="margin: 0; color: #6b7280; font-weight: 500;">
                                Click to upload reference image
                            </p>
                            <small style="color: #9ca3af; margin-top: 5px; display: block;">
                                Supports JPG, PNG, WebP (max 10MB)
                            </small>
                        </div>
                        <div id="image-preview-container" class="hidden">
                            <img id="image-preview" class="image-preview" alt="Reference image preview">
                            <p style="margin: 10px 0 0 0; color: #10b981; font-weight: 500;">
                                ✅ Image uploaded successfully
                            </p>
                        </div>
                    </div>
                    <input
                        type="file"
                        id="referenceImage"
                        accept="image/*"
                        style="display: none;"
                        onchange="handleImageUpload(this)"
                    >
                </div>

                <div class="form-group">
                    <button type="button" class="btn btn-secondary" onclick="clearImage()">
                        🗑️ Remove Image
                    </button>
                </div>
            </div>

            <!-- Step 4: Configuration -->
            <div class="step-content" id="step-4">
                <h3 style="color: #374151; font-size: 1.5rem; font-weight: 600; margin-bottom: 20px;">
                    ⚙️ Video Configuration
                </h3>
                <p style="color: #6b7280; margin-bottom: 30px;">
                    Configure video generation settings and quality options.
                </p>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <div class="form-group">
                        <label class="form-label" for="videoQuality">Video Quality</label>
                        <select id="videoQuality" class="form-select">
                            <option value="standard">Standard Quality</option>
                            <option value="high" selected>High Quality (Recommended)</option>
                            <option value="ultra">Ultra Quality</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="videoDuration">Expected Duration</label>
                        <select id="videoDuration" class="form-select">
                            <option value="auto" selected>Auto (~8 seconds)</option>
                            <option value="short">Short (~5 seconds)</option>
                            <option value="medium">Medium (~8 seconds)</option>
                            <option value="long">Long (~12 seconds)</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="videoStyle">Video Style</label>
                    <select id="videoStyle" class="form-select">
                        <option value="realistic" selected>Realistic</option>
                        <option value="cinematic">Cinematic</option>
                        <option value="artistic">Artistic</option>
                        <option value="documentary">Documentary</option>
                        <option value="animation">Animation Style</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="enhancePrompt">
                        <input type="checkbox" id="enhancePrompt" checked style="margin-right: 8px;">
                        Auto-enhance prompt with VEO 3 optimizations
                    </label>
                    <small style="color: #6b7280; margin-top: 5px; display: block;">
                        Automatically adds technical details for better video quality
                    </small>
                </div>
            </div>

            <!-- Step 5: Generate -->
            <div class="step-content" id="step-5">
                <h3 style="color: #374151; font-size: 1.5rem; font-weight: 600; margin-bottom: 20px;">
                    🚀 Generate Video
                </h3>
                <p style="color: #6b7280; margin-bottom: 30px;">
                    Review your settings and generate your VEO 3 video.
                </p>

                <div id="generation-summary" style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <h4 style="margin: 0 0 15px 0; color: #374151;">Generation Summary:</h4>
                    <div id="summary-content">
                        <!-- Will be populated by JavaScript -->
                    </div>
                </div>

                <div class="form-group">
                    <button type="button" id="generateBtn" class="btn btn-success" onclick="generateVideo()" style="width: 100%; padding: 16px; font-size: 1.1rem;">
                        <span id="generate-spinner" class="loading-spinner hidden"></span>
                        🎬 Generate Video with VEO 3
                    </button>
                </div>

                <!-- Progress Container -->
                <div id="progress-container" class="progress-container">
                    <div class="progress-bar">
                        <div id="progress-fill" class="progress-fill"></div>
                    </div>
                    <div id="progress-text" class="progress-text">Initializing...</div>
                </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="buttons-container">
                <button type="button" id="prevBtn" class="btn btn-secondary" onclick="previousStep()" style="display: none;">
                    ← Previous
                </button>
                <div></div>
                <button type="button" id="nextBtn" class="btn btn-primary" onclick="nextStep()">
                    Next →
                </button>
            </div>
        </div>

        <!-- Video Result -->
        <div id="video-result" class="video-result">
            <h3 style="color: #374151; font-size: 1.5rem; font-weight: 600; margin-bottom: 20px;">
                ✅ Video Generated Successfully!
            </h3>
            <div id="video-container">
                <!-- Video player will be inserted here -->
            </div>
            <div style="margin-top: 20px;">
                <button type="button" class="btn btn-primary" onclick="downloadVideo()">
                    📥 Download Video
                </button>
                <button type="button" class="btn btn-secondary" onclick="generateAnother()">
                    🔄 Generate Another
                </button>
            </div>
        </div>
    </div>

    <script>
        // Global variables
        let currentStep = 1;
        let maxSteps = 5;
        let generatedVideoData = null;
        let referenceImageFile = null;

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            updateStepNavigation();
            updateSummary();
        });

        // Step Navigation
        function nextStep() {
            if (validateCurrentStep()) {
                if (currentStep < maxSteps) {
                    currentStep++;
                    showStep(currentStep);
                    updateStepNavigation();
                    updateSummary();
                }
            }
        }

        function previousStep() {
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
                updateStepNavigation();
                updateSummary();
            }
        }

        function goToStep(step) {
            if (step >= 1 && step <= maxSteps) {
                currentStep = step;
                showStep(currentStep);
                updateStepNavigation();
                updateSummary();
            }
        }

        function showStep(step) {
            // Hide all steps
            document.querySelectorAll('.step-content').forEach(content => {
                content.classList.remove('active');
            });

            // Show current step
            document.getElementById(`step-${step}`).classList.add('active');
        }

        function updateStepNavigation() {
            // Update step items
            document.querySelectorAll('.step-item').forEach((item, index) => {
                const stepNum = index + 1;
                item.classList.remove('active', 'completed');

                if (stepNum === currentStep) {
                    item.classList.add('active');
                } else if (stepNum < currentStep) {
                    item.classList.add('completed');
                }

                // Add click handler
                item.onclick = () => goToStep(stepNum);
            });

            // Update navigation buttons
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');

            prevBtn.style.display = currentStep > 1 ? 'block' : 'none';

            if (currentStep === maxSteps) {
                nextBtn.style.display = 'none';
            } else {
                nextBtn.style.display = 'block';
                nextBtn.textContent = 'Next →';
            }
        }

        // Validation
        function validateCurrentStep() {
            switch(currentStep) {
                case 1:
                    const apiKey = document.getElementById('apiKey').value.trim();
                    if (!apiKey) {
                        alert('Please enter your Google GenAI API key');
                        return false;
                    }
                    if (!apiKey.startsWith('AIza')) {
                        alert('Please enter a valid Google GenAI API key (should start with "AIza")');
                        return false;
                    }
                    return true;

                case 2:
                    const prompt = document.getElementById('videoPrompt').value.trim();
                    if (!prompt) {
                        alert('Please enter a video description');
                        return false;
                    }
                    if (prompt.length < 10) {
                        alert('Please provide a more detailed video description (at least 10 characters)');
                        return false;
                    }
                    return true;

                case 3:
                    // Reference image is optional
                    return true;

                case 4:
                    // Configuration is optional with defaults
                    return true;

                default:
                    return true;
            }
        }

        // API Key Testing
        async function testApiKey() {
            const apiKey = document.getElementById('apiKey').value.trim();
            const spinner = document.getElementById('test-spinner');
            const result = document.getElementById('api-test-result');

            if (!apiKey) {
                result.innerHTML = '<div style="color: #ef4444;">❌ Please enter an API key first</div>';
                return;
            }

            spinner.classList.remove('hidden');
            result.innerHTML = '<div style="color: #6b7280;">🔄 Testing API key...</div>';

            try {
                // Test API key with a simple request
                const response = await fetch('/api/test-genai-key', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                    body: JSON.stringify({ apiKey: apiKey })
                });

                const data = await response.json();

                if (data.success) {
                    result.innerHTML = '<div style="color: #10b981;">✅ API key is valid and working!</div>';
                } else {
                    result.innerHTML = `<div style="color: #ef4444;">❌ ${data.error || 'Invalid API key'}</div>`;
                }
            } catch (error) {
                result.innerHTML = '<div style="color: #ef4444;">❌ Error testing API key. Please check your connection.</div>';
            } finally {
                spinner.classList.add('hidden');
            }
        }

        // Prompt Templates
        function setPromptTemplate(type) {
            const promptField = document.getElementById('videoPrompt');
            let template = '';

            switch(type) {
                case 'nature':
                    template = 'A serene nature scene with a gentle breeze moving through tall grass and wildflowers, golden hour lighting, cinematic camera movement, 4K quality, peaceful atmosphere';
                    break;
                case 'urban':
                    template = 'A bustling city street at sunset with people walking, cars passing by, neon lights beginning to glow, dynamic camera movement, urban atmosphere, cinematic quality';
                    break;
                case 'abstract':
                    template = 'Abstract flowing colors and shapes morphing and transforming, vibrant gradients, smooth transitions, artistic style, mesmerizing patterns, high quality animation';
                    break;
                case 'portrait':
                    template = 'A close-up portrait of a person with natural lighting, subtle facial expressions, professional cinematography, shallow depth of field, high quality, emotional depth';
                    break;
            }

            promptField.value = template;
            promptField.focus();
        }

        // Image Handling
        function handleImageUpload(input) {
            const file = input.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }

            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                alert('Image file is too large. Please select an image smaller than 10MB');
                return;
            }

            referenceImageFile = file;

            // Show preview
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('image-preview').src = e.target.result;
                document.getElementById('upload-placeholder').classList.add('hidden');
                document.getElementById('image-preview-container').classList.remove('hidden');
                document.querySelector('.image-upload-area').classList.add('has-image');
            };
            reader.readAsDataURL(file);
        }

        function clearImage() {
            referenceImageFile = null;
            document.getElementById('referenceImage').value = '';
            document.getElementById('upload-placeholder').classList.remove('hidden');
            document.getElementById('image-preview-container').classList.add('hidden');
            document.querySelector('.image-upload-area').classList.remove('has-image');
        }

        // Summary Update
        function updateSummary() {
            if (currentStep !== 5) return;

            const apiKey = document.getElementById('apiKey').value.trim();
            const prompt = document.getElementById('videoPrompt').value.trim();
            const quality = document.getElementById('videoQuality').value;
            const duration = document.getElementById('videoDuration').value;
            const style = document.getElementById('videoStyle').value;
            const enhance = document.getElementById('enhancePrompt').checked;

            let summaryHtml = `
                <div style="display: grid; gap: 15px;">
                    <div><strong>API Key:</strong> ${apiKey ? '✅ Configured' : '❌ Not set'}</div>
                    <div><strong>Prompt:</strong> ${prompt || 'Not set'}</div>
                    <div><strong>Reference Image:</strong> ${referenceImageFile ? '✅ Uploaded' : '❌ None'}</div>
                    <div><strong>Quality:</strong> ${quality}</div>
                    <div><strong>Duration:</strong> ${duration}</div>
                    <div><strong>Style:</strong> ${style}</div>
                    <div><strong>Auto-enhance:</strong> ${enhance ? 'Yes' : 'No'}</div>
                </div>
            `;

            document.getElementById('summary-content').innerHTML = summaryHtml;
        }

        // Video Generation
        async function generateVideo() {
            const generateBtn = document.getElementById('generateBtn');
            const spinner = document.getElementById('generate-spinner');
            const progressContainer = document.getElementById('progress-container');
            const progressFill = document.getElementById('progress-fill');
            const progressText = document.getElementById('progress-text');

            // Disable button and show spinner
            generateBtn.disabled = true;
            spinner.classList.remove('hidden');
            progressContainer.classList.add('active');

            try {
                // Prepare form data
                const formData = new FormData();
                formData.append('apiKey', document.getElementById('apiKey').value.trim());

                let prompt = document.getElementById('videoPrompt').value.trim();

                // Enhance prompt if enabled
                if (document.getElementById('enhancePrompt').checked) {
                    const quality = document.getElementById('videoQuality').value;
                    const style = document.getElementById('videoStyle').value;
                    prompt = enhancePromptWithVEO3(prompt, quality, style);
                }

                formData.append('prompt', prompt);
                formData.append('config', JSON.stringify({
                    quality: document.getElementById('videoQuality').value,
                    duration: document.getElementById('videoDuration').value,
                    style: document.getElementById('videoStyle').value
                }));

                // Add reference image if uploaded
                if (referenceImageFile) {
                    formData.append('referenceImage', referenceImageFile);
                }

                // Update progress
                updateProgress(10, 'Sending request to VEO 3...');

                // Send request to Node.js bridge
                const response = await fetch('http://localhost:3005/generate-video', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Server error: ${response.statusText}`);
                }

                // Handle streaming response
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let result = null;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n').filter(line => line.trim());

                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line);

                            if (data.type === 'progress') {
                                updateProgress(Math.min(90, Math.random() * 40 + 30), data.message);
                            } else if (data.type === 'result' && data.success) {
                                result = data;
                                updateProgress(100, 'Video generated successfully!');
                            } else if (data.type === 'error') {
                                throw new Error(data.error);
                            }
                        } catch (parseError) {
                            console.warn('Failed to parse response line:', line);
                        }
                    }
                }

                if (!result) {
                    throw new Error('No result received from server');
                }

                // Show video result
                showVideoResult(result);

            } catch (error) {
                console.error('Generation error:', error);
                alert(`Error generating video: ${error.message}`);
                updateProgress(0, 'Generation failed');
            } finally {
                generateBtn.disabled = false;
                spinner.classList.add('hidden');
                setTimeout(() => {
                    progressContainer.classList.remove('active');
                }, 2000);
            }
        }

        function updateProgress(percentage, message) {
            document.getElementById('progress-fill').style.width = percentage + '%';
            document.getElementById('progress-text').textContent = message;
        }

        function enhancePromptWithVEO3(prompt, quality, style) {
            let enhanced = prompt;

            // Add quality descriptors
            if (quality === 'high') {
                enhanced += ', high quality, detailed, sharp focus';
            } else if (quality === 'ultra') {
                enhanced += ', ultra high quality, 4K, professional cinematography, crystal clear';
            }

            // Add style descriptors
            switch(style) {
                case 'cinematic':
                    enhanced += ', cinematic lighting, film grain, professional color grading';
                    break;
                case 'artistic':
                    enhanced += ', artistic style, creative composition, unique perspective';
                    break;
                case 'documentary':
                    enhanced += ', documentary style, natural lighting, realistic';
                    break;
                case 'animation':
                    enhanced += ', animation style, smooth motion, vibrant colors';
                    break;
            }

            // Add VEO 3 specific optimizations
            enhanced += ', smooth camera movement, stable footage, professional video quality';

            return enhanced;
        }

        // Video Result Display
        function showVideoResult(result) {
            generatedVideoData = result;

            // Create video element
            const videoHtml = `
                <video class="video-player" controls autoplay muted>
                    <source src="${result.videoUrl || result.video_url}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div style="margin-top: 15px; text-align: left; background: #f8fafc; padding: 15px; border-radius: 8px;">
                    <h4 style="margin: 0 0 10px 0; color: #374151;">Video Details:</h4>
                    <div style="display: grid; gap: 8px; font-size: 0.9rem; color: #6b7280;">
                        <div><strong>Prompt:</strong> ${result.prompt}</div>
                        <div><strong>Duration:</strong> ~${result.duration || 8} seconds</div>
                        <div><strong>Model:</strong> ${result.model || 'VEO 3'}</div>
                        <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
                    </div>
                </div>
            `;

            document.getElementById('video-container').innerHTML = videoHtml;
            document.getElementById('video-result').classList.add('active');

            // Scroll to result
            document.getElementById('video-result').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }

        // Download Video
        function downloadVideo() {
            if (!generatedVideoData) {
                alert('No video to download');
                return;
            }

            // Create download link
            const link = document.createElement('a');
            link.href = generatedVideoData.videoUrl || generatedVideoData.video_url;
            link.download = `veo3-video-${Date.now()}.mp4`;
            link.target = '_blank';

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // Generate Another Video
        function generateAnother() {
            // Reset form
            currentStep = 1;
            generatedVideoData = null;

            // Hide video result
            document.getElementById('video-result').classList.remove('active');

            // Reset progress
            document.getElementById('progress-container').classList.remove('active');
            updateProgress(0, 'Ready to generate');

            // Show first step
            showStep(1);
            updateStepNavigation();

            // Scroll to top
            document.querySelector('.veo3-container').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'ArrowRight':
                        e.preventDefault();
                        nextStep();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        previousStep();
                        break;
                    case 'Enter':
                        if (currentStep === maxSteps) {
                            e.preventDefault();
                            generateVideo();
                        }
                        break;
                }
            }
        });

        // Auto-save form data to localStorage
        function saveFormData() {
            const formData = {
                apiKey: document.getElementById('apiKey').value,
                videoPrompt: document.getElementById('videoPrompt').value,
                videoQuality: document.getElementById('videoQuality').value,
                videoDuration: document.getElementById('videoDuration').value,
                videoStyle: document.getElementById('videoStyle').value,
                enhancePrompt: document.getElementById('enhancePrompt').checked
            };
            localStorage.setItem('veo3-form-data', JSON.stringify(formData));
        }

        function loadFormData() {
            try {
                const saved = localStorage.getItem('veo3-form-data');
                if (saved) {
                    const formData = JSON.parse(saved);
                    if (formData.apiKey) document.getElementById('apiKey').value = formData.apiKey;
                    if (formData.videoPrompt) document.getElementById('videoPrompt').value = formData.videoPrompt;
                    if (formData.videoQuality) document.getElementById('videoQuality').value = formData.videoQuality;
                    if (formData.videoDuration) document.getElementById('videoDuration').value = formData.videoDuration;
                    if (formData.videoStyle) document.getElementById('videoStyle').value = formData.videoStyle;
                    if (typeof formData.enhancePrompt === 'boolean') {
                        document.getElementById('enhancePrompt').checked = formData.enhancePrompt;
                    }
                }
            } catch (error) {
                console.warn('Failed to load saved form data:', error);
            }
        }

        // Auto-save on input changes
        document.addEventListener('input', saveFormData);
        document.addEventListener('change', saveFormData);

        // Load saved data on page load
        document.addEventListener('DOMContentLoaded', loadFormData);
    </script>
</x-filament-panels::page>
