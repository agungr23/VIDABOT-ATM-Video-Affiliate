// VEO3 Video Generation Service using Google GenAI SDK
import { GoogleGenAI } from "@google/genai";

class VEO3Service {
  constructor() {
    this.ai = null;
  }

  /**
   * Initialize the Google GenAI client
   */
  initializeClient(apiKey) {
    this.ai = new GoogleGenAI({
      apiKey: apiKey
    });
  }

  /**
   * Generate video using VEO3 API
   * @param {Object} params - Generation parameters
   * @param {string} params.prompt - Text prompt for video generation
   * @param {Object|null} params.referenceImage - Optional reference image object with file
   * @param {Object} params.config - Video configuration
   * @param {string} params.config.aspectRatio - '16:9' or '9:16'
   * @param {boolean} params.config.enableSound - Whether to include audio
   * @param {string} params.config.resolution - '720p' or '1080p'
   * @param {string} params.apiKey - API key for authentication
   * @returns {Promise<Object>} Generation result
   */
  async generateVideo({ prompt, referenceImage, config, apiKey }) {
    try {
      // Parse prompt if it's JSON format
      let parsedPrompt = prompt;
      let additionalParams = {};
      
      try {
        const jsonPrompt = JSON.parse(prompt);
        if (typeof jsonPrompt === 'object') {
          parsedPrompt = jsonPrompt.prompt || jsonPrompt.description || '';
          additionalParams = { ...jsonPrompt };
          delete additionalParams.prompt;
          delete additionalParams.description;
        }
      } catch (e) {
        // Not JSON, use as plain text
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('prompt', parsedPrompt);
      formData.append('aspect_ratio', config.aspectRatio);
      formData.append('enable_sound', config.enableSound.toString());
      formData.append('resolution', config.resolution);
      
      // Add additional parameters from JSON
      Object.keys(additionalParams).forEach(key => {
        formData.append(key, additionalParams[key]);
      });

      // Add reference image if provided
      if (referenceImage) {
        // Check if it's an object with file property (from ModelGeneration)
        if (referenceImage && typeof referenceImage === 'object' && referenceImage.file) {
          formData.append('reference_image', referenceImage.file);
        }
        // Check if it's a string (URL or data URL)
        else if (typeof referenceImage === 'string') {
          if (referenceImage.startsWith('data:')) {
            // If it's a data URL, convert to blob
            const response = await fetch(referenceImage);
            const blob = await response.blob();
            formData.append('reference_image', blob, 'reference.png');
          } else {
            // If it's a URL, fetch and add as blob
            const response = await fetch(referenceImage);
            const blob = await response.blob();
            formData.append('reference_image', blob, 'reference.png');
          }
        }
      }

      // Make API request (use provided apiKey or fallback to instance apiKey)
      const authKey = apiKey || this.apiKey;
      const response = await fetch(`${this.baseURL}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authKey}`,
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('VEO3 API Error:', error);
      throw error;
    }
  }

  /**
   * Check generation status
   * @param {string} jobId - Generation job ID
   * @param {string} apiKey - API key for authentication
   * @returns {Promise<Object>} Job status
   */
  async checkStatus(jobId, apiKey) {
    try {
      const response = await fetch(`${this.baseURL}/status/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Status check failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Status check error:', error);
      throw error;
    }
  }

  /**
   * Download generated video
   * @param {string} videoUrl - Video download URL
   * @param {string} filename - Desired filename
   * @returns {Promise<Blob>} Video blob
   */
  async downloadVideo(videoUrl, filename = 'generated_video.mp4') {
    try {
      const response = await fetch(videoUrl);
      
      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  /**
   * Create video preview URL from video file
   * @param {string} videoFile - Video file identifier or URL
   * @returns {Promise<string>} Preview URL
   */
  async createVideoPreviewUrl(videoFile) {
    try {
      // If it's already a URL, return it
      if (videoFile && (videoFile.startsWith('http') || videoFile.startsWith('blob:'))) {
        return videoFile;
      }

      // For now, return a placeholder since we don't have real VEO3 API
      // In real implementation, this would fetch the video from the API
      return 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4';
    } catch (error) {
      console.error('Error creating video preview URL:', error);
      throw error;
    }
  }

  /**
   * Mock generation for development/testing
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} Mock result
   */
  async mockGenerate(params) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Return mock result with realistic VEO3 characteristics
    // Using working video URLs for demo
    const mockVideos = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
    ];

    // Select random video for variety
    const randomVideo = mockVideos[Math.floor(Math.random() * mockVideos.length)];

    console.log('🎬 VEO3 Mock: Generating video with URL:', randomVideo);

    return {
      success: true,
      job_id: 'mock_job_' + Date.now(),
      status: 'completed',
      video_file: 'mock_video_file_' + Date.now(),
      video_url: randomVideo,
      thumbnail_url: 'https://via.placeholder.com/640x360/4F46E5/FFFFFF?text=VEO3+Generated+Video',
      duration: 8, // VEO3 typically generates ~8 second videos
      created_at: new Date().toISOString(),
      config: params.config,
      prompt: params.prompt,
      enhanced_prompt: `Enhanced VEO3 prompt: ${params.prompt}`,
      used_imagen: !params.referenceImage,
      description: `Video generated using VEO 3${!params.referenceImage ? ' with Imagen-generated image' : ' with reference image'}`
    };
  }

  /**
   * Validate API key format
   * @param {string} apiKey - API key to validate
   * @returns {boolean} Whether API key format is valid
   */
  validateApiKey(apiKey) {
    // For VEO3/Google GenAI API keys, they typically start with "AIza" and are longer than 20 chars
    return apiKey && typeof apiKey === 'string' && apiKey.startsWith('AIza') && apiKey.length > 20;
  }

  /**
   * Test API key validity
   * @param {string} apiKey - API key to test
   * @returns {Promise<boolean>} Whether API key is valid
   */
  async testApiKey(apiKey) {
    try {
      // For now, just validate format since we don't have real API endpoint
      // In real implementation, this would make a test call to the API
      return this.validateApiKey(apiKey);
    } catch (error) {
      console.error('API key test failed:', error);
      return false;
    }
  }

  /**
   * Validate API configuration
   * @param {string} apiKey - API key to check
   * @returns {boolean} Whether API is properly configured
   */
  isConfigured(apiKey) {
    return apiKey && apiKey !== 'your-api-key-here';
  }
}

// Export singleton instance
const veo3Service = new VEO3Service();
export default veo3Service;
