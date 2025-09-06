// VEO3 Video Generation Service using Node.js Bridge or Vercel API
class RealVEO3Service {
  constructor() {
    // Determine bridge URL based on environment
    const isProduction = process.env.NODE_ENV === 'production' || 
                        window.location.hostname !== 'localhost';
    
    if (isProduction) {
      // Use Vercel API routes in production
      this.bridgeUrl = window.location.origin;
      this.useVercelAPI = true;
      console.log('🌐 Using Vercel API Routes for production');
    } else {
      // Use local bridge server in development
      this.bridgeUrl = process.env.REACT_APP_BRIDGE_URL || 'http://localhost:3005';
      this.useVercelAPI = false;
      console.log('🏠 Using local bridge server for development');
    }
    
    console.log('🔗 Bridge URL configured:', this.bridgeUrl);
  }

  /**
   * Convert File to ArrayBuffer
   */
  async fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Validate API key format
   */
  validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }

    // Basic validation for Google GenAI API key format
    return apiKey.trim().length > 20 && apiKey.startsWith('AIza');
  }

  /**
   * Test API key by checking bridge server and API key validity
   */
  async testApiKey(apiKey) {
    try {
      console.log('🔍 Testing Video API Key with bridge server...');

      // First check if bridge server is available
      const bridgeAvailable = await this.checkBridgeServer();
      console.log('🔍 Bridge server available:', bridgeAvailable);

      if (!bridgeAvailable) {
        console.error('❌ Bridge server not available at:', this.bridgeUrl);
        return false;
      }

      // Test API key with bridge server
      console.log('🔍 Testing API key with bridge server...');
      
      // Use correct endpoint path based on environment
      const isProduction = process.env.NODE_ENV === 'production' || 
                          window.location.hostname !== 'localhost';
      const testEndpoint = isProduction ? 
        `${this.bridgeUrl}/api/test-api-key` : 
        `${this.bridgeUrl}/test-api-key`;
      
      console.log('📡 Testing with endpoint:', testEndpoint);
      
      const testResponse = await fetch(testEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiKey })
      });

      if (!testResponse.ok) {
        console.error('❌ API key test failed:', testResponse.status, testResponse.statusText);
        return false;
      }

      const testResult = await testResponse.json();
      console.log('✅ API key test result:', testResult);

      return testResult.success === true;

    } catch (error) {
      console.error('❌ API key test error:', error);
      return false;
    }
  }

  /**
   * Generate video using VEO 3 API via Node.js bridge
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} Generation result
   */
  async generate(params) {
    console.log('🎬 VEO3: Starting video generation with params:', params);

    try {
      // Check if bridge server is available
      const bridgeAvailable = await this.checkBridgeServer();
      console.log('🔍 Bridge available:', bridgeAvailable);
      console.log('🔑 API Key present:', !!params.apiKey);
      console.log('🔑 API Key value:', params.apiKey ? `${params.apiKey.substring(0, 10)}...` : 'null');
      console.log('🔑 API Key not test-key:', params.apiKey !== 'test-key');

      if (bridgeAvailable && params.apiKey && params.apiKey !== 'test-key' && params.apiKey.trim().length > 0) {
        console.log('🚀 VEO3: Using real generation via Node.js bridge');
        return await this.realGenerate(params);
      } else {
        console.log('⚠️ VEO3: Bridge server not available, using mock generation');
        console.log('   - Bridge available:', bridgeAvailable);
        console.log('   - Has API key:', !!params.apiKey);
        console.log('   - API key not test-key:', params.apiKey !== 'test-key');
        return await this.mockGenerate(params);
      }

    } catch (error) {
      console.error('❌ VEO3 Generation Error:', error);
      console.log('🔄 VEO3: Falling back to mock generation');
      return await this.mockGenerate(params);
    }
  }

  /**
   * Check if bridge server is available
   */
  async checkBridgeServer() {
    try {
      // Check if running in production (Vercel, Netlify, etc.)
      const isProduction = process.env.NODE_ENV === 'production' || 
                          window.location.hostname !== 'localhost';
      
      if (isProduction) {
        console.log('🌐 Running in production - using Vercel API routes');
        // Check Vercel API debug endpoint instead of health
        const response = await fetch(`${this.bridgeUrl}/api/debug`, {
          method: 'GET'
        });
        console.log('✅ Vercel API debug check:', response.status, response.ok);
        return response.ok;
      }

      console.log('🔍 Checking bridge server at:', `${this.bridgeUrl}/health`);

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.bridgeUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('✅ Bridge server response:', response.status, response.ok);
      return response.ok;
    } catch (error) {
      console.log('🔌 Bridge server not available:', error.message);
      return false;
    }
  }

  /**
   * Mock video generation for testing
   */
  async mockGenerate(params) {
    const isProduction = process.env.NODE_ENV === 'production' || 
                        window.location.hostname !== 'localhost';
    
    if (isProduction) {
      console.log('🌐 VEO3: Using mock generation in production environment');
    } else {
      console.log('🎭 VEO3: Using mock generation for testing');
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create a mock video blob (1x1 pixel MP4)
    const mockVideoData = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMWF2YzEAAAAIZnJlZQAAAr1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2NCByMzEwOCBhMGNjZGY0IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyMSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAABWWWIhAAz//727L4FNf2f0JcRLMXaSnA=';

    // Convert to blob
    const response = await fetch(mockVideoData);
    const videoBlob = await response.blob();
    const videoUrl = URL.createObjectURL(videoBlob);

    const description = isProduction 
      ? 'Demo video - Video generation memerlukan backend server yang tidak tersedia di production'
      : 'Mock video generated for testing';

    return {
      success: true,
      job_id: 'mock_job_' + Date.now(),
      status: 'completed',
      video_file: mockVideoData,
      video_url: videoUrl,
      videoUrl: videoUrl,
      video_blob: videoBlob,
      thumbnail_url: 'https://via.placeholder.com/640x360/4F46E5/FFFFFF?text=Demo+Video',
      duration: 8,
      created_at: new Date().toISOString(),
      config: params.config,
      prompt: params.prompt,
      enhanced_prompt: isProduction ? `Demo Video: ${params.prompt}` : `Mock VEO 3 Generated: ${params.prompt}`,
      used_imagen: !params.referenceImage,
      description: description,
      model: isProduction ? 'demo-mode' : 'veo-3.0-generate-preview (mock)'
    };
  }

  /**
   * Real VEO 3 generation using Node.js bridge or Vercel API
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} Generation result
   */
  async realGenerate(params) {
    const isProduction = process.env.NODE_ENV === 'production' || 
                        window.location.hostname !== 'localhost';
    
    if (isProduction) {
      return await this.generateWithVercelAPI(params);
    } else {
      return await this.generateWithBridge(params);
    }
  }

  /**
   * Generate video using Vercel API Routes
   */
  async generateWithVercelAPI(params) {
    try {
      console.log('🌐 Using Vercel API Routes for video generation');
      
      // Prepare request data for Vercel API
      const requestData = {
        apiKey: params.apiKey,
        prompt: params.prompt,
        config: params.config || {},
        referenceImage: null
      };

      // Handle reference image if provided
      if (params.referenceImage) {
        console.log('🖼️ Processing reference image for Vercel API...');
        
        if (typeof params.referenceImage === 'string' && params.referenceImage.startsWith('data:')) {
          requestData.referenceImage = params.referenceImage;
        } else if (params.referenceImage.file instanceof File) {
          // Convert File to base64 for API transmission
          const base64 = await this.fileToBase64(params.referenceImage.file);
          requestData.referenceImage = base64;
        }
      }

      console.log('📡 Sending request to Vercel API...');
      
      // Send request to Vercel API
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Vercel API error: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = null;
      let buffer = '';

      console.log('🔄 Reading Vercel API response stream...');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          try {
            const data = JSON.parse(trimmedLine);
            
            if (data.type === 'progress') {
              console.log('📊 Vercel API Progress:', data.message);
            } else if (data.type === 'result' && data.success) {
              console.log('🎯 Vercel API Result received!');
              result = data;
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          } catch (parseError) {
            console.warn('⚠️ Failed to parse Vercel API response:', parseError.message);
          }
        }
      }

      if (!result) {
        throw new Error('No result received from Vercel API');
      }

      // Convert base64 video data to blob URL
      const videoBlob = this.base64ToBlob(result.videoData, result.mimeType);
      const videoUrl = URL.createObjectURL(videoBlob);

      console.log('✅ Vercel API generation completed successfully');

      return {
        success: true,
        job_id: 'vercel_job_' + Date.now(),
        status: 'completed',
        video_file: result.downloadUrl,
        video_url: videoUrl,
        videoUrl: videoUrl,
        video_blob: videoBlob,
        thumbnail_url: 'https://via.placeholder.com/640x360/4F46E5/FFFFFF?text=Vercel+API+Video',
        duration: result.duration || 8,
        created_at: new Date().toISOString(),
        config: params.config,
        prompt: params.prompt,
        enhanced_prompt: `Vercel API Generated: ${params.prompt}`,
        used_imagen: !params.referenceImage,
        description: result.description || 'Video generated using Vercel API Routes',
        model: result.model || 'veo-3.0-vercel-api'
      };

    } catch (error) {
      console.error('❌ Vercel API generation error:', error);
      throw error;
    }
  }

  /**
   * Convert File to base64 string
   */
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
  /**
   * Generate video using local Node.js bridge
   */
  async generateWithBridge(params) {
    const BRIDGE_URL = 'http://localhost:3005';

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('apiKey', params.apiKey);
      formData.append('prompt', params.prompt);
      formData.append('config', JSON.stringify(params.config || {}));

      // Add reference image if provided
      if (params.referenceImage) {
        console.log('🖼️ BRIDGE: Processing reference image for Node.js bridge...');
        console.log('📋 Reference image type:', typeof params.referenceImage);
        console.log('📋 Reference image structure:', Object.keys(params.referenceImage));

        // Convert base64 to blob if needed
        if (typeof params.referenceImage === 'string' && params.referenceImage.startsWith('data:')) {
          console.log('🔄 Converting base64 string to blob...');
          const response = await fetch(params.referenceImage);
          const blob = await response.blob();
          console.log('✅ Base64 converted to blob:', { size: blob.size, type: blob.type });
          formData.append('referenceImage', blob, 'reference.jpg');
        } else if (params.referenceImage instanceof File) {
          console.log('📁 Using File object directly:', {
            name: params.referenceImage.name,
            size: params.referenceImage.size,
            type: params.referenceImage.type
          });
          formData.append('referenceImage', params.referenceImage);
        } else if (params.referenceImage.file instanceof File) {
          console.log('📁 Using nested File object:', {
            name: params.referenceImage.file.name,
            size: params.referenceImage.file.size,
            type: params.referenceImage.file.type
          });
          formData.append('referenceImage', params.referenceImage.file, 'reference.png');
        } else {
          console.warn('⚠️ Unknown reference image format:', params.referenceImage);
        }

        console.log('✅ Reference image added to FormData');
      } else {
        console.log('📝 No reference image provided to bridge');
      }

      console.log('📡 VEO3: Sending request to Node.js bridge...', {
        hasReferenceImage: !!params.referenceImage,
        formDataKeys: Array.from(formData.keys())
      });

      // Send request to Node.js bridge
      const response = await fetch(`${BRIDGE_URL}/generate-video`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        // Try to get error details from response
        try {
          const errorData = await response.json();
          console.error('❌ Bridge server error response:', errorData);
          throw new Error(errorData.error || `Bridge server error: ${response.statusText}`);
        } catch (parseError) {
          throw new Error(`Bridge server error: ${response.statusText}`);
        }
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = null;
      let buffer = ''; // Buffer untuk accumulate partial JSON

      console.log('🔄 Starting to read VEO3 response stream...');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        buffer += chunk;

        console.log(`📦 Received chunk (${chunk.length} chars), buffer size: ${buffer.length}`);

        // Split by newlines and process complete lines
        const lines = buffer.split('\n');
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          console.log(`🔍 Processing line (${trimmedLine.length} chars):`,
            trimmedLine.length > 100 ? trimmedLine.substring(0, 100) + '...' : trimmedLine);

          try {
            const data = JSON.parse(trimmedLine);
            console.log('✅ Successfully parsed JSON:', { type: data.type, success: data.success });

            if (data.type === 'progress') {
              console.log('📊 VEO3 Progress:', data.message);
            } else if (data.type === 'result' && data.success) {
              console.log('🎯 VEO3 Result received! VideoData length:', data.videoData?.length || 'N/A');
              result = data;
            } else if (data.type === 'error') {
              console.error('❌ VEO3 Error from server:', data.error);
              throw new Error(data.error);
            }
          } catch (parseError) {
            console.warn('⚠️ Failed to parse response line:', {
              error: parseError.message,
              lineLength: trimmedLine.length,
              linePreview: trimmedLine.substring(0, 200) + (trimmedLine.length > 200 ? '...' : '')
            });
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        console.log('🔍 Processing final buffer:', buffer.length, 'chars');
        try {
          const data = JSON.parse(buffer.trim());
          console.log('✅ Successfully parsed final JSON:', { type: data.type, success: data.success });
          if (data.type === 'result' && data.success) {
            console.log('🎯 VEO3 Final Result! VideoData length:', data.videoData?.length || 'N/A');
            result = data;
          }
        } catch (parseError) {
          console.warn('⚠️ Failed to parse final buffer:', parseError.message);
        }
      }

      if (!result) {
        throw new Error('No result received from bridge server');
      }

      // Convert base64 video data to blob URL
      const videoBlob = this.base64ToBlob(result.videoData, result.mimeType);
      const videoUrl = URL.createObjectURL(videoBlob);

      console.log('✅ VEO3: Real generation completed successfully');

      return {
        success: true,
        job_id: 'real_job_' + Date.now(),
        status: 'completed',
        video_file: result.downloadUrl,
        video_url: videoUrl,
        videoUrl: videoUrl,
        video_blob: videoBlob,
        thumbnail_url: 'https://via.placeholder.com/640x360/4F46E5/FFFFFF?text=VEO3+Real+Video',
        duration: result.duration || 8,
        created_at: new Date().toISOString(),
        config: params.config,
        prompt: params.prompt,
        enhanced_prompt: `VEO 3 Generated: ${params.prompt}`,
        used_imagen: !params.referenceImage,
        description: `Video generated using real VEO 3 API${!params.referenceImage ? ' with Imagen-generated image' : ' with reference image'}`,
        model: result.model || 'veo-3.0-generate-preview'
      };

    } catch (error) {
      console.error('❌ VEO3 Real Generation Error:', error);
      throw error;
    }
  }

  /**
   * Convert base64 string to Blob
   * @param {string} base64 - Base64 encoded data
   * @param {string} mimeType - MIME type
   * @returns {Blob} Blob object
   */
  base64ToBlob(base64, mimeType) {
    try {
      console.log('🔄 Converting base64 to blob:', { 
        base64Length: base64.length, 
        mimeType: mimeType 
      });
      
      // Remove data URL prefix if present
      const cleanBase64 = base64.replace(/^data:.*,/, '');
      
      const byteCharacters = atob(cleanBase64);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType || 'video/mp4' });
      
      console.log('✅ Blob created successfully:', {
        size: blob.size,
        type: blob.type
      });
      
      return blob;
    } catch (error) {
      console.error('❌ Error converting base64 to blob:', error);
      // Fallback: create empty blob
      return new Blob([], { type: mimeType || 'video/mp4' });
    }
  }
}

// Export singleton instance
const realVeo3Service = new RealVEO3Service();
export default realVeo3Service;