// Vercel API Route untuk health check
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({
    status: 'ok',
    service: 'VIDABOT VEO3 API (Vercel)',
    timestamp: new Date().toISOString(),
    environment: 'production'
  });
}