import React, { useState } from 'react';
import { testGeminiApiKey } from '../services/geminiService';
import VideoAPITutorial from './VideoAPITutorial';

const Settings = ({ apiKey, setApiKey, videoApiKey, setVideoApiKey, onClose }) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showVideoTutorial, setShowVideoTutorial] = useState(false);

  const handleSave = () => {
    setApiKey(tempApiKey);
    localStorage.setItem('gemini_api_key', tempApiKey);
    setTestResult(null);
    onClose();
  };

  const handleTest = async () => {
    if (!tempApiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an API key first' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      await testGeminiApiKey(tempApiKey);
      setTestResult({ success: true, message: 'API key is valid and working!' });
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message || 'API key test failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    setTempApiKey('');
    setApiKey('');
    localStorage.removeItem('gemini_api_key');
    setTestResult(null);
  };

  const handleCreateVideoAPI = () => {
    setShowVideoTutorial(true);
  };

  return (
    <div className="fixed inset-0 bg-tiktok-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-tiktok-white to-modern-gray-50 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-tiktok-pink/20">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-tiktok-pink to-shopee-orange rounded-xl flex items-center justify-center">
                <span className="text-lg">⚙️</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-tiktok-pink to-shopee-orange bg-clip-text text-transparent">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="text-modern-gray-400 hover:text-tiktok-pink text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* API Key Section */}
            <div>
              <label className="block text-sm font-semibold text-modern-gray-700 mb-3">
                🔑 Gemini API Key
              </label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full px-4 py-3 border border-tiktok-pink/30 rounded-xl focus:ring-2 focus:ring-tiktok-pink/50 focus:border-tiktok-pink transition-all bg-white shadow-sm"
              />
              <p className="text-xs text-modern-gray-500 mt-2 font-medium">
                Get your API key from{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-tiktok-pink hover:text-shopee-orange transition-colors font-semibold"
                >
                  Google AI Studio
                </a>
              </p>
            </div>



            {/* Test Result */}
            {testResult && (
              <div
                className={`p-4 rounded-xl shadow-lg ${
                  testResult.success
                    ? 'bg-gradient-to-r from-tiktok-cyan/10 to-tiktok-cyan/5 border border-tiktok-cyan/30'
                    : 'bg-gradient-to-r from-shopee-red/10 to-shopee-red/5 border border-shopee-red/30'
                }`}
              >
                <div className="flex">
                  <div className={testResult.success ? 'text-tiktok-cyan text-lg' : 'text-shopee-red text-lg'}>
                    {testResult.success ? '✅' : '❌'}
                  </div>
                  <div className="ml-3">
                    <p
                      className={`text-sm font-medium ${
                        testResult.success ? 'text-tiktok-cyan' : 'text-shopee-red'
                      }`}
                    >
                      {testResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleTest}
                disabled={isTesting || !tempApiKey.trim()}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  isTesting || !tempApiKey.trim()
                    ? 'bg-modern-gray-300 text-modern-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-tiktok-cyan to-shopee-orange hover:from-tiktok-cyan-light hover:to-shopee-orange-light text-white shadow-lg shadow-tiktok-cyan/30 transform hover:scale-105'
                }`}
              >
                {isTesting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>Testing...</span>
                  </div>
                ) : (
                  '🧪 Test API Key'
                )}
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-tiktok-pink to-shopee-orange hover:from-tiktok-pink-light hover:to-shopee-orange-light text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-tiktok-pink/30 transform hover:scale-105"
                >
                  💾 Save
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 bg-gradient-to-r from-shopee-red to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-shopee-red/30 transform hover:scale-105"
                >
                  🗑️ Clear
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-modern-gray-50 to-tiktok-pink/5 rounded-xl p-4 border border-tiktok-pink/20">
              <h3 className="font-semibold text-modern-gray-900 mb-3 flex items-center">
                <span className="mr-2">📋</span>
                How to get your API key:
              </h3>
              <ol className="text-sm text-modern-gray-600 space-y-2 list-decimal list-inside font-medium">
                <li>Visit Google AI Studio</li>
                <li>Sign in with your Google account</li>
                <li>Click "Get API Key"</li>
                <li>Create a new API key</li>
                <li>Copy and paste it here</li>
              </ol>
            </div>

            {/* Video API Setup Button */}
            <div className="mt-4">
              <button
                onClick={handleCreateVideoAPI}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/30 transform hover:scale-105"
              >
                <span className="text-lg">🎥</span>
                <span>Buat API Video</span>
              </button>
              <p className="text-xs text-modern-gray-500 mt-2 font-medium text-center">
                Klik untuk membuka halaman tutorial pembuatan API Video
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video API Tutorial Modal */}
      {showVideoTutorial && (
        <VideoAPITutorial
          videoApiKey={videoApiKey}
          setVideoApiKey={setVideoApiKey}
          onBack={() => setShowVideoTutorial(false)}
        />
      )}
    </div>
  );
};

export default Settings;
