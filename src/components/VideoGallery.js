import React from 'react';


const VideoGallery = ({ videos = [], onUpdateVideos }) => {


  const handleDownloadVideo = (video) => {
    const link = document.createElement('a');
    link.href = video.url;
    link.download = `${video.title || 'video'}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteVideo = (videoId) => {
    const updatedVideos = videos.filter(video => video.id !== videoId);
    onUpdateVideos(updatedVideos);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Generated Videos</h2>
            <span className="text-sm text-green-600 font-medium">AI Generated</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          {videos.length > 0 && (
            <>

              
              <button
                onClick={() => {
                  videos.forEach(video => handleDownloadVideo(video));
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download All
              </button>
            </>
          )}
        </div>
      </div>



      {/* Video Grid */}
      {videos.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No videos generated yet</h3>
          <p className="text-gray-500">Generate videos from your scenes to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <div key={video.id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              {/* Video Preview */}
              <div className="relative aspect-video bg-black">
                <video
                  src={video.url}
                  controls
                  className="w-full h-full object-cover"
                  poster={video.thumbnail}
                >
                  Your browser does not support the video tag.
                </video>
                
                {/* Video Badge */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                  {video.scene || `Video ${index + 1}`}
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  {video.title || `${video.scene || `Video ${index + 1}`}`}
                </h3>
                
                {video.prompt && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {video.prompt.length > 100 ? `${video.prompt.substring(0, 100)}...` : video.prompt}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {video.duration && `${video.duration}s`}
                    {video.size && ` • ${(video.size / (1024 * 1024)).toFixed(1)}MB`}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadVideo(video)}
                      className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                      title="Download Video"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="text-red-600 hover:text-red-700 p-1 rounded transition-colors"
                      title="Delete Video"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoGallery;
