import React, { useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const VideoEditor = ({ videos, onUpdateVideos, onClose }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [timeline, setTimeline] = useState(videos.map(video => ({ ...video, order: video.order || 0 })));
  const [trimSettings, setTrimSettings] = useState({ start: 0, end: 0 });
  const [cropSettings, setCropSettings] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const videoRef = useRef(null);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(timeline);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setTimeline(updatedItems);
    onUpdateVideos(updatedItems);
  };

  const handleTrimVideo = () => {
    if (!selectedVideo) return;

    const updatedVideos = timeline.map(video => 
      video.id === selectedVideo.id 
        ? { 
            ...video, 
            trimStart: trimSettings.start,
            trimEnd: trimSettings.end,
            duration: trimSettings.end - trimSettings.start
          }
        : video
    );

    setTimeline(updatedVideos);
    onUpdateVideos(updatedVideos);
  };

  const handleCropVideo = () => {
    if (!selectedVideo) return;

    const updatedVideos = timeline.map(video => 
      video.id === selectedVideo.id 
        ? { 
            ...video, 
            crop: cropSettings
          }
        : video
    );

    setTimeline(updatedVideos);
    onUpdateVideos(updatedVideos);
  };

  const handleVideoLoad = () => {
    if (videoRef.current && selectedVideo) {
      const duration = videoRef.current.duration;
      setTrimSettings({ start: 0, end: duration });
    }
  };

  const exportFinalVideo = () => {
    const exportSettings = {
      aspectRatio,
      totalDuration: timeline.reduce((acc, video) => acc + (video.duration || 0), 0),
      videoCount: timeline.length,
      settings: {
        aspectRatio,
        trimSettings: selectedVideo ? trimSettings : null,
        cropSettings: selectedVideo ? cropSettings : null
      }
    };

    console.log('🎬 Export Settings:', exportSettings);
    alert(`Export functionality would be implemented with video processing library like FFmpeg.js\n\nSettings:\n- Aspect Ratio: ${aspectRatio}\n- Total Duration: ${exportSettings.totalDuration.toFixed(1)}s\n- Video Count: ${exportSettings.videoCount}`);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800">Video Editor</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline / Scene Builder */}
        <div className="lg:col-span-2">
          <h4 className="font-medium text-gray-800 mb-3">Scene Timeline</h4>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="timeline" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex gap-3 p-4 bg-white rounded-lg border border-gray-200 min-h-[120px] overflow-x-auto"
                >
                  {timeline.map((video, index) => (
                    <Draggable key={video.id} draggableId={video.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex-shrink-0 w-32 bg-gray-50 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedVideo?.id === video.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                          onClick={() => setSelectedVideo(video)}
                        >
                          <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                            <video
                              src={video.url}
                              className="w-full h-full object-cover"
                              muted
                            />
                          </div>
                          <div className="p-2">
                            <div className="text-xs font-medium text-gray-800 truncate">
                              {video.scene || `Video ${index + 1}`}
                            </div>
                            <div className="text-xs text-gray-500">
                              {video.duration ? `${video.duration.toFixed(1)}s` : 'Unknown'}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Export Controls */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={exportFinalVideo}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Final Video
            </button>
            
            <div className="text-sm text-gray-600 flex items-center">
              Total Duration: {timeline.reduce((acc, video) => acc + (video.duration || 0), 0).toFixed(1)}s
            </div>
          </div>
        </div>

        {/* Editing Controls */}
        <div className="space-y-6">
          {selectedVideo ? (
            <>
              {/* Video Preview */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Preview</h4>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    src={selectedVideo.url}
                    controls
                    className="w-full h-full object-cover"
                    onLoadedMetadata={handleVideoLoad}
                  />
                </div>
              </div>

              {/* Trim Controls */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Trim Video</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Start Time (seconds)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={trimSettings.start}
                      onChange={(e) => setTrimSettings(prev => ({ ...prev, start: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">End Time (seconds)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={trimSettings.end}
                      onChange={(e) => setTrimSettings(prev => ({ ...prev, end: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleTrimVideo}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Apply Trim
                  </button>
                </div>
              </div>

              {/* Aspect Ratio Controls */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Aspect Ratio</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setAspectRatio('16:9')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        aspectRatio === '16:9'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      16:9 Landscape
                    </button>
                    <button
                      onClick={() => setAspectRatio('9:16')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        aspectRatio === '9:16'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      9:16 Portrait
                    </button>
                    <button
                      onClick={() => setAspectRatio('1:1')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        aspectRatio === '1:1'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      1:1 Square
                    </button>
                    <button
                      onClick={() => setAspectRatio('4:5')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        aspectRatio === '4:5'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      4:5 Instagram
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Selected: {aspectRatio}
                    {aspectRatio === '9:16' && ' (Perfect for TikTok, Instagram Stories)'}
                    {aspectRatio === '16:9' && ' (Perfect for YouTube, Facebook)'}
                    {aspectRatio === '1:1' && ' (Perfect for Instagram Feed)'}
                    {aspectRatio === '4:5' && ' (Perfect for Instagram Feed)'}
                  </div>
                </div>
              </div>

              {/* Crop Controls */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Crop Video</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">X Position (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={cropSettings.x}
                        onChange={(e) => setCropSettings(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Y Position (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={cropSettings.y}
                        onChange={(e) => setCropSettings(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Width (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={cropSettings.width}
                        onChange={(e) => setCropSettings(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Height (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={cropSettings.height}
                        onChange={(e) => setCropSettings(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCropVideo}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Apply Crop
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Select a video from timeline to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;
