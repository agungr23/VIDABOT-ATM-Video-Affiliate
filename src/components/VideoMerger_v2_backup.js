import React, { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const VideoMerger = ({ generatedVideos, aspectRatio }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [mergedVideoUrl, setMergedVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const ffmpegRef = useRef(new FFmpeg());

  // Check if we have all 3 videos
  const hasAllVideos = generatedVideos.scene1 && generatedVideos.scene2 && generatedVideos.scene3;

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current;
    
    if (!ffmpeg.loaded) {
      setStatus('Loading FFmpeg...');
      
      try {
        // Load FFmpeg with CDN URLs
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        
        ffmpeg.on('progress', ({ progress }) => {
          // Clamp progress between 0 and 100
          const clampedProgress = Math.min(Math.max(progress * 100, 0), 100);
          setProgress(Math.round(clampedProgress));
        });
        
        console.log('✅ FFmpeg loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load FFmpeg:', error);
        throw new Error('Failed to load FFmpeg. Please try again.');
      }
    }
  };

  const mergeAndCropVideos = async () => {
    if (!hasAllVideos) {
      setError('Please generate all 3 videos first');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setMergedVideoUrl(null);

    try {
      await loadFFmpeg();
      const ffmpeg = ffmpegRef.current;

      // Disable automatic progress tracking to use manual steps
      ffmpeg.off('progress');

      setStatus('Downloading videos...');
      setProgress(10);

      // Debug video URLs
      const video1Url = generatedVideos.scene1.video_url || generatedVideos.scene1.url;
      const video2Url = generatedVideos.scene2.video_url || generatedVideos.scene2.url;
      const video3Url = generatedVideos.scene3.video_url || generatedVideos.scene3.url;

      console.log('🎬 Video URLs for merging:', {
        scene1: { url: video1Url, type: video1Url?.startsWith('blob:') ? 'blob' : 'http' },
        scene2: { url: video2Url, type: video2Url?.startsWith('blob:') ? 'blob' : 'http' },
        scene3: { url: video3Url, type: video3Url?.startsWith('blob:') ? 'blob' : 'http' }
      });

      // Fetch video files with error handling and detailed logging
      try {
        setStatus('Fetching Scene 1 video...');
        const video1 = await fetchFile(video1Url);
        console.log('✅ Scene 1 video fetched successfully, size:', video1.byteLength, 'bytes');
        setProgress(20);

        setStatus('Fetching Scene 2 video...');
        const video2 = await fetchFile(video2Url);
        console.log('✅ Scene 2 video fetched successfully, size:', video2.byteLength, 'bytes');
        setProgress(30);

        setStatus('Fetching Scene 3 video...');
        const video3 = await fetchFile(video3Url);
        console.log('✅ Scene 3 video fetched successfully, size:', video3.byteLength, 'bytes');
        setProgress(40);

        setStatus('Writing files to FFmpeg filesystem...');
        // Write files to FFmpeg filesystem
        await ffmpeg.writeFile('scene1.mp4', video1);
        console.log('✅ Scene 1 written to FFmpeg filesystem');
        
        await ffmpeg.writeFile('scene2.mp4', video2);
        console.log('✅ Scene 2 written to FFmpeg filesystem');
        
        await ffmpeg.writeFile('scene3.mp4', video3);
        console.log('✅ Scene 3 written to FFmpeg filesystem');
        console.log('✅ All files written to FFmpeg filesystem');

      } catch (fetchError) {
        console.error('❌ Error fetching video files:', fetchError);
        throw new Error(`Failed to fetch video files: ${fetchError.message}`);
      }

      setStatus('Preparing video processing...');
      setProgress(50);

      // Create filter for cropping to 9:16 if needed
      let filterComplex = '';
      let outputOptions = [];

      if (aspectRatio === '9:16') {
        // Crop center to 9:16 aspect ratio
        filterComplex = `
          [0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[v0];
          [1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[v1];
          [2:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[v2];
          [v0][0:a][v1][1:a][v2][2:a]concat=n=3:v=1:a=1[outv][outa]
        `.trim();
        outputOptions = ['-filter_complex', filterComplex, '-map', '[outv]', '-map', '[outa]'];
      } else {
        // Just concatenate without cropping for 16:9
        filterComplex = '[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[outv][outa]';
        outputOptions = ['-filter_complex', filterComplex, '-map', '[outv]', '-map', '[outa]'];
      }

      setStatus('Starting video processing...');
      setProgress(60);

      // Simple FFmpeg execution with detailed logging
      console.log('🎬 Starting FFmpeg execution with filter:', filterComplex);
      setProgress(60);
      
      // Start progress simulation with more detailed updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + 1, 80);
          if (newProgress % 5 === 0) {
            console.log(`🔄 Processing progress: ${newProgress}%`);
          }
          return newProgress;
        });
      }, 500);
      
      try {
        if (aspectRatio === '9:16') {
          console.log('🎬 Processing in Portrait mode (9:16) with cropping...');
          setStatus('Processing videos in portrait mode...');
          // Portrait mode with crop
          await ffmpeg.exec([
            '-i', 'scene1.mp4',
            '-i', 'scene2.mp4',
            '-i', 'scene3.mp4',
            '-filter_complex',
            '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[v0];[1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[v1];[2:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[v2];[v0][0:a][v1][1:a][v2][2:a]concat=n=3:v=1:a=1[outv][outa]',
            '-map', '[outv]',
            '-map', '[outa]',
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-preset', 'ultrafast',
            '-y',
            'merged_video.mp4'
          ]);
        } else {
          console.log('🎬 Processing in Landscape mode (16:9) without cropping...');
          setStatus('Processing videos in landscape mode...');
          // Landscape mode - simple concat
          await ffmpeg.exec([
            '-i', 'scene1.mp4',
            '-i', 'scene2.mp4',
            '-i', 'scene3.mp4',
            '-filter_complex',
            '[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[outv][outa]',
            '-map', '[outv]',
            '-map', '[outa]',
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-preset', 'ultrafast',
            '-y',
            'merged_video.mp4'
          ]);
        }
        
        clearInterval(progressInterval);
        console.log('✅ FFmpeg execution completed successfully');
      } catch (ffmpegError) {
        clearInterval(progressInterval);
        console.error('❌ FFmpeg execution failed:', ffmpegError);
        throw ffmpegError;
      }

      setStatus('Creating output video...');
      setProgress(85);

      // Read the output file
      console.log('📖 Reading merged video file...');
      const data = await ffmpeg.readFile('merged_video.mp4');
      console.log('✅ Output file read successfully, size:', data.byteLength, 'bytes');

      setStatus('Finalizing video...');
      setProgress(95);

      // Create blob URL
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setMergedVideoUrl(url);

      setStatus('Video merged successfully!');
      setProgress(100);
      console.log('✅ Video merging completed successfully');

      // Clean up FFmpeg filesystem
      console.log('🧹 Cleaning up temporary files...');
      await ffmpeg.deleteFile('scene1.mp4');
      await ffmpeg.deleteFile('scene2.mp4');
      await ffmpeg.deleteFile('scene3.mp4');
      await ffmpeg.deleteFile('merged_video.mp4');
      console.log('✅ Cleanup completed');

    } catch (error) {
      console.error('❌ Video merging failed:', error);
      setError(`Failed to merge videos: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadMergedVideo = () => {
    if (mergedVideoUrl) {
      const link = document.createElement('a');
      link.href = mergedVideoUrl;
      link.download = `vidabot_merged_${aspectRatio.replace(':', 'x')}_${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetMerger = () => {
    setIsProcessing(false);
    setProgress(0);
    setStatus('');
    setError(null);
    setMergedVideoUrl(null);
  };

  return (
    <div className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🎬 Video Merger & Cropper
        </h3>
        <p className="text-gray-600 text-sm">
          Gabungkan 3 scene menjadi 1 video {aspectRatio === '9:16' ? 'portrait' : 'landscape'}
        </p>
      </div>

      {/* Status Display */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Videos Available: {Object.keys(generatedVideos).length}/3
          </span>
          <span className="text-sm text-gray-500">
            {aspectRatio === '9:16' ? '📱 Portrait Mode' : '🖥️ Landscape Mode'}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          {['scene1', 'scene2', 'scene3'].map((scene) => (
            <div
              key={scene}
              className={`p-2 rounded-lg text-center text-xs font-medium ${
                generatedVideos[scene]
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {generatedVideos[scene] ? '✅' : '⏳'} Scene {scene.slice(-1)}
            </div>
          ))}
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">{status}</span>
            <span className="text-sm text-purple-600">{Math.min(progress, 100)}%</span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">❌ {error}</p>
        </div>
      )}

      {/* Merged Video Preview */}
      {mergedVideoUrl && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            🎉 Merged Video Ready!
          </h4>
          <video
            controls
            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            src={mergedVideoUrl}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={mergeAndCropVideos}
          disabled={!hasAllVideos || isProcessing}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            !hasAllVideos || isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>🎬</span>
              <span>
                {aspectRatio === '9:16'
                  ? 'Merge & Crop to Portrait'
                  : 'Merge Videos'
                }
              </span>
            </div>
          )}
        </button>

        {mergedVideoUrl && (
          <button
            onClick={downloadMergedVideo}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <div className="flex items-center space-x-2">
              <span>⬇️</span>
              <span>Download Merged Video</span>
            </div>
          </button>
        )}

        {(isProcessing || error) && (
          <button
            onClick={resetMerger}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <div className="flex items-center space-x-2">
              <span>🔄</span>
              <span>Reset</span>
            </div>
          </button>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-700 text-xs text-center">
          💡 {aspectRatio === '9:16'
            ? 'Videos akan di-crop ke center dan diubah menjadi portrait 9:16 untuk TikTok/Instagram'
            : 'Videos akan digabungkan dalam format landscape 16:9 untuk YouTube/Desktop'
          }
        </p>
      </div>
    </div>
  );
};

export default VideoMerger;
