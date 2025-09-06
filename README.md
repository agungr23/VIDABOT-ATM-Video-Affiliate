# VIDABOT Photo Analyzer

A modern, responsive web application built with React, JavaScript, and Tailwind CSS for analyzing photos and generating new model images using Google's Gemini AI.

## Features

### 🖼️ Photo Upload & Preview
- Drag and drop photo upload
- Image preview before processing
- Support for JPG, PNG, GIF formats
- Mobile-friendly interface

### 🔍 AI-Powered Photo Analysis
- Automatic product identification
- Model/person description
- Background/setting analysis
- Results in Indonesian language

### ✨ AI Model Generation
- Generate new model images using Gemini AI
- Maintain same product and background context
- Custom model descriptions in Indonesian
- Smart prompt engineering for better results
- Fallback system for reliability
- Download generated images

### ⚙️ Settings & Configuration
- Gemini API key management
- API key validation and testing
- Secure local storage
- Easy setup process

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager
- Google Gemini API key

### Installation

1. **Clone or download the project**
   ```bash
   cd "VIDABOT - ATM Video Affiliate"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Getting Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the generated API key
5. In the app, click "Settings" and paste your API key
6. Click "Test API Key" to verify it works
7. Click "Save" to store it locally

**Note:** For image generation features, ensure your API key has access to:
- Gemini 1.5 Flash (for image analysis)
- Image generation capabilities (if available in your region)

**API Limitations:**
- Free tier has usage quotas
- Image generation may not be available in all regions
- Processing time varies based on image complexity

## How to Use

### Step 1: Upload Photo
- Click "Browse Files" or drag and drop an image
- Preview your photo and click "Continue with This Photo"

### Step 2: Analyze Photo
- Click "Analyze Photo" to process with AI
- Wait for the analysis to complete
- Review the identified product, model, and background

### Step 3: Review Results
- Check the analysis results
- Verify the identified elements
- Click "Lanjut" to proceed

### Step 4: Generate New Model
- Describe the new model you want in Indonesian
- Use specific details (age, appearance, clothing, expression)
- Click "Generate New Model"
- Wait for AI processing (may take 30-60 seconds)
- View and download the result
- Try "Generate Again" if not satisfied

**Tips for better results:**
- Be specific about physical features
- Mention age, gender, and ethnicity
- Describe clothing style and colors
- Include facial expression details

## Technology Stack

- **Frontend**: React 18, JavaScript ES6+
- **Styling**: Tailwind CSS 3.3
- **HTTP Client**: Axios
- **AI Service**: Google Gemini 1.5 Flash
- **Build Tool**: Create React App

## Project Structure

```
src/
├── components/
│   ├── PhotoUpload.js      # Photo upload component
│   ├── PhotoAnalysis.js    # Analysis interface
│   ├── ModelGeneration.js  # Model generation interface
│   └── Settings.js         # Settings panel
├── services/
│   └── geminiService.js    # Gemini API integration
├── App.js                  # Main application component
├── index.js               # Application entry point
└── index.css              # Global styles with Tailwind
```

## Features in Detail

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interface
- Modern UI with smooth animations

### Error Handling
- Comprehensive error messages
- API timeout handling
- Network error recovery
- User-friendly error displays

### Security
- API keys stored locally only
- No server-side data storage
- Secure API communication
- Input validation and sanitization

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Customization

You can customize the application by:
- Modifying Tailwind CSS classes for styling
- Updating the Gemini prompts in `geminiService.js`
- Adding new components in the `components/` directory
- Extending the analysis results format

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify the API key is correct
   - Check if Gemini API is enabled in your Google Cloud project
   - Ensure you have sufficient quota

2. **Image Upload Issues**
   - Check file size (max 10MB recommended)
   - Ensure file format is supported (JPG, PNG, GIF)
   - Try a different image

3. **Analysis Fails**
   - Check internet connection
   - Verify API key is set and valid
   - Try with a clearer image

4. **Image Generation Issues**
   - Ensure you have completed photo analysis first
   - Check that your API key has image generation permissions
   - Try more specific model descriptions
   - Be patient - generation can take 30-60 seconds
   - If generation fails, try the "Generate Again" button

5. **Generated Image Quality**
   - Results may vary depending on the original image
   - More detailed descriptions usually yield better results
   - The AI may not perfectly preserve all original elements
   - This is a beta feature and results will improve over time

## Future Enhancements

- [ ] Actual image generation API integration
- [ ] Multiple language support
- [ ] Batch processing
- [ ] Image editing tools
- [ ] Export to various formats
- [ ] Cloud storage integration

## License

This project is for educational and demonstration purposes.

## Support

For issues and questions, please check the troubleshooting section or create an issue in the project repository.
