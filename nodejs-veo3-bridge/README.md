# VEO 3 Bridge Server

Node.js bridge server yang menggunakan official Google GenAI SDK untuk VEO 3 video generation.

## Fitur

✅ **Official Google GenAI SDK**: Menggunakan `@google/genai` package resmi dari Google
✅ **VEO 3 Support**: Model `veo-3.0-generate-preview` 
✅ **Reference Image**: Support untuk image-to-video generation
✅ **Streaming Response**: Real-time progress updates
✅ **Express API**: REST API endpoints untuk integrasi dengan React app
✅ **Error Handling**: Comprehensive error handling dan fallback

## Installation

```bash
cd nodejs-veo3-bridge
npm install
```

## Dependencies

- `@google/genai`: Official Google GenAI SDK
- `express`: Web server framework
- `cors`: Cross-origin resource sharing
- `multer`: File upload handling
- `node-fetch`: HTTP client

## Usage

### 1. Start Server

```bash
# Default port 3002
npm run server

# Custom port
PORT=3003 node server.js
```

### 2. API Endpoints

#### Health Check
```
GET /health
```

#### Video Generation (Streaming)
```
POST /generate-video
Content-Type: multipart/form-data

Fields:
- apiKey: Google GenAI API key
- prompt: Video generation prompt
- config: JSON configuration (optional)
- referenceImage: Image file (optional)
```

#### Simple Video Generation
```
POST /generate-simple
Content-Type: application/json

{
  "apiKey": "your-api-key",
  "prompt": "A cat walking in a garden"
}
```

### 3. Command Line Usage

```bash
# Basic generation
node veo3-bridge.js YOUR_API_KEY "A cat walking in a garden"

# With reference image
node veo3-bridge.js YOUR_API_KEY "A cat walking" /path/to/image.jpg
```

## Integration dengan React App

React service (`src/services/realVeo3Service.js`) sudah dikonfigurasi untuk:

1. **Auto-detect API Key**: Jika API key valid disediakan, akan menggunakan real VEO 3 generation
2. **Fallback to Mock**: Jika tidak ada API key atau error, akan fallback ke mock generation
3. **Streaming Support**: Menangani streaming response dari bridge server
4. **Error Handling**: Comprehensive error handling dengan fallback

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3002)
- `NODE_ENV`: Environment mode

### API Key Format

API key harus dalam format Google GenAI:
- Dimulai dengan `AIza`
- Minimal 20 karakter
- Valid Google GenAI API key

## Response Format

### Success Response
```json
{
  "success": true,
  "videoData": "base64-encoded-video",
  "mimeType": "video/mp4",
  "downloadUrl": "authenticated-download-url",
  "prompt": "original-prompt",
  "duration": 8,
  "model": "veo-3.0-generate-preview"
}
```

### Error Response
```json
{
  "success": false,
  "error": "error-message"
}
```

### Progress Updates (Streaming)
```json
{
  "type": "progress",
  "message": "Generation status message"
}
```

## Testing

### Test dengan Mock Data
```bash
npm test
```

### Test dengan Real API
```bash
node veo3-bridge.js YOUR_REAL_API_KEY "A beautiful sunset over mountains"
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :3002

# Kill the process
taskkill /PID <PID> /F

# Or use different port
PORT=3003 node server.js
```

### API Key Issues
- Pastikan API key valid dan aktif
- Check quota dan billing di Google Cloud Console
- Pastikan VEO 3 API sudah enabled

### CORS Issues
Server sudah dikonfigurasi dengan CORS untuk development. Untuk production, sesuaikan CORS settings.

## Architecture

```
React App (port 3000)
    ↓ HTTP Request
Express Server (port 3002)
    ↓ Google GenAI SDK
Google VEO 3 API
    ↓ Video Response
Express Server
    ↓ Streaming Response
React App
```

## Based on Reference

Implementasi ini berdasarkan referensi working code dari:
`c:\SC\VIDABOT - ATM Video Affiliate/nodejs-veo3/`

Yang menggunakan:
- Official Google GenAI SDK
- Exact same API calls dan parameters
- Proven working implementation
- Same error handling patterns
