import React, { useState } from 'react';

const VideoAPITutorial = ({ videoApiKey, setVideoApiKey, onBack }) => {
  const [tempVideoApiKey, setTempVideoApiKey] = useState(videoApiKey || '');

  const handleSave = () => {
    setVideoApiKey(tempVideoApiKey);
    localStorage.setItem('video_api_key', tempVideoApiKey);
    onBack();
  };

  const handleOpenURL = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎥</span>
              <h2 className="text-xl sm:text-2xl font-bold">Tutorial Pembuatan API Video</h2>
            </div>
            <button
              onClick={onBack}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 rounded-xl transition-all duration-300 text-sm"
            >
              ← Kembali
            </button>
          </div>
          <p className="text-purple-100 mt-2 text-sm">
            ⚠️ <strong>API Key Terpisah Diperlukan!</strong> Video generation membutuhkan API Key yang berbeda dari Gemini API Key untuk gambar.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
              <div className="text-center mb-3">
                <div className="text-3xl mb-2">📧</div>
                <h3 className="font-semibold text-purple-800 text-sm">Step 1</h3>
                <p className="text-xs text-purple-600 mb-3">Buat Email Topeng</p>
              </div>
              <button
                onClick={() => handleOpenURL('https://relay.firefox.com/accounts/profile/')}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm shadow-lg transform hover:scale-105"
              >
                Buat Email Topeng
              </button>
              <p className="text-xs text-purple-500 mt-2 text-center">
                Untuk melindungi email utama Anda
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
              <div className="text-center mb-3">
                <div className="text-3xl mb-2">📬</div>
                <h3 className="font-semibold text-blue-800 text-sm">Step 2</h3>
                <p className="text-xs text-blue-600 mb-3">Buka Gmail</p>
              </div>
              <button
                onClick={() => handleOpenURL('https://gmail.com')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm shadow-lg transform hover:scale-105"
              >
                Buka Gmail
              </button>
              <p className="text-xs text-blue-500 mt-2 text-center">
                Untuk menerima verifikasi
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
              <div className="text-center mb-3">
                <div className="text-3xl mb-2">🧪</div>
                <h3 className="font-semibold text-green-800 text-sm">Step 3</h3>
                <p className="text-xs text-green-600 mb-3">Buka Labs</p>
              </div>
              <button
                onClick={() => handleOpenURL('https://www.cloudskillsboost.google/course_templates/723/labs/568845')}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm shadow-lg transform hover:scale-105"
              >
                Buka Labs
              </button>
              <p className="text-xs text-green-500 mt-2 text-center">
                Google Cloud Skills Boost
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
            <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
              <span className="mr-2">💡</span>
              Petunjuk Penggunaan
            </h3>
            <div className="text-sm text-yellow-700 space-y-2">
              <p><strong>1.</strong> Klik "Buat Email Topeng" untuk membuat email sementara</p>
              <p><strong>2.</strong> Klik "Buka Gmail" untuk mengakses email Anda</p>
              <p><strong>3.</strong> Klik "Buka Labs" untuk mengakses Google Cloud Skills Boost</p>
              <p><strong>4.</strong> Ikuti tutorial di video di bawah untuk mendapatkan API Key</p>
              <p><strong>5.</strong> Masukkan API Key yang didapat ke form di bawah</p>
            </div>
          </div>

          {/* Video Tutorial */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
              <span className="mr-2">📺</span>
              Video Tutorial
            </h3>
            <div className="bg-gray-200 rounded-xl h-64 sm:h-80 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-3">🎬</div>
                <p className="text-lg font-medium">Video Tutorial Coming Soon</p>
                <p className="text-sm">Tutorial lengkap pembuatan API Video</p>
                <p className="text-xs mt-2">Placeholder untuk video tutorial</p>
              </div>
            </div>
          </div>

          {/* API Key Input */}
          <div className="bg-white border border-purple-200 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
              <span className="mr-2">🔑</span>
              Video API Key (Terpisah & Wajib)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Masukkan API Key Khusus Video (Bukan Gemini API Key)
                </label>
                <input
                  type="password"
                  value={tempVideoApiKey}
                  onChange={(e) => setTempVideoApiKey(e.target.value)}
                  placeholder="AIza... (Video API Key - WAJIB terpisah dari Gemini)"
                  className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm text-sm"
                />
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                  <p className="text-xs text-yellow-800">
                    ⚠️ <strong>PENTING:</strong> Video API Key HARUS terpisah dari Gemini API Key.
                    Video generation tidak akan berfungsi tanpa API Key khusus video ini.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105"
                >
                  💾 Simpan API Key
                </button>
                <button
                  onClick={onBack}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Kembali ke Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAPITutorial;
