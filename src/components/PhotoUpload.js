import React, { useState, useRef } from 'react';

const PhotoUpload = ({ onImageUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        setPreview(imageData);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select an image file');
    }
  };

  const handleUpload = () => {
    if (preview) {
      onImageUpload(preview);

      // Auto-scroll to next section after a short delay
      setTimeout(() => {
        window.scrollTo({
          top: window.innerHeight,
          behavior: 'smooth'
        });
      }, 300);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card-glass p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-tiktok-pink to-shopee-orange rounded-2xl mb-4 shadow-lg shadow-tiktok-pink/30 animate-float">
          <span className="text-xl sm:text-2xl">📸</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-tiktok-pink via-shopee-orange to-tiktok-cyan bg-clip-text text-transparent mb-2 font-sans">Upload Photo</h2>
        <p className="text-tiktok-cyan/80 text-sm sm:text-base font-medium px-4">Upload a photo to analyze the product, model, and background</p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-tiktok-pink bg-gradient-to-br from-tiktok-pink/20 to-shopee-orange/20 scale-105 shadow-lg shadow-tiktok-pink/20'
            : 'border-tiktok-pink/30 hover:border-tiktok-pink/60 hover:bg-gradient-to-br hover:from-tiktok-pink/10 hover:to-shopee-orange/10'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative group">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-48 sm:max-h-64 mx-auto rounded-xl shadow-2xl border border-tiktok-pink/30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-tiktok-black/30 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button
                onClick={onButtonClick}
                className="bg-tiktok-dark/60 hover:bg-tiktok-dark/80 backdrop-blur-sm text-tiktok-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 border border-tiktok-pink/30 hover:border-tiktok-pink/50 text-sm sm:text-base font-medium shadow-lg hover:shadow-tiktok-pink/20"
              >
                🔄 Change Photo
              </button>
              <button
                onClick={handleUpload}
                className="bg-gradient-to-r from-tiktok-pink to-shopee-orange hover:from-tiktok-pink-light hover:to-shopee-orange-light text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 shadow-lg shadow-tiktok-pink/30 text-sm sm:text-base font-semibold transform hover:scale-105"
              >
                ✨ Continue with This Photo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-4xl sm:text-6xl opacity-60 animate-bounce-slow">📷</div>
            <div>
              <p className="text-lg sm:text-xl text-tiktok-white/80 mb-3 sm:mb-4 font-medium">
                Drag and drop your photo here, or
              </p>
              <button
                onClick={onButtonClick}
                className="bg-gradient-to-r from-tiktok-pink to-shopee-orange hover:from-tiktok-pink-light hover:to-shopee-orange-light text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all duration-300 shadow-lg shadow-tiktok-pink/30 transform hover:scale-105"
              >
                📁 Browse Files
              </button>
            </div>
            <p className="text-xs sm:text-sm text-tiktok-cyan/70 font-medium">
              Supports: JPG, PNG, GIF (Max 10MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUpload;
