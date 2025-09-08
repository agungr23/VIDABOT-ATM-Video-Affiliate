// Test VEO 3 API access
const handler = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }

    console.log('🔍 Testing VEO 3 API access...');
    
    // Import Google GenAI SDK
    const { GoogleGenAI } = await import('@google/genai');
    
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Test 1: Check if we can initialize the client
    console.log('✅ GoogleGenAI client initialized');
    
    // Test 2: Try to access VEO 3 model
    try {
      const testParams = {
        model: 'veo-3.0-generate-preview',
        prompt: 'Test video generation access',
        config: {
          numberOfVideos: 1,
        },
      };
      
      console.log('🎬 Testing VEO 3 model access...');
      const operation = await ai.models.generateVideos(testParams);
      
      console.log('✅ VEO 3 API call successful');
      
      return res.status(200).json({
        success: true,
        hasVeo3Access: true,
        operationName: operation.name,
        message: 'VEO 3 API is accessible with your API key',
        timestamp: new Date().toISOString()
      });
      
    } catch (veoError) {
      console.log('❌ VEO 3 access error:', veoError.message);
      
      // Check if it's permission issue
      if (veoError.message.includes('not found') || veoError.message.includes('permission')) {
        return res.status(200).json({
          success: false,
          hasVeo3Access: false,
          error: veoError.message,
          suggestion: 'VEO 3 requires special access from Google. Your API key may not have VEO 3 permissions.',
          alternativeSolution: 'We can implement using Gemini AI for video content generation instead.',
          timestamp: new Date().toISOString()
        });
      }
      
      throw veoError;
    }

  } catch (error) {
    console.error('❌ Test error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
};

export default handler;