import React, { useState, useEffect } from 'react';
import realVeo3Service from '../services/realVeo3Service';
import SceneCard from './SceneCard';
import CollapsiblePrompt from './CollapsiblePrompt';

const VideoPromptGenerator = ({
  generatedImage,
  generatedScenes,
  analysisResult,
  modelDescription,
  apiKey,
  onVideoGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoPrompts, setVideoPrompts] = useState(null);
  const [parsedPrompts, setParsedPrompts] = useState(null);
  const [englishPrompts, setEnglishPrompts] = useState(null);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeLanguageTab, setActiveLanguageTab] = useState('indonesia');
  const [isTranslating, setIsTranslating] = useState(false);

  // Video generation states
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoGenerationStatus, setVideoGenerationStatus] = useState({});

  // Editable fields
  const [editableProduk, setEditableProduk] = useState(analysisResult?.produk || '');
  const [editableModel, setEditableModel] = useState('');
  const [editableLatar, setEditableLatar] = useState(analysisResult?.latar || '');

  useEffect(() => {
    if (editableProduk && apiKey) {
      generateVideoPrompts();
    }
  }, [editableProduk, apiKey]);

  const generateVideoPrompts = async () => {
    if (!apiKey) {
      setError('Please set your Gemini API key in settings first');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setLoadingMessage('Generating video prompts...');

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Create 3 scene video prompts for Veo3 with EXACT format like the example below. IMPORTANT: Ensure ALL scenes use the EXACT SAME CHARACTER (model, clothing, appearance) for visual consistency:

🎬 VIDEO – [Engaging Video Title about the product]

🎬 SCENE 1 – Hook

🎥 Prompt Visual (Scene 1):
[Detailed visual description in English using: MODEL: ${editableModel || 'Indonesian woman, around 25 years old, slim build, medium brown skin, long straight black hair, oval face'}, SETTING: ${editableLatar}, PRODUCT: ${editableProduk}. Write complete character description with specific details about appearance, clothing, pose, and expression. Minimum 2-3 detailed sentences.]

🎙 Lip Sync (in Indonesian):
"[Hook narration in Indonesian, 15-20 words]"

🎙 Voice Style: [Voice emotion and style description in English]
🎥 Camera: [Camera movement and shot type in English]
💡 Lighting: [Lighting description in English]
🎞 Style: [Video style description in English]
🔻 Negative Prompt: blurry face, glitch, double face, bad hand, distorted proportions, overlay text, subtitle, watermark

🎬 SCENE 2 – Story

🎥 Prompt Visual (Scene 2):
[Detailed visual description in English using: MODEL: ${editableModel || 'Indonesian woman, around 25 years old, slim build, medium brown skin, long straight black hair, oval face'}, SETTING: ${editableLatar}, PRODUCT: ${editableProduk}. Rewrite complete character description like Scene 1, but with pose and expression showing product benefits. Minimum 2-3 detailed sentences.]

🎙 Lip Sync (in Indonesian):
"[Sensory storytelling narration in Indonesian, 15-20 words]"

🎙 Voice Style: [Voice emotion and style description in English]
🎥 Camera: [Camera movement and shot type in English]
💡 Lighting: [Lighting description in English]
🎞 Style: [Video style description in English]
🔻 Negative Prompt: blurry face, glitch, double face, bad hand, distorted proportions, overlay text, subtitle, watermark

🎬 SCENE 3 – CTA

🎥 Prompt Visual (Scene 3):
[Detailed visual description in English using: MODEL: ${editableModel || 'Indonesian woman, around 25 years old, slim build, medium brown skin, long straight black hair, oval face'}, SETTING: ${editableLatar}, PRODUCT: ${editableProduk}. Rewrite complete character description like Scene 1, but with call-to-action pose encouraging audience to act. Minimum 2-3 detailed sentences.]

🎙 Lip Sync (in Indonesian):
"[CTA with urgency narration in Indonesian, 15-20 words]"

🎙 Voice Style: [Voice emotion and style description in English]
🎥 Camera: [Camera movement and shot type in English]
💡 Lighting: [Lighting description in English]
🎞 Style: [Video style description in English]
🔻 Negative Prompt: blurry face, glitch, double face, bad hand, distorted proportions, overlay text, subtitle, watermark

📄 Caption Sosial Media:
[Engaging caption with relevant hashtags for Indonesian platforms]

IMPORTANT RULES:
- Use EXACT format above with emojis and structure
- DO NOT use words "same", "identical", "like Scene 1", "as previous" or references to other scenes
- REWRITE complete character description in each scene (physical appearance, clothing, hair, etc.)
- Ensure visual consistency across all scenes
- All descriptions must be in ENGLISH except Indonesian narration
- Focus on product: ${editableProduk}
- Setting: ${editableLatar}
- Model: ${editableModel || 'Indonesian woman, around 25 years old, slim build, medium brown skin, long straight black hair, oval face'}`
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]) {
        const content = data.candidates[0].content.parts[0].text;
        setVideoPrompts(content);
        
        // Parse the prompts
        const parsed = parseVideoPrompts(content);
        setParsedPrompts(parsed);
      } else {
        throw new Error('No content generated');
      }
    } catch (error) {
      console.error('Error generating video prompts:', error);
      setError('Failed to generate video prompts. Please try again.');
    } finally {
      setIsGenerating(false);
      setLoadingMessage('');
    }
  };

  const parseVideoPrompts = (content) => {
    try {
      // Extract each scene prompt
      const scene1Match = content.match(/🎬 SCENE 1[^🎬]*🎥 Prompt Visual \(Scene 1\):\s*([^🎙️]*)/s);
      const scene2Match = content.match(/🎬 SCENE 2[^🎬]*🎥 Prompt Visual \(Scene 2\):\s*([^🎙️]*)/s);
      const scene3Match = content.match(/🎬 SCENE 3[^🎬]*🎥 Prompt Visual \(Scene 3\):\s*([^🎙️]*)/s);
      const captionMatch = content.match(/📄 Caption Sosial Media:\s*([^PENTING]*)/s);

      return {
        scene1: scene1Match ? scene1Match[1].trim() : '',
        scene2: scene2Match ? scene2Match[1].trim() : '',
        scene3: scene3Match ? scene3Match[1].trim() : '',
        caption: captionMatch ? captionMatch[1].trim() : ''
      };
    } catch (error) {
      console.error('Error parsing prompts:', error);
      return null;
    }
  };

  const translateToEnglish = async (text) => {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Translate this Indonesian VEO3 video prompt to English while keeping the same structure and details. Keep Indonesian names and cultural references. Only translate the descriptive text:

${text}`
          }]
        }]
      })
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || text;
  };

  const handleLanguageTabChange = async (language) => {
    setActiveLanguageTab(language);

    if (language === 'english' && parsedPrompts && !englishPrompts) {
      setIsTranslating(true);
      try {
        const translatedPrompts = {
          scene1: await translateToEnglish(parsedPrompts.scene1),
          scene2: await translateToEnglish(parsedPrompts.scene2),
          scene3: await translateToEnglish(parsedPrompts.scene3),
          caption: await translateToEnglish(parsedPrompts.caption)
        };
        setEnglishPrompts(translatedPrompts);
      } catch (error) {
        console.error('Translation failed:', error);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const handleCreateVideo = async (prompt, referenceImage, sceneId) => {
    if (!apiKey.trim()) {
      alert('❌ Please set your API key in settings first');
      return;
    }

    if (!prompt.trim()) {
      alert('❌ No prompt available for video generation');
      return;
    }

    setIsGeneratingVideo(true);
    setVideoGenerationStatus(prev => ({
      ...prev,
      [sceneId]: 'generating'
    }));

    try {
      console.log(`🎬 Starting video generation for ${sceneId}...`, {
        hasPrompt: !!prompt,
        hasReferenceImage: !!referenceImage
      });

      const config = {
        aspectRatio: '16:9',
        enableSound: true,
        resolution: '1080p'
      };

      const result = await realVeo3Service.generate({
        prompt,
        referenceImage,
        config,
        apiKey
      });

      if (result.success) {
        const videoData = {
          id: `${sceneId}_${Date.now()}`,
          url: result.video_url,
          filename: `${sceneId}_video_${Date.now()}.mp4`,
          thumbnail: result.thumbnail_url,
          duration: result.duration,
          jobId: result.job_id,
          createdAt: result.created_at,
          description: result.description,
          enhanced_prompt: result.enhanced_prompt,
          used_imagen: result.used_imagen,
          video_file: result.video_file,
          scene: sceneId,
          title: `${sceneId.toUpperCase()} - ${analysisResult?.produk || 'Video'}`,
          prompt: prompt,
          size: result.file_size || 0,
          order: sceneId === 'scene1' ? 0 : sceneId === 'scene2' ? 1 : 2
        };

        setVideoGenerationStatus(prev => ({
          ...prev,
          [sceneId]: 'completed'
        }));

        // Send to main gallery
        if (onVideoGenerated) {
          onVideoGenerated(videoData);
        }

        console.log('✅ Video generated successfully!');
        console.log('📤 Video sent to gallery:', videoData.title);
        alert('🎉 Video generated successfully using VEO3! Check the video gallery below.');
      } else {
        throw new Error(result.message || 'Generation failed');
      }
    } catch (error) {
      console.error('❌ Video generation failed:', error);
      alert(`❌ Video generation failed: ${error.message}`);
      setVideoGenerationStatus(prev => ({
        ...prev,
        [sceneId]: 'failed'
      }));
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          🎬 Video Prompt Generator
        </h2>

        {/* Product Info */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Product Information:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Product:</span> {editableProduk}
            </div>
            <div>
              <span className="font-medium">Setting:</span> {editableLatar}
            </div>
            <div>
              <span className="font-medium">Model:</span> {editableModel || 'Auto-generated'}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        {!parsedPrompts && (
          <div className="text-center mb-6">
            <button
              onClick={generateVideoPrompts}
              disabled={isGenerating}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isGenerating ? '⏳ Generating...' : '🎬 Generate Video Prompts'}
            </button>
          </div>
        )}

        {/* Loading */}
        {isGenerating && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{loadingMessage}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Results */}
        {parsedPrompts && (
          <div className="space-y-6">
            {/* Language Tabs */}
            <div className="mb-6">
              <div className="flex justify-center space-x-1 bg-gray-100 p-1 rounded-lg max-w-md mx-auto">
                <button
                  onClick={() => handleLanguageTabChange('indonesia')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeLanguageTab === 'indonesia'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🇮🇩 Indonesia
                </button>
                <button
                  onClick={() => handleLanguageTabChange('english')}
                  disabled={isTranslating}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeLanguageTab === 'english'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  } ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  🇺🇸 English {isTranslating && '⏳'}
                </button>
              </div>
            </div>

            {/* Scene Cards */}
            <SceneCard
              sceneNumber={1}
              title="Hook"
              prompt={parsedPrompts.scene1}
              englishPrompt={englishPrompts?.scene1}
              image={generatedImage}
              generatedImage={generatedScenes?.scene1}
              narration={generatedScenes?.narrations?.scene1}
              onGenerateVideo={handleCreateVideo}
              isGenerating={isGeneratingVideo && videoGenerationStatus.scene1 === 'generating'}
              isCompleted={videoGenerationStatus.scene1 === 'completed'}
              activeLanguageTab={activeLanguageTab}
            />

            <SceneCard
              sceneNumber={2}
              title="Story"
              prompt={parsedPrompts.scene2}
              englishPrompt={englishPrompts?.scene2}
              image={generatedImage}
              generatedImage={generatedScenes?.scene2}
              narration={generatedScenes?.narrations?.scene2}
              onGenerateVideo={handleCreateVideo}
              isGenerating={isGeneratingVideo && videoGenerationStatus.scene2 === 'generating'}
              isCompleted={videoGenerationStatus.scene2 === 'completed'}
              activeLanguageTab={activeLanguageTab}
            />

            <SceneCard
              sceneNumber={3}
              title="CTA"
              prompt={parsedPrompts.scene3}
              englishPrompt={englishPrompts?.scene3}
              image={generatedImage}
              generatedImage={generatedScenes?.scene3}
              narration={generatedScenes?.narrations?.scene3}
              onGenerateVideo={handleCreateVideo}
              isGenerating={isGeneratingVideo && videoGenerationStatus.scene3 === 'generating'}
              isCompleted={videoGenerationStatus.scene3 === 'completed'}
              activeLanguageTab={activeLanguageTab}
            />

            {/* Caption Section */}
            <CollapsiblePrompt
              title="📄 Caption & Hashtag"
              prompt={activeLanguageTab === 'english' && englishPrompts
                ? englishPrompts.caption
                : parsedPrompts.caption}
              isExpanded={false}
            />

            {/* Export All Button */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🎬 Export All Prompts</h3>
              <button
                onClick={() => {
                  const currentPrompts = activeLanguageTab === 'english' && englishPrompts ? englishPrompts : parsedPrompts;
                  const allPrompts = `=== VEO3 VIDEO PROMPTS ===

SCENE 1 - HOOK:
${currentPrompts.scene1}

SCENE 2 - STORY:
${currentPrompts.scene2}

SCENE 3 - CTA:
${currentPrompts.scene3}

CAPTION & HASHTAG:
${currentPrompts.caption}

Generated by VIDABOT - ATM Video Affiliate`;
                  copyToClipboard(allPrompts);
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
              >
                <span>📋</span>
                <span>Copy All Prompts ({activeLanguageTab === 'english' ? 'English' : 'Indonesian'})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPromptGenerator;
