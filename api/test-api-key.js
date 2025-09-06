// Vercel API Route untuk test API key
export default async function handler(req, res) {
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

    // Test dengan Gemini API
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

    if (response.ok) {
      res.status(200).json({
        success: true,
        message: 'API key is valid'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid API key'
      });
    }

  } catch (error) {
    console.error('API key test failed:', error);
    res.status(500).json({
      success: false,
      error: 'API key test failed'
    });
  }
}