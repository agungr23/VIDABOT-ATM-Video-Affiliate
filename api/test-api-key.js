// Vercel API Route untuk test API key
const handler = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  console.log('🔍 API test-api-key called with method:', req.method);
  
  if (req.method !== 'POST') {
    console.log('❌ Wrong method:', req.method);
    return res.status(405).json({ 
      error: 'Method not allowed',
      method: req.method,
      message: 'Use POST method',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const { apiKey } = req.body;
    
    console.log('🔍 Testing API Key:', { hasApiKey: !!apiKey, bodyKeys: Object.keys(req.body || {}) });
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }

    // Test dengan Gemini API
    console.log('📡 Making request to Gemini API...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Test connection"
            }]
          }]
        })
      }
    );

    console.log('✅ Gemini API Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API key test successful');
      res.status(200).json({
        success: true,
        message: 'API key is valid',
        timestamp: new Date().toISOString()
      });
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ API key test failed:', response.status, errorData);
      res.status(400).json({
        success: false,
        error: errorData.error?.message || 'Invalid API key',
        status: response.status
      });
    }

  } catch (error) {
    console.error('❌ API key test failed:', error);
    res.status(500).json({
      success: false,
      error: 'API key test failed: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
};

export default handler;