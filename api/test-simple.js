const handler = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  console.log('🔍 test-simple called with method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      method: req.method,
      message: 'Only POST method allowed'
    });
  }

  // Simple response without external API call
  const { apiKey } = req.body || {};
  
  return res.status(200).json({
    success: true,
    message: 'POST method working correctly',
    receivedApiKey: !!apiKey,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};

export default handler;