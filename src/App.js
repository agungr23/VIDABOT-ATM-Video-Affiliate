import React, { useState, useEffect } from 'react';
import PhotoUpload from './components/PhotoUpload';
import PhotoAnalysis from './components/PhotoAnalysis';
import ModelGeneration from './components/ModelGeneration';
import Settings from './components/Settings';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [modelDescription, setModelDescription] = useState('');
  const [generatedScenes, setGeneratedScenes] = useState({
    scene1: null,
    scene2: null,
    scene3: null
  });
  const [apiKey, setApiKey] = useState('');
  const [videoApiKey, setVideoApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Load API keys from localStorage
    const savedApiKey = localStorage.getItem('gemini_api_key');
    const savedVideoApiKey = localStorage.getItem('video_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    if (savedVideoApiKey) {
      setVideoApiKey(savedVideoApiKey);
    }
  }, []);

  const handleImageUpload = (imageData) => {
    setUploadedImage(imageData);
    // Stay on step 1 since upload and analyze are now combined
  };

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setCurrentStep(2); // Go directly to step 2 (Model Generation)
  };

  const handleContinue = () => {
    setCurrentStep(3); // Go to step 3 (Video Generation)
  };

  const handleImageGeneration = (newImage, description) => {
    setGeneratedImage(newImage);
    if (description) {
      setModelDescription(description);
    }
  };





  const resetApp = () => {
    setCurrentStep(1);
    setUploadedImage(null);
    setAnalysisResult(null);
    setGeneratedImage(null);
    setModelDescription('');
  };

  return (
    <div className="app-layout bg-gradient-to-br from-tiktok-dark via-modern-gray-900 to-tiktok-black">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-tiktok-pink rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-float"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-shopee-orange rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-float"></div>
        <div className="absolute top-20 sm:top-40 left-1/2 w-40 h-40 sm:w-80 sm:h-80 bg-tiktok-cyan rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-float"></div>
        <div className="absolute top-1/2 right-1/4 w-30 h-30 sm:w-60 sm:h-60 bg-shopee-orange-light rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse-slow"></div>
      </div>

      {/* Header */}
      <header className="app-header relative z-10 backdrop-blur-md bg-tiktok-black/80 border-b border-tiktok-pink/20 shadow-lg">
        <div className="desktop-container px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-tiktok-pink to-shopee-orange rounded-xl flex items-center justify-center shadow-lg shadow-tiktok-pink/25">
                  <span className="text-lg sm:text-xl">🤖</span>
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-tiktok-cyan rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-tiktok-pink via-shopee-orange to-tiktok-cyan bg-clip-text text-transparent font-sans">
                  VIDABOT
                </h1>
                <p className="text-xs text-tiktok-cyan/80 hidden sm:block font-medium">AI Video Creator</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="bg-tiktok-dark/60 hover:bg-tiktok-dark/80 backdrop-blur-sm px-2 sm:px-3 py-2 rounded-xl text-tiktok-white transition-all duration-300 border border-tiktok-pink/30 hover:border-tiktok-pink/50 text-xs sm:text-sm shadow-lg hover:shadow-tiktok-pink/20"
              >
                <span className="hidden sm:inline">⚙️ Settings</span>
                <span className="sm:hidden">⚙️</span>
              </button>
              {currentStep > 1 && (
                <button
                  onClick={resetApp}
                  className="bg-shopee-red/20 hover:bg-shopee-red/30 backdrop-blur-sm px-2 sm:px-3 py-2 rounded-xl text-shopee-red transition-all duration-300 border border-shopee-red/40 hover:border-shopee-red/60 text-xs sm:text-sm shadow-lg hover:shadow-shopee-red/20"
                >
                  <span className="hidden sm:inline">🔄 Reset</span>
                  <span className="sm:hidden">🔄</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <Settings
          apiKey={apiKey}
          setApiKey={setApiKey}
          videoApiKey={videoApiKey}
          setVideoApiKey={setVideoApiKey}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Main Content */}
      <main className="app-main relative z-10 desktop-container px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Step Indicator */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className="relative">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                      currentStep >= step
                        ? 'bg-gradient-to-r from-tiktok-pink to-shopee-orange text-white shadow-lg shadow-tiktok-pink/30'
                        : 'bg-tiktok-dark/60 text-tiktok-white/60 backdrop-blur-sm border border-tiktok-pink/20'
                    }`}
                  >
                    {currentStep > step ? '✓' : step}
                  </div>
                  {currentStep === step && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-tiktok-pink to-tiktok-cyan animate-ping opacity-60"></div>
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 transition-all duration-300 ${
                      currentStep > step
                        ? 'bg-gradient-to-r from-tiktok-pink to-shopee-orange'
                        : 'bg-tiktok-pink/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-3 sm:mt-4">
            <div className="bg-tiktok-dark/70 backdrop-blur-md rounded-full px-4 py-2 border border-tiktok-pink/30 shadow-lg">
              <span className="text-xs sm:text-sm text-tiktok-white font-semibold">
                {currentStep === 1 && '📸 Upload & Analyze Photo'}
                {currentStep === 2 && '🎭 Generate Model Images'}
                {currentStep === 3 && '🎬 Generate Videos'}
              </span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <PhotoUpload onImageUpload={handleImageUpload} />
            {uploadedImage && (
              <PhotoAnalysis
                image={uploadedImage}
                apiKey={apiKey}
                onAnalysisComplete={handleAnalysisComplete}
              />
            )}
          </div>
        )}

        {currentStep === 2 && (
          <ModelGeneration
            originalImage={uploadedImage}
            analysisResult={analysisResult}
            apiKey={apiKey}
            videoApiKey={videoApiKey}
            setVideoApiKey={setVideoApiKey}
            onImageGeneration={handleImageGeneration}
            generatedImage={generatedImage}
          />
        )}

        {currentStep === 3 && (
          <div className="bg-gradient-to-br from-tiktok-white to-modern-gray-50 rounded-2xl shadow-2xl p-6 sm:p-8 border border-tiktok-pink/20">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-tiktok-pink to-shopee-orange bg-clip-text text-transparent mb-6 text-center">🎬 Video Generation Complete</h2>
            <div className="text-center">
              <p className="text-modern-gray-600 mb-6 text-sm sm:text-base">
                All videos have been generated successfully! You can download them from the previous step.
              </p>
              <button
                onClick={resetApp}
                className="bg-gradient-to-r from-tiktok-pink to-shopee-orange hover:from-tiktok-pink-light hover:to-shopee-orange-light text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg shadow-tiktok-pink/25 font-semibold text-sm sm:text-base transform hover:scale-105"
              >
                🔄 Start New Project
              </button>
            </div>
          </div>
        )}


      </main>
    </div>
  );
}

export default App;
