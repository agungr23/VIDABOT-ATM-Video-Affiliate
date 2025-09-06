import React from 'react';
import CollapsiblePrompt from './CollapsiblePrompt';

const SceneCard = ({ 
  sceneNumber, 
  title, 
  prompt, 
  image, 
  generatedImage, 
  narration,
  onGenerateVideo,
  isGenerating,
  isCompleted,
  activeLanguageTab,
  englishPrompt
}) => {
  const sceneId = `scene${sceneNumber}`;
  const displayPrompt = activeLanguageTab === 'english' && englishPrompt ? englishPrompt : prompt;

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = generatedImage || image;
    link.download = `${sceneId}_image_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Collapsible Prompt */}
      <CollapsiblePrompt
        title={`🎬 Scene ${sceneNumber} - ${title}`}
        prompt={displayPrompt}
        isExpanded={false}
      />
      
      {/* Scene Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generated Image */}
          {(generatedImage || image) && (
            <div className="order-2 lg:order-1">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {generatedImage ? `Generated Scene ${sceneNumber}:` : 'Reference Image:'}
              </h4>
              <img
                src={generatedImage || image}
                alt={`Scene ${sceneNumber} Generated Image`}
                className="w-full rounded-lg border shadow-sm"
              />
              
              {/* Download Button */}
              <div className="mt-2 flex justify-center">
                <button
                  onClick={handleDownloadImage}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                >
                  <span>📥</span>
                  <span>Download</span>
                </button>
              </div>
              
              {/* Narration */}
              {narration && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                  <strong>Narasi:</strong> {narration}
                </div>
              )}
            </div>
          )}
          
          {/* Video Generation Controls */}
          <div className={`${generatedImage ? 'order-1 lg:order-2' : ''}`}>
            <div className="text-center">
              <button
                onClick={() => onGenerateVideo(displayPrompt, generatedImage || image, sceneId)}
                disabled={isGenerating}
                className={`px-6 py-3 rounded-lg text-lg font-medium transition-colors flex items-center space-x-2 mx-auto ${
                  isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isCompleted
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white`}
              >
                <span>
                  {isGenerating
                    ? '⏳'
                    : isCompleted
                    ? '✅'
                    : '🎬'}
                </span>
                <span>
                  {isGenerating
                    ? 'Generating Video...'
                    : isCompleted
                    ? 'Video Generated!'
                    : `Generate Video Scene ${sceneNumber}`}
                </span>
              </button>
              
              {/* Scene Info */}
              <div className="mt-4 text-sm text-gray-600">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-800 mb-1">Scene {sceneNumber} - {title}</div>
                  <div className="text-xs">
                    {sceneNumber === 1 && "Hook: Grab attention and stop the scroll"}
                    {sceneNumber === 2 && "Story: Build connection and show benefits"}
                    {sceneNumber === 3 && "CTA: Drive action with urgency"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneCard;
