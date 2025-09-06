import React, { useState, useEffect } from 'react';
import { generateModelImageWithGemini, analyzeImageForDescriptions } from '../services/geminiService';
import realVeo3Service from '../services/realVeo3Service';
import VideoMerger from './VideoMerger';
import VideoAPITutorial from './VideoAPITutorial';

const ModelGeneration = ({
  originalImage,
  analysisResult,
  apiKey,
  videoApiKey,
  setVideoApiKey,
  onImageGeneration,
  generatedImage
}) => {
  const [modelDescription, setModelDescription] = useState('');
  const [productNotes, setProductNotes] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9'); // Default landscape

  // 3 scenes with background and narration
  const [scene1, setScene1] = useState('');
  const [background1, setBackground1] = useState('');
  const [narration1, setNarration1] = useState('');

  const [scene2, setScene2] = useState('');
  const [background2, setBackground2] = useState('');
  const [narration2, setNarration2] = useState('');

  const [scene3, setScene3] = useState('');
  const [background3, setBackground3] = useState('');
  const [narration3, setNarration3] = useState('');
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isVidabotAssisting, setIsVidabotAssisting] = useState(false);
  const [vidabotAnalysis, setVidabotAnalysis] = useState('');
  const [showVidabotAnalysis, setShowVidabotAnalysis] = useState(false);

  // Collapsible states for UI organization
  const [showSceneDetails, setShowSceneDetails] = useState({
    scene1: false,
    scene2: false,
    scene3: false
  });
  const [showVeo3Prompts, setShowVeo3Prompts] = useState({
    scene1: false,
    scene2: false,
    scene3: false
  });

  // Multiple image generation states
  const [generatedImages, setGeneratedImages] = useState({
    scene1: null,
    scene2: null,
    scene3: null
  });
  const [generatingScene, setGeneratingScene] = useState(null);
  // State untuk fitur upload foto model
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoDescription, setPhotoDescription] = useState('');
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);

  // State untuk Video API Tutorial
  const [showVideoAPITutorial, setShowVideoAPITutorial] = useState(false);

  // Video generation states
  const [isGeneratingVideo, setIsGeneratingVideo] = useState({});
  const [generatedVideos, setGeneratedVideos] = useState({});
  const [videoGenerationStatus, setVideoGenerationStatus] = useState({});
  const [videoProgress, setVideoProgress] = useState({});

  // Editable analysis result
  const [editableProduk, setEditableProduk] = useState(analysisResult?.produk || '');
  const [editableModel, setEditableModel] = useState(analysisResult?.model || '');
  const [editableLatar, setEditableLatar] = useState(analysisResult?.latar || '');
  const [editableProductDescription, setEditableProductDescription] = useState('');

  // Veo3 prompts for each scene
  const [veo3Prompts, setVeo3Prompts] = useState({
    scene1: '',
    scene2: '',
    scene3: ''
  });

  // Update editable fields when analysisResult changes
  useEffect(() => {
    if (analysisResult) {
      setEditableProduk(analysisResult.produk || '');
      setEditableModel(analysisResult.model || '');
      setEditableLatar(analysisResult.latar || '');
    }
  }, [analysisResult]);

  // Fungsi untuk handle upload foto model
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validasi file
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image file size should be less than 10MB');
      return;
    }

    setUploadedPhoto(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Analyze photo untuk mendapatkan deskripsi otomatis
    await analyzeUploadedPhoto(file);
  };

  // Function to validate and clean gender consistency
  const validateGenderConsistency = (description) => {
    const descLower = description.toLowerCase();
    const hasWoman = descLower.includes('woman') || descLower.includes('female') || descLower.includes('perempuan') || descLower.includes('wanita');
    const hasMale = descLower.includes('man') || descLower.includes('male') || descLower.includes('pria') || descLower.includes('laki-laki');

    if (hasWoman && hasMale) {
      // Remove conflicting terms, prioritize the first mentioned
      if (descLower.indexOf('woman') < descLower.indexOf('man') ||
          descLower.indexOf('female') < descLower.indexOf('male') ||
          descLower.indexOf('perempuan') < descLower.indexOf('pria') ||
          descLower.indexOf('wanita') < descLower.indexOf('laki-laki')) {
        // Keep woman/female, remove male terms
        return description.replace(/\b(man|male|pria|laki-laki)\b/gi, '').replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();
      } else {
        // Keep male, remove female terms
        return description.replace(/\b(woman|female|perempuan|wanita)\b/gi, '').replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();
      }
    }
    return description;
  };

  // Fungsi untuk analyze foto yang diupload
  const analyzeUploadedPhoto = async (file) => {
    if (!apiKey) {
      setError('API key is required for photo analysis');
      return;
    }

    setIsAnalyzingPhoto(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target.result; // Gunakan dataUrl lengkap, bukan hanya base64

        const analysisPrompt = `Analyze this photo and describe ONLY the model/person's physical characteristics for creating identical promotional images.

        Focus SPECIFICALLY on:
        1. Gender (male/female) - BE VERY CLEAR AND CONSISTENT, use only ONE gender term
        2. Age range (e.g., 20-25 years old, 30-35 years old)
        3. Ethnicity/race (e.g., Indonesian, Asian, Caucasian, etc.)
        4. Facial features (face shape, eye shape, nose, skin tone, facial hair if any)
        5. Hair (color, style, length)
        6. Body build (slim, medium, athletic, etc.)
        7. Clothing (exact colors, style, type of garments)

        CRITICAL: Use ONLY ONE gender term consistently throughout the description. Do not mix "woman" and "man" or "female" and "male" in the same description.

        DO NOT describe:
        - Pose or gestures
        - Products being held
        - Background or setting
        - Expressions or emotions
        - What products they would be suitable for

        Format your response as a clear, detailed description that focuses ONLY on the person's physical appearance and clothing, suitable for generating an identical-looking model.

        Example format: "A 25-year-old Indonesian woman with oval face, dark brown eyes, straight black shoulder-length hair, light brown skin, slim build, wearing a purple silk robe/kimono with white trim."`;

        const analysis = await analyzeImageForDescriptions(dataUrl, analysisPrompt, apiKey);
        const cleanedAnalysis = validateGenderConsistency(analysis);
        setPhotoDescription(cleanedAnalysis);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error analyzing photo:', error);
      setError('Failed to analyze photo. Please try again.');
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const handleVidabotAssist = async () => {
    if (!apiKey) {
      setError('Please set your Gemini API key in settings first');
      return;
    }

    setIsVidabotAssisting(true);
    setError(null);

    try {
      // Analyze the product and generate optimal descriptions
      const prompt = `Analyze this product image and create complete descriptions for product photos with CONSISTENT model.

Product: ${editableProduk || 'Product from image'}
${editableProductDescription ? `Description: ${editableProductDescription}` : ''}

IMPORTANT: Create the SAME model character for 3 scenes with connected storyline!

Response format:

ANALYSIS: [1-2 sentences about product and target market in English]

PRODUCT_DESCRIPTION: [product benefits, features, or advantages in 1-2 sentences in English]

MODEL: [detailed CONSISTENT model description in English - example: "Indonesian male carpenter, around 35 years old, medium build, tanned skin, short black hair, strong jawline, dark brown eyes, wearing white work shirt with suspenders, confident expression"]

SCENE1: [HOOK - attention-grabbing pose, confident expression, proudly showing product - describe in English]
BACKGROUND1: [professional workshop/workplace with warm lighting - describe in English]
NARASI1: [HOOK with high stopping power in Indonesian - create curiosity, shocking, or relatable problem. Use words "STOP", "TUNGGU", "JANGAN", or surprising questions. 15-20 words that make people stop scrolling]

SCENE2: [STORY - product demonstration, satisfied and emotional expression, showing benefits - describe in English]
BACKGROUND2: [more personal/relatable setting, natural lighting - describe in English]
NARASI2: [Emotional STORYTELLING touching 5 senses in Indonesian - visual (see), auditory (hear), kinesthetic (feel/touch), olfactory (smell), gustatory (taste). Tell life transformation. 15-20 words]

SCENE3: [CTA - inviting/pointing gesture, urgent and persuasive expression, call-to-action pose - describe in English]
BACKGROUND3: [clean setting focused on product, bright lighting - describe in English]
NARASI3: [BENEFIT + URGENCY + CTA in Indonesian - mention specific benefits, create urgency (limited stock/price increase), invite to check cart. 15-20 words with strong action words]

PRODUCT: [optimal product presentation - position, size, label MUST BE CONSISTENT in all scenes - describe in English]

Ensure MODEL is EXACTLY THE SAME in all scenes - face, body, hair, eyes, nose, skin color IDENTICAL!
Ensure NARRATION matches the product visible in image and relevant to target audience.
All descriptions except NARASI must be in ENGLISH.`;

      const response = await analyzeImageForDescriptions(
        originalImage,
        prompt,
        apiKey
      );

      // Parse the response to extract descriptions and analysis
      console.log('VIDABOT Response:', response);

      // Extract analysis section
      const analysisMatch = response.match(/ANALISIS:\s*(.*?)(?=MODEL:|$)/s);
      const analysis = analysisMatch ? analysisMatch[1].trim() : '';

      // Extract model description with more flexible matching
      const modelMatch = response.match(/MODEL:\s*(.*?)(?=SCENE1:|SCENE:|PRODUCT:|$)/s);
      const modelDesc = modelMatch ? modelMatch[1].trim() : '';

      // Extract 3 scenes, backgrounds, and narrations with more flexible patterns
      const scene1Match = response.match(/SCENE1:\s*(.*?)(?=BACKGROUND1:|SCENE2:|$)/s);
      const background1Match = response.match(/BACKGROUND1:\s*(.*?)(?=NARASI1:|SCENE2:|$)/s);
      const narasi1Match = response.match(/NARASI1:\s*(.*?)(?=SCENE2:|BACKGROUND2:|$)/s);

      const scene2Match = response.match(/SCENE2:\s*(.*?)(?=BACKGROUND2:|SCENE3:|$)/s);
      const background2Match = response.match(/BACKGROUND2:\s*(.*?)(?=NARASI2:|SCENE3:|$)/s);
      const narasi2Match = response.match(/NARASI2:\s*(.*?)(?=SCENE3:|BACKGROUND3:|$)/s);

      const scene3Match = response.match(/SCENE3:\s*(.*?)(?=BACKGROUND3:|PRODUCT:|$)/s);
      const background3Match = response.match(/BACKGROUND3:\s*(.*?)(?=NARASI3:|PRODUCT:|$)/s);
      const narasi3Match = response.match(/NARASI3:\s*(.*?)(?=PRODUCT:|$)/s);

      const productMatch = response.match(/PRODUCT:\s*(.*?)$/s);

      // Generate default content with consistent character and story flow
      const defaultModel = `Indonesian male carpenter, around 35 years old, medium build, tanned skin, short black hair, strong jawline, dark brown eyes, wearing white work shirt with suspenders, confident and trustworthy expression, skilled craftsman appearance, holding product with both hands, looking directly at camera with genuine smile.`;

      const defaultScenes = [
        `Model holding the product with confident smile and raised eyebrows (hook expression), showing the product prominently to camera, direct eye contact, engaging pose that captures attention`,
        `Model demonstrating product usage with satisfied and emotional expression, showing transformation or benefit, connecting emotionally with the product, storytelling pose`,
        `Model pointing to product with urgent gesture, encouraging expression with slight forward lean, call-to-action pose, creating sense of urgency and recommendation`
      ];

      const defaultBackgrounds = [
        `Professional workshop setting with wood materials in background, warm lighting, tools visible, authentic craftsman environment`,
        `Home workshop or garage setting, personal and relatable environment, natural lighting, showing real-life usage context`,
        `Clean workshop with focus on product, bright lighting, minimal distractions, professional product showcase environment`
      ];

      const defaultNarrations = [
        `STOP! Kamu masih pakai produk murahan yang bikin kecewa? Lihat solusi game-changer ini!`,
        `Rasakan tekstur halus, aroma segar, suara klik yang memuaskan - semua indera dimanjakan seketika!`,
        `Hemat 50% hari ini! Stok tinggal 3, harga naik besok. Cek keranjang sekarang!`
      ];

      const defaultProduct = `Product should be prominently displayed, label clearly visible, proper positioning in hands, good lighting on product, brand name readable, consistent size and appearance across all scenes.`;

      // Use AI response or fallback to defaults, and validate gender consistency
      const rawModelDesc = modelDesc || defaultModel;
      const finalModelDesc = validateGenderConsistency(rawModelDesc);
      const finalScene1 = scene1Match ? scene1Match[1].trim() : defaultScenes[0];
      const finalBackground1 = background1Match ? background1Match[1].trim() : defaultBackgrounds[0];
      const finalNarasi1 = narasi1Match ? narasi1Match[1].trim() : defaultNarrations[0];
      const finalScene2 = scene2Match ? scene2Match[1].trim() : defaultScenes[1];
      const finalBackground2 = background2Match ? background2Match[1].trim() : defaultBackgrounds[1];
      const finalNarasi2 = narasi2Match ? narasi2Match[1].trim() : defaultNarrations[1];
      const finalScene3 = scene3Match ? scene3Match[1].trim() : defaultScenes[2];
      const finalBackground3 = background3Match ? background3Match[1].trim() : defaultBackgrounds[2];
      const finalNarasi3 = narasi3Match ? narasi3Match[1].trim() : defaultNarrations[2];
      const finalProduct = productMatch ? productMatch[1].trim() : defaultProduct;

      // Build simple analysis display
      let fullAnalysis = `📊 ${analysis || 'Produk telah dianalisis dan form telah diisi dengan rekomendasi terbaik.'}\n\n`;
      fullAnalysis += `🎭 MODEL: ${finalModelDesc.substring(0, 100)}...\n\n`;
      fullAnalysis += `🎬 3 ADEGAN TELAH DISIAPKAN\n`;
      fullAnalysis += `📦 PRODUK: ${finalProduct}`;

      // Extract or generate product description for the new field
      const productDescMatch = response.match(/DESKRIPSI_PRODUK:\s*(.*?)(?=MODEL:|SCENE:|$)/s);
      const finalProductDesc = productDescMatch ? productDescMatch[1].trim() :
        `Produk berkualitas tinggi dengan manfaat terbaik untuk kebutuhan sehari-hari, terpercaya dan telah terbukti memberikan hasil optimal.`;

      // Fill ALL the form fields including AI-generated narrations
      setModelDescription(finalModelDesc);
      setScene1(finalScene1);
      setBackground1(finalBackground1);
      setNarration1(finalNarasi1);
      setScene2(finalScene2);
      setBackground2(finalBackground2);
      setNarration2(finalNarasi2);
      setScene3(finalScene3);
      setBackground3(finalBackground3);
      setNarration3(finalNarasi3);
      setProductNotes(finalProduct);
      setEditableProductDescription(finalProductDesc);

      // Set analysis for display
      setVidabotAnalysis(fullAnalysis);

    } catch (error) {
      console.error('VIDABOT assist error:', error);
      setError('Gagal menganalisis produk. Silakan coba lagi.');
    } finally {
      setIsVidabotAssisting(false);
    }
  };

  const handleGenerateScene = async (sceneNumber) => {
    if (!apiKey) {
      setError('Please set your Gemini API key in settings first');
      return;
    }

    // Validasi deskripsi model (bisa dari manual atau dari foto)
    const currentModelDescription = photoDescription || modelDescription;
    if (!currentModelDescription.trim()) {
      setError('Please fill the model description or upload a model photo first');
      return;
    }

    let sceneDesc, backgroundDesc;
    switch(sceneNumber) {
      case 1:
        sceneDesc = scene1;
        backgroundDesc = background1;
        break;
      case 2:
        sceneDesc = scene2;
        backgroundDesc = background2;
        break;
      case 3:
        sceneDesc = scene3;
        backgroundDesc = background3;
        break;
      default:
        return;
    }

    if (!sceneDesc.trim() || !backgroundDesc.trim()) {
      setError(`Please fill scene ${sceneNumber} description and background`);
      return;
    }

    setGeneratingScene(sceneNumber);
    setError(null);
    setLoadingMessage(`Generating model image for scene ${sceneNumber}...`);

    console.log('🚀 Starting scene generation:', sceneNumber);
    console.log('🔑 API Key present:', !!apiKey);
    console.log('🔑 API Key length:', apiKey?.length);

    try {
      // Gunakan deskripsi dari foto jika ada, jika tidak gunakan deskripsi manual
      const currentModelDescription = photoDescription || modelDescription;

      // Create character-consistent description with reference to previous scenes
      const baseCharacter = `CRITICAL: Use EXACT SAME CHARACTER as previous scenes - ${currentModelDescription}`;

      const enhancedDescription = `${baseCharacter}

SCENE REQUIREMENTS:
- Character: IDENTICAL person from previous scenes (same face, hair, eyes, nose, skin tone, body build)
- Pose: ${sceneDesc}
- Background: ${backgroundDesc}
- Product: ${productNotes || 'the featured product'} - SAME SIZE and POSITION as original

CONSISTENCY RULES:
1. Face must be IDENTICAL: same facial features, skin tone, hair style
2. Body must be IDENTICAL: same build, height, proportions
3. Clothing can vary but should match character profession
4. Product must be SAME SIZE and clearly visible
5. Professional photography quality with natural lighting

OUTPUT: Commercial-grade product photo with CONSISTENT CHARACTER across all scenes.`;

      // Create updated analysis result with editable values
      const updatedAnalysisResult = {
        produk: editableProduk || analysisResult.produk,
        model: editableModel || analysisResult.model,
        latar: editableLatar || analysisResult.latar
      };

      console.log('🎯 Enhanced Description being sent to API:', enhancedDescription);
      console.log('📊 Updated Analysis Result:', updatedAnalysisResult);

      // Tentukan gambar referensi berdasarkan apakah ada foto yang diupload
      let referenceImageForConsistency = null;
      let baseImageForGeneration = originalImage;

      if (photoPreview) {
        // Jika ada foto model yang diupload
        if (sceneNumber === 1) {
          // Scene 1: gunakan foto yang diupload sebagai referensi
          referenceImageForConsistency = photoPreview;
          baseImageForGeneration = originalImage; // tetap gunakan originalImage untuk produk
        } else {
          // Scene 2 dan 3: gunakan Scene 1 yang sudah digenerate untuk konsistensi
          referenceImageForConsistency = generatedImages.scene1 || photoPreview;
          baseImageForGeneration = originalImage;
        }
      } else {
        // Tidak ada foto: gunakan logika lama
        referenceImageForConsistency = sceneNumber > 1 && generatedImages.scene1 ? generatedImages.scene1 : null;
        baseImageForGeneration = originalImage;
      }

      // Generate image using the same function as before
      const generatedImageData = await generateModelImageWithGemini(
        baseImageForGeneration,
        updatedAnalysisResult,
        enhancedDescription,
        apiKey,
        referenceImageForConsistency, // use appropriate reference for consistency
        { face: false, clothing: true, background: true }, // keep face consistent, allow clothing/bg changes
        sceneNumber > 1 || photoPreview // use revision mode for Scene 2 and 3, or when using photo
      );

      setGeneratedImages(prev => ({
        ...prev,
        [`scene${sceneNumber}`]: generatedImageData
      }));

      // Generate Veo3 prompt for this scene
      generateVeo3Prompt(sceneNumber, sceneDesc, backgroundDesc);

      setLoadingMessage('');

      // Auto-scroll to show the generated image after a short delay
      setTimeout(() => {
        const sceneElement = document.getElementById(`scene-${sceneNumber}-result`);
        if (sceneElement) {
          sceneElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        } else {
          // Fallback: scroll down by viewport height
          window.scrollBy({
            top: window.innerHeight * 0.5,
            behavior: 'smooth'
          });
        }
      }, 500);
    } catch (error) {
      console.error('Generation error:', error);

      // Enhanced error handling
      if (error.message.includes('API key not valid')) {
        setError('API Key tidak valid atau tidak memiliki akses ke image generation. Periksa pengaturan API Key.');
      } else if (error.message.includes('quota exceeded') || error.message.includes('429')) {
        setError('Quota API habis. Coba lagi nanti atau upgrade akun Gemini Anda.');
      } else if (error.message.includes('503') || error.message.includes('overloaded')) {
        setError('🔄 Server Gemini sedang overload. Sistem telah mencoba beberapa kali secara otomatis. Silakan tunggu 1-2 menit dan coba lagi.');
      } else if (error.message.includes('timeout')) {
        setError('Request timeout. Coba lagi dalam beberapa saat.');
      } else {
        setError(error.message || 'Failed to generate image');
      }

      setLoadingMessage('');
    } finally {
      setGeneratingScene(null);
    }
  };

  // Generate Veo3 prompt for consistent video generation
  const generateVeo3Prompt = (sceneNumber, sceneDesc, backgroundDesc) => {
    // Use photoDescription if available, otherwise use modelDescription
    const currentModelDescription = photoDescription || modelDescription;

    // Extract gender from model description to ensure consistency
    const modelDescLower = currentModelDescription.toLowerCase();
    const isWoman = modelDescLower.includes('woman') || modelDescLower.includes('female') || modelDescLower.includes('perempuan') || modelDescLower.includes('wanita');
    const isMale = modelDescLower.includes('man') || modelDescLower.includes('male') || modelDescLower.includes('pria') || modelDescLower.includes('laki-laki');

    // Clean model description - remove any conflicting gender terms
    let cleanModelDesc = currentModelDescription;
    if (isWoman) {
      cleanModelDesc = cleanModelDesc.replace(/\b(man|male|pria|laki-laki)\b/gi, '');
    } else if (isMale) {
      cleanModelDesc = cleanModelDesc.replace(/\b(woman|female|perempuan|wanita)\b/gi, '');
    }

    // Clean up extra spaces and commas
    cleanModelDesc = cleanModelDesc.replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();

    let sceneType, cameraMovement, narrationText, voiceStyle;

    switch(sceneNumber) {
      case 1:
        sceneType = "HOOK";
        cameraMovement = "Medium shot, slight zoom in to product, steady camera";
        narrationText = narration1 || "Perhatian! Sebagai profesional, saya akan tunjukkan produk terbaik!";
        voiceStyle = "Confident, professional, attention-grabbing";
        break;
      case 2:
        sceneType = "STORY";
        cameraMovement = "Close-up on hands demonstrating product, smooth pan to face showing satisfaction";
        narrationText = narration2 || "Sejak pakai produk ini, hasil kerja saya jauh lebih memuaskan!";
        voiceStyle = "Satisfied, testimonial, genuine";
        break;
      case 3:
        sceneType = "CTA";
        cameraMovement = "Medium shot with slight push-in, focus on product and gesture";
        narrationText = narration3 || "Jangan sampai kehabisan! Buruan cek keranjang sekarang!";
        voiceStyle = "Urgent, persuasive, call-to-action";
        break;
      default:
        return;
    }

    const veo3Prompt = `🎥 Prompt Visual (Scene ${sceneNumber} - ${sceneType}):
${cleanModelDesc}, ${sceneDesc} in ${backgroundDesc}. The person maintains EXACT same facial features, hair style, skin tone, and body build as previous scenes. ${sceneNumber === 1 ? 'This is the first scene establishing the character.' : `Character consistency: IDENTICAL to Scene 1 - same person, same facial features, same hair, same skin tone.`}

🎙 Lip Sync (in Indonesian):
"${narrationText}"

🎙 Voice Style: ${voiceStyle}
🎥 Camera: ${cameraMovement}
💡 Lighting: Professional commercial lighting, bright and even
🎞 Style: Professional commercial video, realistic movements, natural expressions
🔻 Negative Prompt: blurry face, glitch, double face, bad hand, distorted proportions, overlay text, subtitle, watermark, different person, inconsistent character, face change, gender change`;

    setVeo3Prompts(prev => ({
      ...prev,
      [`scene${sceneNumber}`]: veo3Prompt
    }));
  };

  // Video generation function with real VEO3 API
  const handleCreateVideo = async (sceneNumber) => {
    const sceneKey = `scene${sceneNumber}`;
    const prompt = veo3Prompts[sceneKey];
    const referenceImageUrl = generatedImages[sceneKey];

    console.log('🎬 Starting video generation for Scene', sceneNumber, {
      hasPrompt: !!prompt,
      hasReferenceImage: !!referenceImageUrl,
      referenceImageUrl: referenceImageUrl
    });

    if (!prompt) {
      setVideoGenerationStatus(prev => ({
        ...prev,
        [sceneKey]: 'Error: Prompt tidak ditemukan! Generate gambar terlebih dahulu.'
      }));
      // Clear any existing video data for this scene
      setGeneratedVideos(prev => ({
        ...prev,
        [sceneKey]: null
      }));
      return;
    }

    if (!referenceImageUrl) {
      setVideoGenerationStatus(prev => ({
        ...prev,
        [sceneKey]: 'Error: Gambar referensi tidak ditemukan! Generate gambar terlebih dahulu.'
      }));
      // Clear any existing video data for this scene
      setGeneratedVideos(prev => ({
        ...prev,
        [sceneKey]: null
      }));
      return;
    }

    // Video generation requires separate Video API Key (no fallback to Gemini API Key)
    if (!videoApiKey || videoApiKey.trim() === '') {
      setVideoGenerationStatus(prev => ({
        ...prev,
        [sceneKey]: 'Error: Video API Key diperlukan! Video generation membutuhkan API Key terpisah dari Gemini.'
      }));
      // Clear any existing video data for this scene
      setGeneratedVideos(prev => ({
        ...prev,
        [sceneKey]: null
      }));
      // Show video API tutorial for missing key
      setTimeout(() => setShowVideoAPITutorial(true), 1000);
      return;
    }

    if (!realVeo3Service.validateApiKey(videoApiKey)) {
      setVideoGenerationStatus(prev => ({
        ...prev,
        [sceneKey]: 'Error: Video API Key tidak valid! Format harus AIza... dengan minimal 20 karakter.'
      }));
      // Clear any existing video data for this scene
      setGeneratedVideos(prev => ({
        ...prev,
        [sceneKey]: null
      }));
      // Show video API tutorial for invalid key
      setTimeout(() => setShowVideoAPITutorial(true), 1000);
      return;
    }

    // Test Video API Key before proceeding
    console.log('🔍 Testing Video API Key before generation...');
    setVideoGenerationStatus(prev => ({
      ...prev,
      [sceneKey]: '🔍 Testing Video API Key...'
    }));

    try {
      const apiKeyTest = await realVeo3Service.testApiKey(videoApiKey);
      console.log('🔍 Video API Key test result:', apiKeyTest);

      if (!apiKeyTest) {
        setVideoGenerationStatus(prev => ({
          ...prev,
          [sceneKey]: 'Error: Video API Key tidak dapat terhubung ke server! Periksa koneksi internet dan API Key.'
        }));
        // Clear any existing video data for this scene
        setGeneratedVideos(prev => ({
          ...prev,
          [sceneKey]: null
        }));
        // Show video API tutorial for connection error
        setTimeout(() => setShowVideoAPITutorial(true), 1000);
        return;
      }

      console.log('✅ Video API Key test passed, proceeding with generation...');
    } catch (testError) {
      console.error('❌ Video API Key test failed:', testError);
      setVideoGenerationStatus(prev => ({
        ...prev,
        [sceneKey]: 'Error: Gagal test Video API Key! ' + testError.message
      }));
      // Clear any existing video data for this scene
      setGeneratedVideos(prev => ({
        ...prev,
        [sceneKey]: null
      }));
      // Show video API tutorial for test error
      setTimeout(() => setShowVideoAPITutorial(true), 1000);
      return;
    }

    try {
      // Set loading state
      setIsGeneratingVideo(prev => ({
        ...prev,
        [sceneKey]: true
      }));

      setVideoProgress(prev => ({
        ...prev,
        [sceneKey]: 0
      }));

      // Video configuration
      const config = {
        aspectRatio: '16:9',
        enableSound: false,
        resolution: '720p'
      };

      // Progress tracking with detailed steps (following Filament pattern)
      const progressSteps = [
        { progress: 10, status: '🚀 Initializing video generation...' },
        { progress: 25, status: '🧠 Processing prompt and parameters...' },
        { progress: 40, status: '🖼️ Preparing reference image...' },
        { progress: 60, status: '🎬 Sending request to VEO3 API...' },
        { progress: 80, status: '⚡ AI generating video content...' },
        { progress: 95, status: '🎯 Finalizing video output...' },
        { progress: 100, status: '✅ Video generation complete!' }
      ];

      const updateProgress = (stepIndex) => {
        const step = progressSteps[stepIndex];
        if (step) {
          setVideoProgress(prev => ({
            ...prev,
            [sceneKey]: step.progress
          }));
          setVideoGenerationStatus(prev => ({
            ...prev,
            [sceneKey]: step.status
          }));
        }
      };

      // Step 1: Initialize
      updateProgress(0);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Process prompt
      updateProgress(1);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Prepare reference image
      let referenceImageFile = null;
      if (referenceImageUrl) {
        updateProgress(2);
        console.log('🖼️ Processing reference image:', referenceImageUrl);
        try {
          const response = await fetch(referenceImageUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
          }
          const blob = await response.blob();
          console.log('✅ Reference image blob created:', {
            size: blob.size,
            type: blob.type
          });
          referenceImageFile = {
            file: new File([blob], `scene${sceneNumber}_reference.png`, { type: 'image/png' })
          };
          console.log('✅ Reference image file prepared for VEO3');
        } catch (error) {
          console.error('❌ Failed to process reference image:', error);
          setVideoGenerationStatus(prev => ({
            ...prev,
            [sceneKey]: `Error: Gagal memproses gambar referensi - ${error.message}`
          }));
          setIsGeneratingVideo(prev => ({
            ...prev,
            [sceneKey]: false
          }));
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.warn('⚠️ No reference image URL provided - will use text-to-video mode');
      }

      // Step 4: Send to VEO3 API
      updateProgress(3);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 5: Generate video
      updateProgress(4);

      // Log detailed information
      console.log('🚀 Starting video generation with VEO3...');
      console.log('📋 Generation Parameters:', {
        scene: sceneNumber,
        prompt: prompt,
        hasReferenceImage: !!referenceImageFile,
        referenceImageSize: referenceImageFile?.file?.size,
        config: config,
        videoApiKeyPresent: !!videoApiKey,
        videoApiKeyLength: videoApiKey?.length || 0,
        videoApiKeyPrefix: videoApiKey ? videoApiKey.substring(0, 10) + '...' : 'null',
        mode: referenceImageFile ? 'IMAGE-TO-VIDEO' : 'TEXT-TO-VIDEO',
        separateApiKeyRequired: true
      });

      // Use real VEO3 generation via Node.js bridge
      console.log('🚀 Attempting VEO3 generation via Node.js bridge...');
      console.log('🎯 Mode:', referenceImageFile ? '🖼️ IMAGE-TO-VIDEO' : '📝 TEXT-TO-VIDEO');

      const result = await realVeo3Service.generate({
        prompt,
        referenceImage: referenceImageFile,
        config,
        apiKey: videoApiKey  // Always use Video API Key (no fallback)
      });

      // Step 6: Processing result
      updateProgress(5);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 7: Complete
      updateProgress(6);

      console.log('✅ VEO3 API Response received:', {
        success: result?.success,
        hasVideoData: !!result?.videoData,
        videoDataLength: result?.videoData?.length,
        hasVideoUrl: !!(result?.videoUrl || result?.video_url),
        responseKeys: result ? Object.keys(result) : []
      });

      if (result && result.success) {
        // Convert base64 videoData to blob URL if needed
        let videoUrl = result.videoUrl || result.video_url;

        console.log('🔍 Video URL check:', {
          hasExistingUrl: !!videoUrl,
          hasVideoData: !!result.videoData,
          videoDataLength: result.videoData?.length
        });

        if (result.videoData && !videoUrl) {
          console.log('🎬 Converting base64 videoData to blob URL...');
          console.log('📊 VideoData info:', {
            length: result.videoData.length,
            firstChars: result.videoData.substring(0, 50),
            isBase64: /^[A-Za-z0-9+/]*={0,2}$/.test(result.videoData.substring(0, 100))
          });

          try {
            // Convert base64 to blob
            const byteCharacters = atob(result.videoData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'video/mp4' });
            videoUrl = URL.createObjectURL(blob);
            console.log('✅ Video blob URL created successfully:', {
              url: videoUrl,
              blobSize: blob.size,
              blobType: blob.type
            });
          } catch (error) {
            console.error('❌ Error converting videoData to blob:', {
              error: error.message,
              videoDataLength: result.videoData?.length,
              videoDataSample: result.videoData?.substring(0, 100)
            });
          }
        } else if (videoUrl) {
          console.log('✅ Using existing video URL:', videoUrl);
        } else {
          console.warn('⚠️ No video data or URL found in response!');
        }

        // Store generated video (following Filament pattern)
        const videoData = {
          url: videoUrl,
          filename: `scene${sceneNumber}_video_${Date.now()}.mp4`,
          thumbnail: result.thumbnail_url || 'https://via.placeholder.com/640x360/4F46E5/FFFFFF?text=VEO3+Generated',
          duration: result.duration || 8,
          jobId: result.job_id || result.id || `job_${Date.now()}`,
          createdAt: result.created_at || new Date().toISOString(),
          description: result.description || `Video generated using VEO3 for Scene ${sceneNumber}`,
          enhanced_prompt: result.enhanced_prompt || prompt,
          used_imagen: result.used_imagen || !referenceImageFile,
          video_file: result.video_file || result.file || `scene${sceneNumber}_video.mp4`,
          status: 'completed',
          sceneName: `Scene ${sceneNumber}`,
          prompt: prompt
        };

        console.log('📹 Generated Video Data:', videoData);

        setGeneratedVideos(prev => ({
          ...prev,
          [sceneKey]: videoData
        }));

        console.log(`🎉 Video generation completed successfully for Scene ${sceneNumber}!`);

        // Clear progress after success
        setTimeout(() => {
          setVideoProgress(prev => ({
            ...prev,
            [sceneKey]: 0
          }));
        }, 2000);

      } else {
        throw new Error(result?.error || result?.message || 'Video generation failed');
      }

    } catch (error) {
      console.error('❌ Video generation error for Scene', sceneNumber, ':', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      let errorMessage = 'Video generation failed';

      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error - API tidak dapat diakses';
        console.error('🌐 Network Error: VEO3 API endpoint tidak dapat diakses');
      } else if (error.message.includes('VEO 3 API access denied') || error.message.includes('PERMISSION_DENIED')) {
        errorMessage = '🚫 VEO 3 Access Denied: API key Anda belum memiliki akses ke VEO 3 preview. Silakan request akses di Google AI Studio atau gunakan API key yang sudah memiliki akses VEO 3.';
        console.error('🔐 VEO3 Permission Error: API key does not have VEO 3 access');
        // Show video API tutorial for access issues
        setTimeout(() => setShowVideoAPITutorial(true), 1000);
      } else if (error.message.includes('API_KEY_INVALID') || error.message.includes('Invalid API key')) {
        errorMessage = 'API Key tidak valid untuk generate video';
        console.error('🔑 API Key Error: Invalid or expired API key');
        // Show video API tutorial for invalid key
        setTimeout(() => setShowVideoAPITutorial(true), 1000);
      } else if (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('quota exceeded') || error.message.includes('API quota exceeded')) {
        errorMessage = '📊 API quota exceeded - Perlu upgrade plan atau ganti API key';
        console.error('📊 Quota Error: API usage limit reached');
        // Show video API tutorial for quota issues (user might need different API key)
        setTimeout(() => setShowVideoAPITutorial(true), 1000);
      } else if (error.message.includes('No result received from bridge server')) {
        errorMessage = '🔌 Bridge server error - Kemungkinan masalah API key atau koneksi';
        console.error('🔌 Bridge Error: No result from server');
        // Show video API tutorial for bridge server issues
        setTimeout(() => setShowVideoAPITutorial(true), 1000);
      } else {
        errorMessage = error.message;
        // For any other API-related errors, also show tutorial
        if (error.message.toLowerCase().includes('api') || error.message.toLowerCase().includes('key') || error.message.toLowerCase().includes('auth')) {
          setTimeout(() => setShowVideoAPITutorial(true), 1000);
        }
      }

      setVideoGenerationStatus(prev => ({
        ...prev,
        [sceneKey]: `Error: ${errorMessage}`
      }));

      setVideoProgress(prev => ({
        ...prev,
        [sceneKey]: 0
      }));

      // Clear any existing video data for this scene when there's an error
      setGeneratedVideos(prev => ({
        ...prev,
        [sceneKey]: null
      }));

    } finally {
      // Clear loading state
      setIsGeneratingVideo(prev => ({
        ...prev,
        [sceneKey]: false
      }));

      console.log(`🏁 Video generation process finished for Scene ${sceneNumber}`);
    }
  };

  // This function is no longer used - we use individual scene generation instead

  return (
    <div className="bg-gradient-to-br from-tiktok-white to-modern-gray-50 rounded-2xl shadow-2xl p-6 sm:p-8 border border-tiktok-pink/20">
      {/* Aspect Ratio Toggle */}
      <div className="mb-6 flex justify-center">
        <div className="bg-white rounded-lg p-1 shadow-md border border-gray-200">
          <div className="flex space-x-1">
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                aspectRatio === '16:9'
                  ? 'bg-gradient-to-r from-tiktok-pink to-shopee-orange text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              🖥️ Landscape 16:9
            </button>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                aspectRatio === '9:16'
                  ? 'bg-gradient-to-r from-tiktok-pink to-shopee-orange text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              📱 Portrait 9:16
            </button>
          </div>
        </div>
      </div>

      {/* VEO 3 Info Box */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-2xl">🎬</span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-modern-gray-800 mb-1">VEO 3 Video Generation Requirements</h4>
            <p className="text-xs text-modern-gray-700 mb-2">
              VEO 3 adalah model AI video terbaru dari Google yang masih dalam tahap preview dan memerlukan akses khusus.
            </p>
            {/* Production Info */}
            {(process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost') && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <div className="flex items-center">
                  <span className="text-green-600 text-lg mr-2">✅</span>
                  <div>
                    <p className="text-xs font-semibold text-green-800">Production Mode - Vercel API</p>
                    <p className="text-xs text-green-700">
                      Video generation menggunakan Vercel API Routes. Fitur demo tersedia untuk testing, 
                      video generation penuh tersedia jika API key memiliki akses VEO3.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="text-xs text-modern-gray-600 space-y-1">
              <div>• ✅ API Key harus memiliki akses VEO 3 preview dari Google AI Studio</div>
              <div>• ✅ Request akses di: <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-tiktok-pink font-medium">Google AI Studio</a></div>
              <div>• ✅ Jika belum ada akses, sistem akan menggunakan mock generation untuk testing</div>
              {(process.env.NODE_ENV !== 'production' && window.location.hostname === 'localhost') && (
                <div>• 🔧 Untuk video generation penuh, pastikan bridge server berjalan di localhost:3005</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Layout Baru: 1 (Original Photo) di kiri, 2 (Analysis) di kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        {/* 1. Original Photo - Kiri */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Original Photo</h3>
          <div className="relative">
            <img
              src={originalImage}
              alt="Original"
              className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md bg-gray-50"
            />
          </div>
        </div>

        {/* 2. Analysis - Kanan */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Analysis</h3>
          <div className="space-y-2 text-sm">
            <div className="bg-gradient-to-r from-tiktok-cyan/10 to-tiktok-cyan/5 p-3 rounded-xl border border-tiktok-cyan/20">
              <strong className="text-tiktok-cyan font-semibold">📦 Produk:</strong>
              <input
                type="text"
                value={editableProduk}
                onChange={(e) => setEditableProduk(e.target.value)}
                className="w-full mt-2 p-2 border border-tiktok-cyan/30 rounded-lg text-sm bg-white focus:border-tiktok-cyan focus:ring-2 focus:ring-tiktok-cyan/20 transition-all"
                placeholder="Deskripsi produk..."
              />
            </div>
            <div className="bg-gradient-to-r from-shopee-orange/10 to-shopee-orange/5 p-3 rounded-xl border border-shopee-orange/20">
              <strong className="text-shopee-orange font-semibold">👤 Model:</strong>
              <input
                type="text"
                value={editableModel}
                onChange={(e) => setEditableModel(e.target.value)}
                className="w-full mt-2 p-2 border border-shopee-orange/30 rounded-lg text-sm bg-white focus:border-shopee-orange focus:ring-2 focus:ring-shopee-orange/20 transition-all"
                placeholder="Deskripsi model..."
              />
            </div>
            <div className="bg-gradient-to-r from-tiktok-pink/10 to-tiktok-pink/5 p-3 rounded-xl border border-tiktok-pink/20">
              <strong className="text-tiktok-pink font-semibold">🏞️ Latar:</strong>
              <input
                type="text"
                value={editableLatar}
                onChange={(e) => setEditableLatar(e.target.value)}
                className="w-full mt-2 p-2 border border-tiktok-pink/30 rounded-lg text-sm bg-white focus:border-tiktok-pink focus:ring-2 focus:ring-tiktok-pink/20 transition-all"
                placeholder="Deskripsi latar belakang..."
              />
            </div>
            <div className="bg-gradient-to-r from-shopee-red/10 to-shopee-red/5 p-3 rounded-xl border border-shopee-red/20">
              <strong className="text-shopee-red font-semibold">📝 Deskripsi Singkat Produk:</strong>
              <input
                type="text"
                value={editableProductDescription}
                onChange={(e) => setEditableProductDescription(e.target.value)}
                className="w-full mt-1 p-1 border border-orange-200 rounded text-sm bg-white"
                placeholder="Manfaat, fitur, atau keunggulan produk (opsional)..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Create New Model - Di bawah 1 dan 2 */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-3">Create New Model</h3>

        {/* Input Section */}
        <div>
          <div className="space-y-4">
            {/* VIDABOT Helper Button */}
            <div className="mb-6">
                  <button
                    onClick={handleVidabotAssist}
                    disabled={isVidabotAssisting}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <span className="text-lg">🤖</span>
                    <span>
                      {isVidabotAssisting ? 'VIDABOT sedang menganalisis...' : 'Dibantu VIDABOT'}
                    </span>
                    {isVidabotAssisting && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    )}
                  </button>
                </div>

                {/* VIDABOT Analysis Results - Collapsible */}
                {vidabotAnalysis && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setShowVidabotAnalysis(!showVidabotAnalysis)}
                    >
                      <div className="flex items-center">
                        <span className="text-lg mr-2">🤖</span>
                        <h3 className="font-semibold text-purple-800">Analisis VIDABOT</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 rounded transition-colors">
                          {showVidabotAnalysis ? 'Sembunyikan' : 'Lihat Detail'}
                        </button>
                        <span className={`transform transition-transform ${showVidabotAnalysis ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </div>
                    {showVidabotAnalysis && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200 text-sm text-modern-gray-700 whitespace-pre-line leading-relaxed">
                        {vidabotAnalysis}
                      </div>
                    )}
                  </div>
                )}

                {/* Model Description */}
                <div>
                  <label className="block text-sm font-semibold text-modern-gray-700 mb-3">
                    1. Deskripsi Model
                  </label>

                  {/* Upload Photo Option */}
                  <div className="mb-4 p-4 bg-gradient-to-r from-tiktok-cyan/5 to-shopee-orange/5 rounded-xl border border-tiktok-cyan/20">
                    <div className="flex items-center mb-3">
                      <span className="text-sm font-semibold text-tiktok-cyan">💡 Upload foto model untuk deskripsi otomatis</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="model-photo-upload"
                      />
                      <label
                        htmlFor="model-photo-upload"
                        className="cursor-pointer bg-gradient-to-r from-tiktok-cyan to-shopee-orange hover:from-tiktok-cyan-light hover:to-shopee-orange-light text-white text-sm px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-tiktok-cyan/30 transform hover:scale-105"
                      >
                        <span>📷</span>
                        <span>Upload Foto Model</span>
                      </label>
                      {photoPreview && (
                        <span className="text-sm text-tiktok-cyan flex items-center space-x-1 font-medium">
                          <span>✅</span>
                          <span>Foto berhasil diupload</span>
                        </span>
                      )}
                    </div>
                    {photoPreview && (
                      <div className="mt-4 p-4 bg-white rounded-xl border border-tiktok-cyan/30 shadow-lg">
                        <div className="text-center">
                          <img
                            src={photoPreview}
                            alt="Model Preview"
                            className="w-32 h-32 mx-auto object-cover rounded-xl border border-tiktok-pink/20 shadow-md mb-3"
                          />
                          <button
                            onClick={() => {
                              setPhotoPreview(null);
                              setUploadedPhoto(null);
                              setPhotoDescription('');
                            }}
                            className="text-sm text-shopee-red hover:text-red-700 font-medium transition-colors bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg"
                          >
                            🗑️ Hapus foto
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Analysis Loading */}
                  {isAnalyzingPhoto && (
                    <div className="mb-4 bg-gradient-to-r from-tiktok-cyan/10 to-shopee-orange/10 p-4 rounded-xl border border-tiktok-cyan/30">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-tiktok-cyan border-t-transparent"></div>
                        <span className="text-sm text-tiktok-cyan font-medium">Menganalisis foto model...</span>
                      </div>
                    </div>
                  )}

                  <textarea
                    value={photoDescription || modelDescription}
                    onChange={(e) => {
                      if (photoDescription) {
                        setPhotoDescription(e.target.value);
                      } else {
                        setModelDescription(e.target.value);
                      }
                    }}
                    placeholder="Contoh: A formal Indonesian young man, around 23 years old, slim and proportional body, oval-shaped face with smooth fair complexion, almond-shaped dark brown eyes, medium-sized straight nose, wearing formal black suit jacket with white shirt and black necktie..."
                    className="w-full h-32 p-4 border border-tiktok-pink/30 rounded-xl focus:ring-2 focus:ring-tiktok-pink/50 focus:border-tiktok-pink transition-all bg-white shadow-sm resize-none text-sm"
                  />
                  {photoDescription && (
                    <p className="text-xs text-tiktok-cyan font-medium mt-2 bg-tiktok-cyan/5 p-2 rounded-lg">
                      💡 Deskripsi ini dibuat otomatis dari foto yang diupload. Anda bisa mengeditnya sesuai kebutuhan.
                    </p>
                  )}
                </div>

                {/* Product Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    2. Catatan Tentang Produk
                  </label>
                  <textarea
                    value={productNotes}
                    onChange={(e) => setProductNotes(e.target.value)}
                    placeholder="Contoh: ukuran botol 500ml, warna label hijau, logo terlihat jelas, posisi produk di tangan kanan"
                    className="w-full h-20 p-3 border border-tiktok-pink/30 rounded-xl focus:ring-2 focus:ring-tiktok-pink/50 focus:border-tiktok-pink transition-all bg-white shadow-sm resize-none text-sm"
                  />
                </div>

                {/* 4. Scene 1, 2, dan 3 - Layout 3 Kolom */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Scene 1 - HOOK - Kiri */}
                  <div className="bg-gradient-to-br from-tiktok-cyan/10 to-tiktok-cyan/5 p-4 rounded-xl border border-tiktok-cyan/30 shadow-lg">
                    <div
                      className="flex items-center justify-between cursor-pointer mb-3"
                      onClick={() => setShowSceneDetails(prev => ({...prev, scene1: !prev.scene1}))}
                    >
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-semibold text-tiktok-cyan">
                          🎯 Adegan #1 - HOOK
                        </label>
                        {scene1 && background1 && narration1 && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            ✓ Lengkap
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-tiktok-cyan/20 text-tiktok-cyan px-2 py-1 rounded-lg font-medium">
                          {showSceneDetails.scene1 ? 'Sembunyikan' : 'Edit Detail'}
                        </span>
                        <span className={`transform transition-transform text-tiktok-cyan ${showSceneDetails.scene1 ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* Preview when collapsed */}
                    {!showSceneDetails.scene1 && (scene1 || background1 || narration1) && (
                      <div className="mb-3 p-2 bg-tiktok-cyan/5 rounded-lg border border-tiktok-cyan/10">
                        <div className="text-xs text-gray-600 space-y-1">
                          {scene1 && <div><span className="font-medium">Adegan:</span> {scene1.substring(0, 50)}{scene1.length > 50 ? '...' : ''}</div>}
                          {background1 && <div><span className="font-medium">Latar:</span> {background1.substring(0, 50)}{background1.length > 50 ? '...' : ''}</div>}
                          {narration1 && <div><span className="font-medium">Narasi:</span> {narration1.substring(0, 50)}{narration1.length > 50 ? '...' : ''}</div>}
                        </div>
                      </div>
                    )}

                  {showSceneDetails.scene1 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Adegan:</label>
                      <textarea
                        value={scene1}
                        onChange={(e) => setScene1(e.target.value)}
                        placeholder="Contoh: sedang memegang produk dengan senyum percaya diri, pose profesional"
                        className="w-full h-16 p-2 border border-gray-300 rounded text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Latar:</label>
                      <textarea
                        value={background1}
                        onChange={(e) => setBackground1(e.target.value)}
                        placeholder="Contoh: di ruangan kantor modern, dinding putih bersih, pencahayaan natural"
                        className="w-full h-16 p-2 border border-gray-300 rounded text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Narasi HOOK:</label>
                      <textarea
                        value={narration1}
                        onChange={(e) => setNarration1(e.target.value)}
                        placeholder="STOP! Masih pakai produk murahan? Lihat solusi game-changer yang bikin hidup berubah total!"
                        className="w-full h-12 p-2 border border-gray-300 rounded text-sm resize-none"
                      />
                    </div>
                  </div>
                  )}
                  <button
                    onClick={() => handleGenerateScene(1)}
                    disabled={
                      generatingScene === 1 ||
                      !scene1.trim() ||
                      !background1.trim() ||
                      !(photoDescription || modelDescription).trim()
                    }
                    className="w-full mt-3 bg-gradient-to-r from-tiktok-pink to-shopee-orange hover:from-tiktok-pink-light hover:to-shopee-orange-light disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-tiktok-pink/30 transform hover:scale-105"
                  >
                    {generatingScene === 1 ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <span>🎬 Buat Gambar Model #1</span>
                    )}
                  </button>
                  {generatedImages.scene1 && (
                    <div id="scene-1-result" className="mt-3 space-y-3">
                      <img src={generatedImages.scene1} alt="Generated Scene 1" className="w-full rounded-lg border" />

                      {/* Download Button */}
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = generatedImages.scene1;
                            link.download = `scene1_image_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                        >
                          <span>📥</span>
                          <span>Download</span>
                        </button>
                      </div>

                      {veo3Prompts.scene1 && (
                        <div className="bg-gray-50 p-3 rounded border">
                          <div
                            className="flex items-center justify-between mb-2 cursor-pointer"
                            onClick={() => setShowVeo3Prompts(prev => ({...prev, scene1: !prev.scene1}))}
                          >
                            <h5 className="text-xs font-semibold text-gray-700">🎬 Veo3 Prompt (HOOK)</h5>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(veo3Prompts.scene1);
                                }}
                                className="text-xs bg-tiktok-cyan text-white px-2 py-1 rounded-lg hover:bg-tiktok-cyan-light transition-colors"
                              >
                                Copy
                              </button>
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                {showVeo3Prompts.scene1 ? 'Sembunyikan' : 'Lihat Prompt'}
                              </span>
                              <span className={`transform transition-transform text-gray-600 ${showVeo3Prompts.scene1 ? 'rotate-180' : ''}`}>
                                ▼
                              </span>
                            </div>
                          </div>
                          {showVeo3Prompts.scene1 && (
                          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">{veo3Prompts.scene1}</pre>
                          )}

                          {/* Buat Video Button */}
                          <div className="mt-3 flex flex-col items-center space-y-2">
                            {generatedImages.scene1 && (
                              <div className="text-xs text-green-600 font-semibold flex items-center space-x-1">
                                <span>🖼️➡️🎬</span>
                                <span>IMAGE-TO-VIDEO Mode</span>
                              </div>
                            )}
                            <button
                              onClick={() => handleCreateVideo(1)}
                              disabled={isGeneratingVideo.scene1 || !generatedImages.scene1}
                              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                            >
                              {isGeneratingVideo.scene1 ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                  <span>Generating...</span>
                                </>
                              ) : (
                                <>
                                  <span>🎬</span>
                                  <span>{generatedImages.scene1 ? 'Buat Video dari Gambar' : 'Generate Gambar Dulu'}</span>
                                </>
                              )}
                            </button>
                            {!generatedImages.scene1 && (
                              <div className="text-xs text-red-500 text-center">
                                ⚠️ Generate gambar terlebih dahulu untuk membuat video
                              </div>
                            )}
                          </div>

                          {/* Video Generation Progress */}
                          {isGeneratingVideo.scene1 && (
                            <div className="mt-3">
                              <div className="bg-gray-200 rounded-full h-2 mb-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${videoProgress.scene1 || 0}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-center text-gray-600">
                                {videoGenerationStatus.scene1 || 'Initializing...'}
                              </div>
                            </div>
                          )}

                          {/* Video Generation Status (when not generating) */}
                          {!isGeneratingVideo.scene1 && videoGenerationStatus.scene1 && (
                            <div className="mt-2 text-xs text-center">
                              <div className={`${videoGenerationStatus.scene1.includes('Error') ? 'text-red-600' : 'text-gray-600'} mb-2`}>
                                {videoGenerationStatus.scene1}
                              </div>
                              {/* Fix API Key Button for API-related errors */}
                              {(videoGenerationStatus.scene1.includes('API key') ||
                                videoGenerationStatus.scene1.includes('Access Denied') ||
                                videoGenerationStatus.scene1.includes('tidak valid') ||
                                videoGenerationStatus.scene1.includes('quota exceeded') ||
                                videoGenerationStatus.scene1.includes('Bridge server error') ||
                                videoGenerationStatus.scene1.includes('PERMISSION_DENIED') ||
                                videoGenerationStatus.scene1.includes('API quota')) && (
                                <button
                                  onClick={() => setShowVideoAPITutorial(true)}
                                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs px-3 py-1 rounded-lg transition-all duration-300 shadow-sm transform hover:scale-105"
                                >
                                  🔧 Fix API Key
                                </button>
                              )}
                            </div>
                          )}

                          {/* Generated Video Display */}
                          {(() => {
                            const hasVideoData = !!generatedVideos.scene1;
                            const hasError = videoGenerationStatus.scene1?.includes('Error');
                            const shouldShowVideo = hasVideoData && !hasError;

                            console.log('🎬 Video Display Decision for Scene 1:', {
                              hasVideoData,
                              hasError,
                              shouldShowVideo,
                              videoStatus: videoGenerationStatus.scene1
                            });

                            if (!shouldShowVideo) return null;

                            const videoUrl = generatedVideos.scene1.url || generatedVideos.scene1.video_url || generatedVideos.scene1.videoUrl;
                            console.log('🎬 Rendering Scene 1 video player:', {
                              hasVideoData: !!generatedVideos.scene1,
                              videoUrl: videoUrl,
                              urlType: videoUrl?.startsWith('blob:') ? 'blob' : videoUrl?.startsWith('http') ? 'http' : 'unknown',
                              allKeys: Object.keys(generatedVideos.scene1)
                            });

                            return (
                              <div className="mt-3 bg-gray-50 p-3 rounded border">
                                <h6 className="text-xs font-semibold text-gray-700 mb-2">🎬 Generated Video (Scene 1)</h6>
                                <div className="space-y-2">
                                  {videoUrl ? (
                                    <video
                                      src={videoUrl}
                                      controls
                                      className="w-full rounded"
                                      poster={generatedVideos.scene1.thumbnail}
                                      onLoadStart={() => console.log('🎬 Video load started for Scene 1')}
                                      onLoadedData={() => console.log('✅ Video data loaded for Scene 1')}
                                      onCanPlay={() => console.log('✅ Video can play for Scene 1')}
                                      onError={(e) => {
                                        console.error('❌ Video load error for Scene 1:', {
                                          error: e.target.error,
                                          videoUrl: videoUrl,
                                          networkState: e.target.networkState,
                                          readyState: e.target.readyState
                                        });
                                      }}
                                    >
                                      Your browser does not support the video tag.
                                    </video>
                                  ) : (
                                    <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-xs">
                                      ❌ No video URL found! Check console for details.
                                    </div>
                                  )}
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500">
                                    Duration: {generatedVideos.scene1.duration}s
                                  </span>
                                  <button
                                    onClick={() => {
                                      const videoUrl = generatedVideos.scene1.url || generatedVideos.scene1.video_url || generatedVideos.scene1.videoUrl;
                                      const link = document.createElement('a');
                                      link.href = videoUrl;
                                      link.download = `scene1_video_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.mp4`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                                  >
                                    📥 Download Video
                                  </button>
                                </div>
                              </div>
                            </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                  </div>

                  {/* Scene 2 - STORY - Tengah */}
                  <div className="bg-gradient-to-br from-shopee-orange/10 to-shopee-orange/5 p-4 rounded-xl border border-shopee-orange/30 shadow-lg">
                    <div
                      className="flex items-center justify-between cursor-pointer mb-3"
                      onClick={() => setShowSceneDetails(prev => ({...prev, scene2: !prev.scene2}))}
                    >
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-semibold text-shopee-orange">
                          💝 Adegan #2 - STORY
                        </label>
                        {scene2 && background2 && narration2 && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            ✓ Lengkap
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-shopee-orange/20 text-shopee-orange px-2 py-1 rounded-lg font-medium">
                          {showSceneDetails.scene2 ? 'Sembunyikan' : 'Edit Detail'}
                        </span>
                        <span className={`transform transition-transform text-shopee-orange ${showSceneDetails.scene2 ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* Preview when collapsed */}
                    {!showSceneDetails.scene2 && (scene2 || background2 || narration2) && (
                      <div className="mb-3 p-2 bg-shopee-orange/5 rounded-lg border border-shopee-orange/10">
                        <div className="text-xs text-gray-600 space-y-1">
                          {scene2 && <div><span className="font-medium">Adegan:</span> {scene2.substring(0, 50)}{scene2.length > 50 ? '...' : ''}</div>}
                          {background2 && <div><span className="font-medium">Latar:</span> {background2.substring(0, 50)}{background2.length > 50 ? '...' : ''}</div>}
                          {narration2 && <div><span className="font-medium">Narasi:</span> {narration2.substring(0, 50)}{narration2.length > 50 ? '...' : ''}</div>}
                        </div>
                      </div>
                    )}

                  {showSceneDetails.scene2 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Adegan:</label>
                      <textarea
                        value={scene2}
                        onChange={(e) => setScene2(e.target.value)}
                        placeholder="Contoh: sedang menggunakan produk dengan ekspresi puas dan bahagia"
                        className="w-full h-16 p-2 border border-gray-300 rounded text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Latar:</label>
                      <textarea
                        value={background2}
                        onChange={(e) => setBackground2(e.target.value)}
                        placeholder="Contoh: di rumah yang nyaman, ruang tamu dengan sofa, suasana hangat"
                        className="w-full h-16 p-2 border border-gray-300 rounded text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Narasi STORY:</label>
                      <textarea
                        value={narration2}
                        onChange={(e) => setNarration2(e.target.value)}
                        placeholder="Rasakan tekstur halus, aroma segar, suara klik memuaskan - semua indera dimanjakan seketika!"
                        className="w-full h-12 p-2 border border-gray-300 rounded text-sm resize-none"
                      />
                    </div>
                  </div>
                  )}
                  <button
                    onClick={() => handleGenerateScene(2)}
                    disabled={
                      generatingScene === 2 ||
                      !scene2.trim() ||
                      !background2.trim() ||
                      !(photoDescription || modelDescription).trim()
                    }
                    className="w-full mt-3 bg-gradient-to-r from-tiktok-cyan to-green-500 hover:from-tiktok-cyan-light hover:to-green-400 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-tiktok-cyan/30 transform hover:scale-105"
                  >
                    {generatingScene === 2 ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <span>🎬 Buat Gambar Model #2</span>
                    )}
                  </button>
                  {generatedImages.scene2 && (
                    <div id="scene-2-result" className="mt-3 space-y-3">
                      <img src={generatedImages.scene2} alt="Generated Scene 2" className="w-full rounded-lg border" />

                      {/* Download Button */}
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = generatedImages.scene2;
                            link.download = `scene2_image_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                        >
                          <span>📥</span>
                          <span>Download</span>
                        </button>
                      </div>

                      {veo3Prompts.scene2 && (
                        <div className="bg-gray-50 p-3 rounded border">
                          <div
                            className="flex items-center justify-between mb-2 cursor-pointer"
                            onClick={() => setShowVeo3Prompts(prev => ({...prev, scene2: !prev.scene2}))}
                          >
                            <h5 className="text-xs font-semibold text-gray-700">🎬 Veo3 Prompt (STORY)</h5>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(veo3Prompts.scene2);
                                }}
                                className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                              >
                                Copy
                              </button>
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                {showVeo3Prompts.scene2 ? 'Sembunyikan' : 'Lihat Prompt'}
                              </span>
                              <span className={`transform transition-transform text-gray-600 ${showVeo3Prompts.scene2 ? 'rotate-180' : ''}`}>
                                ▼
                              </span>
                            </div>
                          </div>
                          {showVeo3Prompts.scene2 && (
                          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">{veo3Prompts.scene2}</pre>
                          )}

                          {/* Buat Video Button */}
                          <div className="mt-3 flex flex-col items-center space-y-2">
                            {generatedImages.scene2 && (
                              <div className="text-xs text-green-600 font-semibold flex items-center space-x-1">
                                <span>🖼️➡️🎬</span>
                                <span>IMAGE-TO-VIDEO Mode</span>
                              </div>
                            )}
                            <button
                              onClick={() => handleCreateVideo(2)}
                              disabled={isGeneratingVideo.scene2 || !generatedImages.scene2}
                              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                            >
                              {isGeneratingVideo.scene2 ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                  <span>Generating...</span>
                                </>
                              ) : (
                                <>
                                  <span>🎬</span>
                                  <span>{generatedImages.scene2 ? 'Buat Video dari Gambar' : 'Generate Gambar Dulu'}</span>
                                </>
                              )}
                            </button>
                            {!generatedImages.scene2 && (
                              <div className="text-xs text-red-500 text-center">
                                ⚠️ Generate gambar terlebih dahulu untuk membuat video
                              </div>
                            )}
                          </div>

                          {/* Video Generation Progress */}
                          {isGeneratingVideo.scene2 && (
                            <div className="mt-3">
                              <div className="bg-gray-200 rounded-full h-2 mb-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${videoProgress.scene2 || 0}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-center text-gray-600">
                                {videoGenerationStatus.scene2 || 'Initializing...'}
                              </div>
                            </div>
                          )}

                          {/* Video Generation Status (when not generating) */}
                          {!isGeneratingVideo.scene2 && videoGenerationStatus.scene2 && (
                            <div className="mt-2 text-xs text-center">
                              <div className={`${videoGenerationStatus.scene2.includes('Error') ? 'text-red-600' : 'text-gray-600'} mb-2`}>
                                {videoGenerationStatus.scene2}
                              </div>
                              {/* Fix API Key Button for API-related errors */}
                              {(videoGenerationStatus.scene2.includes('API key') ||
                                videoGenerationStatus.scene2.includes('Access Denied') ||
                                videoGenerationStatus.scene2.includes('tidak valid') ||
                                videoGenerationStatus.scene2.includes('quota exceeded') ||
                                videoGenerationStatus.scene2.includes('Bridge server error') ||
                                videoGenerationStatus.scene2.includes('PERMISSION_DENIED') ||
                                videoGenerationStatus.scene2.includes('API quota')) && (
                                <button
                                  onClick={() => setShowVideoAPITutorial(true)}
                                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs px-3 py-1 rounded-lg transition-all duration-300 shadow-sm transform hover:scale-105"
                                >
                                  🔧 Fix API Key
                                </button>
                              )}
                            </div>
                          )}

                          {/* Generated Video Display */}
                          {(() => {
                            const hasVideoData = !!generatedVideos.scene2;
                            const hasError = videoGenerationStatus.scene2?.includes('Error');
                            const shouldShowVideo = hasVideoData && !hasError;

                            console.log('🎬 Video Display Decision for Scene 2:', {
                              hasVideoData,
                              hasError,
                              shouldShowVideo,
                              videoStatus: videoGenerationStatus.scene2
                            });

                            if (!shouldShowVideo) return null;

                            return (
                              <div className="mt-3 bg-gray-50 p-3 rounded border">
                                <h6 className="text-xs font-semibold text-gray-700 mb-2">🎬 Generated Video (Scene 2)</h6>
                                <div className="space-y-2">
                                  <video
                                    src={generatedVideos.scene2.url || generatedVideos.scene2.video_url || generatedVideos.scene2.videoUrl}
                                    controls
                                    className="w-full rounded"
                                    poster={generatedVideos.scene2.thumbnail}
                                    onError={(e) => {
                                      console.error('Video load error:', e);
                                      console.log('Video URL:', generatedVideos.scene2.url || generatedVideos.scene2.video_url);
                                    }}
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">
                                      Duration: {generatedVideos.scene2.duration}s
                                    </span>
                                    <button
                                      onClick={() => {
                                        const videoUrl = generatedVideos.scene2.url || generatedVideos.scene2.video_url || generatedVideos.scene2.videoUrl;
                                        const link = document.createElement('a');
                                        link.href = videoUrl;
                                        link.download = `scene2_video_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.mp4`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                      }}
                                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                                    >
                                      📥 Download Video
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                  </div>

                  {/* Scene 3 - CTA - Kanan */}
                  <div className="bg-gradient-to-br from-tiktok-pink/10 to-tiktok-pink/5 p-4 rounded-xl border border-tiktok-pink/30 shadow-lg">
                    <div
                      className="flex items-center justify-between cursor-pointer mb-3"
                      onClick={() => setShowSceneDetails(prev => ({...prev, scene3: !prev.scene3}))}
                    >
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-semibold text-tiktok-pink">
                          🚀 Adegan #3 - CTA
                        </label>
                        {scene3 && background3 && narration3 && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            ✓ Lengkap
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-tiktok-pink/20 text-tiktok-pink px-2 py-1 rounded-lg font-medium">
                          {showSceneDetails.scene3 ? 'Sembunyikan' : 'Edit Detail'}
                        </span>
                        <span className={`transform transition-transform text-tiktok-pink ${showSceneDetails.scene3 ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* Preview when collapsed */}
                    {!showSceneDetails.scene3 && (scene3 || background3 || narration3) && (
                      <div className="mb-3 p-2 bg-tiktok-pink/5 rounded-lg border border-tiktok-pink/10">
                        <div className="text-xs text-gray-600 space-y-1">
                          {scene3 && <div><span className="font-medium">Adegan:</span> {scene3.substring(0, 50)}{scene3.length > 50 ? '...' : ''}</div>}
                          {background3 && <div><span className="font-medium">Latar:</span> {background3.substring(0, 50)}{background3.length > 50 ? '...' : ''}</div>}
                          {narration3 && <div><span className="font-medium">Narasi:</span> {narration3.substring(0, 50)}{narration3.length > 50 ? '...' : ''}</div>}
                        </div>
                      </div>
                    )}

                  {showSceneDetails.scene3 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Adegan:</label>
                      <textarea
                        value={scene3}
                        onChange={(e) => setScene3(e.target.value)}
                        placeholder="Contoh: sedang merekomendasikan produk dengan gesture terbuka dan ramah"
                        className="w-full h-16 p-2 border border-gray-300 rounded text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Latar:</label>
                      <textarea
                        value={background3}
                        onChange={(e) => setBackground3(e.target.value)}
                        placeholder="Contoh: di outdoor dengan pemandangan alam, pencahayaan golden hour"
                        className="w-full h-16 p-2 border border-gray-300 rounded text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Narasi CTA:</label>
                      <textarea
                        value={narration3}
                        onChange={(e) => setNarration3(e.target.value)}
                        placeholder="Hemat 50% hari ini! Stok tinggal 3, harga naik besok. Cek keranjang sekarang!"
                        className="w-full h-12 p-2 border border-gray-300 rounded text-sm resize-none"
                      />
                    </div>
                  </div>
                  )}
                  <button
                    onClick={() => handleGenerateScene(3)}
                    disabled={
                      generatingScene === 3 ||
                      !scene3.trim() ||
                      !background3.trim() ||
                      !(photoDescription || modelDescription).trim()
                    }
                    className="w-full mt-3 bg-gradient-to-r from-shopee-orange to-yellow-500 hover:from-shopee-orange-light hover:to-yellow-400 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-shopee-orange/30 transform hover:scale-105"
                  >
                    {generatingScene === 3 ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <span>🎬 Buat Gambar Model #3</span>
                    )}
                  </button>
                  {generatedImages.scene3 && (
                    <div id="scene-3-result" className="mt-3 space-y-3">
                      <img src={generatedImages.scene3} alt="Generated Scene 3" className="w-full rounded-lg border" />

                      {/* Download Button */}
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = generatedImages.scene3;
                            link.download = `scene3_image_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                        >
                          <span>📥</span>
                          <span>Download</span>
                        </button>
                      </div>

                      {veo3Prompts.scene3 && (
                        <div className="bg-gray-50 p-3 rounded border">
                          <div
                            className="flex items-center justify-between mb-2 cursor-pointer"
                            onClick={() => setShowVeo3Prompts(prev => ({...prev, scene3: !prev.scene3}))}
                          >
                            <h5 className="text-xs font-semibold text-gray-700">🎬 Veo3 Prompt (CTA)</h5>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(veo3Prompts.scene3);
                                }}
                                className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
                              >
                                Copy
                              </button>
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                {showVeo3Prompts.scene3 ? 'Sembunyikan' : 'Lihat Prompt'}
                              </span>
                              <span className={`transform transition-transform text-gray-600 ${showVeo3Prompts.scene3 ? 'rotate-180' : ''}`}>
                                ▼
                              </span>
                            </div>
                          </div>
                          {showVeo3Prompts.scene3 && (
                          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">{veo3Prompts.scene3}</pre>
                          )}

                          {/* Buat Video Button */}
                          <div className="mt-3 flex flex-col items-center space-y-2">
                            {generatedImages.scene3 && (
                              <div className="text-xs text-green-600 font-semibold flex items-center space-x-1">
                                <span>🖼️➡️🎬</span>
                                <span>IMAGE-TO-VIDEO Mode</span>
                              </div>
                            )}
                            <button
                              onClick={() => handleCreateVideo(3)}
                              disabled={isGeneratingVideo.scene3 || !generatedImages.scene3}
                              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                            >
                              {isGeneratingVideo.scene3 ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                  <span>Generating...</span>
                                </>
                              ) : (
                                <>
                                  <span>🎬</span>
                                  <span>{generatedImages.scene3 ? 'Buat Video dari Gambar' : 'Generate Gambar Dulu'}</span>
                                </>
                              )}
                            </button>
                            {!generatedImages.scene3 && (
                              <div className="text-xs text-red-500 text-center">
                                ⚠️ Generate gambar terlebih dahulu untuk membuat video
                              </div>
                            )}
                          </div>

                          {/* Video Generation Progress */}
                          {isGeneratingVideo.scene3 && (
                            <div className="mt-3">
                              <div className="bg-gray-200 rounded-full h-2 mb-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${videoProgress.scene3 || 0}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-center text-gray-600">
                                {videoGenerationStatus.scene3 || 'Initializing...'}
                              </div>
                            </div>
                          )}

                          {/* Video Generation Status (when not generating) */}
                          {!isGeneratingVideo.scene3 && videoGenerationStatus.scene3 && (
                            <div className="mt-2 text-xs text-center">
                              <div className={`${videoGenerationStatus.scene3.includes('Error') ? 'text-red-600' : 'text-gray-600'} mb-2`}>
                                {videoGenerationStatus.scene3}
                              </div>
                              {/* Fix API Key Button for API-related errors */}
                              {(videoGenerationStatus.scene3.includes('API key') ||
                                videoGenerationStatus.scene3.includes('Access Denied') ||
                                videoGenerationStatus.scene3.includes('tidak valid') ||
                                videoGenerationStatus.scene3.includes('quota exceeded') ||
                                videoGenerationStatus.scene3.includes('Bridge server error') ||
                                videoGenerationStatus.scene3.includes('PERMISSION_DENIED') ||
                                videoGenerationStatus.scene3.includes('API quota')) && (
                                <button
                                  onClick={() => setShowVideoAPITutorial(true)}
                                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs px-3 py-1 rounded-lg transition-all duration-300 shadow-sm transform hover:scale-105"
                                >
                                  🔧 Fix API Key
                                </button>
                              )}
                            </div>
                          )}

                          {/* Generated Video Display */}
                          {(() => {
                            const hasVideoData = !!generatedVideos.scene3;
                            const hasError = videoGenerationStatus.scene3?.includes('Error');
                            const shouldShowVideo = hasVideoData && !hasError;

                            console.log('🎬 Video Display Decision for Scene 3:', {
                              hasVideoData,
                              hasError,
                              shouldShowVideo,
                              videoStatus: videoGenerationStatus.scene3
                            });

                            if (!shouldShowVideo) return null;

                            return (
                              <div className="mt-3 bg-gray-50 p-3 rounded border">
                                <h6 className="text-xs font-semibold text-gray-700 mb-2">🎬 Generated Video (Scene 3)</h6>
                                <div className="space-y-2">
                                  <video
                                    src={generatedVideos.scene3.url || generatedVideos.scene3.video_url || generatedVideos.scene3.videoUrl}
                                    controls
                                    className="w-full rounded"
                                    poster={generatedVideos.scene3.thumbnail}
                                    onError={(e) => {
                                      console.error('Video load error:', e);
                                      console.log('Video URL:', generatedVideos.scene3.url || generatedVideos.scene3.video_url);
                                    }}
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">
                                      Duration: {generatedVideos.scene3.duration}s
                                    </span>
                                    <button
                                      onClick={() => {
                                        const videoUrl = generatedVideos.scene3.url || generatedVideos.scene3.video_url || generatedVideos.scene3.videoUrl;
                                        const link = document.createElement('a');
                                        link.href = videoUrl;
                                        link.download = `scene3_video_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.mp4`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                      }}
                                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                                    >
                                      📥 Download Video
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                </div>

            {error && (
              <div className={`border rounded-lg p-3 ${
                error.includes('conceptual representation') || error.includes('unavailable')
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex">
                  <div className={
                    error.includes('conceptual representation') || error.includes('unavailable')
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }>
                    {error.includes('conceptual representation') || error.includes('unavailable') ? '⚠️' : '❌'}
                  </div>
                  <div className="ml-2">
                    <p className={`text-sm ${
                      error.includes('conceptual representation') || error.includes('unavailable')
                        ? 'text-yellow-700'
                        : 'text-red-700'
                    }`}>
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {/* Individual scene generation buttons are now in each scene section */}
            </div>

            {!apiKey && (
              <div className="text-sm text-red-500 text-center space-y-2">
                <p>Please configure your Gemini API key in settings</p>
                <p className="text-xs text-gray-600">
                  Note: Image generation requires Gemini 2.0 Flash Preview access
                </p>
              </div>
            )}
          </div>
        </div>
      </div>



      {generatingScene && (
        <div className="mt-6 bg-purple-50 rounded-lg p-4">
          <div className="text-center">
            <div className="text-purple-600 mb-2">🎨 AI is creating scene #{generatingScene}...</div>
            <div className="text-sm text-purple-500">
              This process may take up to 30 seconds
            </div>
          </div>
        </div>
      )}

      {/* Video Merger Component */}
      <VideoMerger
        generatedVideos={generatedVideos}
        aspectRatio={aspectRatio}
      />

      {/* Video API Tutorial Modal */}
      {showVideoAPITutorial && (
        <VideoAPITutorial
          videoApiKey={videoApiKey}
          setVideoApiKey={setVideoApiKey}
          onBack={() => setShowVideoAPITutorial(false)}
        />
      )}
    </div>
  );
};

export default ModelGeneration;
