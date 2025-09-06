import React, { useState } from 'react';
import { analyzeImageWithGemini } from '../services/geminiService';

const PhotoAnalysis = ({ image, apiKey, onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!apiKey) {
      setError('Please set your Gemini API key in settings first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeImageWithGemini(image, apiKey);
      onAnalysisComplete(result);

      // Auto-scroll to next section after analysis completes
      setTimeout(() => {
        window.scrollTo({
          top: window.innerHeight * 1.5,
          behavior: 'smooth'
        });
      }, 500);
    } catch (err) {
      setError(err.message || 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-tiktok-white to-modern-gray-50 rounded-2xl shadow-2xl p-6 sm:p-8 border border-tiktok-pink/20">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-tiktok-cyan to-shopee-orange rounded-2xl mb-4 shadow-lg shadow-tiktok-cyan/30 animate-float">
          <span className="text-2xl">🔍</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-tiktok-pink via-shopee-orange to-tiktok-cyan bg-clip-text text-transparent mb-2 font-sans">Analyze Photo</h2>
        <p className="text-modern-gray-600 text-sm sm:text-base font-medium">Click analyze to identify the product, model, and background</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-modern-gray-800">📸 Uploaded Photo</h3>
          <div className="relative group">
            <img
              src={image}
              alt="Uploaded"
              className="w-full h-auto max-h-80 sm:max-h-96 object-contain rounded-xl shadow-lg bg-modern-gray-50 border border-tiktok-pink/20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-tiktok-black/20 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          {error && (
            <div className="bg-gradient-to-r from-shopee-red/10 to-red-50 border border-shopee-red/30 rounded-xl p-4 mb-4 shadow-lg">
              <div className="flex">
                <div className="text-shopee-red text-lg">⚠️</div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-shopee-red">Error</h3>
                  <p className="text-sm text-shopee-red/80 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !apiKey}
              className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all duration-300 transform ${
                isAnalyzing || !apiKey
                  ? 'bg-modern-gray-300 text-modern-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-tiktok-cyan to-shopee-orange hover:from-tiktok-cyan-light hover:to-shopee-orange-light text-white hover:shadow-lg shadow-tiktok-cyan/30 hover:scale-105'
              }`}
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                '🔍 Analyze Photo'
              )}
            </button>

            {!apiKey && (
              <p className="text-sm text-shopee-red font-medium mt-3">
                Please configure your Gemini API key in settings
              </p>
            )}
          </div>

          {isAnalyzing && (
            <div className="mt-6 bg-gradient-to-r from-tiktok-cyan/10 to-shopee-orange/10 rounded-xl p-4 border border-tiktok-cyan/20 shadow-lg">
              <div className="text-center">
                <div className="text-tiktok-cyan font-semibold mb-2">🤖 AI is analyzing your photo...</div>
                <div className="text-sm text-modern-gray-600 font-medium">
                  This may take a few seconds
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoAnalysis;
