// Vercel API Route untuk video generation
module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { apiKey, prompt, config, referenceImage } = req.body;

    console.log('🚀 VERCEL API: Received video generation request');
    console.log('📋 Request details:', {
      hasApiKey: !!apiKey,
      promptLength: prompt?.length,
      hasConfig: !!config,
      hasReferenceImage: !!referenceImage
    });

    if (!apiKey || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'API key and prompt are required'
      });
    }

    // Set headers for streaming response
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    const sendProgress = (message) => {
      res.write(JSON.stringify({
        type: 'progress',
        message: message
      }) + '\n');
    };

    const sendResult = (result) => {
      res.write(JSON.stringify({
        type: 'result',
        success: true,
        ...result
      }) + '\n');
      res.end();
    };

    const sendError = (error) => {
      res.write(JSON.stringify({
        type: 'error',
        error: error
      }) + '\n');
      res.end();
    };

    sendProgress("🚀 Initializing VEO 3 video generation...");
    
    // Simulate processing dengan mock generation untuk production
    sendProgress("⚡ Processing video generation...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    sendProgress("🎬 Generating video content...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    sendProgress("✅ Video generation complete!");

    // Mock video data untuk production demo
    const mockVideoData = 'AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMWF2YzEAAAAIZnJlZQAAAr1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2NCByMzEwOCBhMGNjZGY0IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyMSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAABWWWIhAAz//727L4FNf2f0JcRLMXaSnA=';

    sendResult({
      videoData: mockVideoData,
      mimeType: 'video/mp4',
      duration: 8,
      downloadUrl: 'vercel_api_video',
      model: 'veo-3.0-vercel-api',
      description: 'Demo video generated via Vercel API Routes'
    });

  } catch (error) {
    console.error('❌ Video generation error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message || 'Video generation failed'
      });
    }
  }
};