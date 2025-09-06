import axios from 'axios';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

// Simple retry mechanism for 503 errors
const retryApiCall = async (apiCall, maxRetries = 3, delay = 2000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      console.log(`🔄 API call attempt ${attempt}/${maxRetries} failed:`, error.response?.status, error.message);

      // If it's a 503 (overloaded) or 429 (rate limit), retry
      if (error.response?.status === 503 || error.response?.status === 429) {
        if (attempt < maxRetries) {
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 1.5; // Exponential backoff
          continue;
        }
      }

      // For other errors or final attempt, throw the error
      throw error;
    }
  }
};

// Convert image data URL to base64 string
const getBase64FromDataUrl = (dataUrl) => {
  return dataUrl.split(',')[1];
};

// Get MIME type from data URL
const getMimeTypeFromDataUrl = (dataUrl) => {
  const match = dataUrl.match(/data:([^;]+);/);
  return match ? match[1] : 'image/jpeg';
};

// Analyze image and generate text descriptions (for VIDABOT assist)
export const analyzeImageForDescriptions = async (imageDataUrl, prompt, apiKey) => {
  try {
    const base64Image = getBase64FromDataUrl(imageDataUrl);
    const mimeType = getMimeTypeFromDataUrl(imageDataUrl);

    const apiCall = () => axios.post(
      `${GEMINI_API_BASE_URL}/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000
      }
    );

    const response = await retryApiCall(apiCall);

    if (response.data && response.data.candidates && response.data.candidates[0]) {
      const textResponse = response.data.candidates[0].content.parts[0].text;
      return textResponse;
    } else {
      throw new Error('No response generated');
    }
  } catch (error) {
    console.error('Image analysis error:', error);

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || 'Unknown error';

      if (status === 400) {
        throw new Error(`Invalid request: ${message}`);
      } else if (status === 401 || status === 403) {
        throw new Error('Invalid API key or insufficient permissions');
      } else if (status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(`API error (${status}): ${message}`);
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    } else {
      throw new Error(`Network error: ${error.message}`);
    }
  }
};

// Test API key validity
export const testGeminiApiKey = async (apiKey) => {
  try {
    const apiCall = () => axios.post(
      `${GEMINI_API_BASE_URL}/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{
            text: "Hello, this is a test message. Please respond with 'API key is working'."
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      }
    );

    const response = await retryApiCall(apiCall, 2, 1000); // 2 retries for testing

    if (response.data && response.data.candidates && response.data.candidates[0]) {
      return { success: true, message: 'API key is valid and working!' };
    } else {
      throw new Error('Unexpected response format');
    }
  } catch (error) {
    console.error('API key test failed:', error);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || 'Unknown error';
      
      if (status === 400) {
        throw new Error(`Invalid request: ${message}`);
      } else if (status === 401 || status === 403) {
        throw new Error('Invalid API key or insufficient permissions');
      } else if (status === 429) {
        throw new Error('API quota exceeded. Please try again later.');
      } else {
        throw new Error(`API error (${status}): ${message}`);
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your internet connection.');
    } else {
      throw new Error('Network error. Please check your internet connection.');
    }
  }
};

// Generate new model image with Gemini Image Generation API
export const generateModelImageWithGemini = async (originalImageDataUrl, analysisResult, modelDescription, apiKey, referenceImage = null, changeOptions = {}, isRevision = false) => {
  try {
    console.log('🚀 Starting Gemini Image Generation...');
    console.log('🔄 Is Revision Mode:', isRevision);
    console.log('📝 Model Description:', modelDescription);
    console.log('🔑 API Key present:', !!apiKey);
    console.log('📏 CRITICAL: Product size must be preserved exactly:', analysisResult.produk);

    const base64Image = getBase64FromDataUrl(originalImageDataUrl);
    const mimeType = getMimeTypeFromDataUrl(originalImageDataUrl);

    // Create inline data object like in the reference code
    const inlineData = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    // Build dynamic prompt based on toggle options
    const { face = true, clothing = false, background = false } = changeOptions;

    let changeInstructions = [];
    let keepInstructions = [];

    // Face/Person changes
    if (face) {
      changeInstructions.push(`- Replace the person with: ${modelDescription}`);
      changeInstructions.push(`- New model must maintain EXACT same pose and hand position as original`);
      changeInstructions.push(`- New model must hold the product in IDENTICAL way`);
      changeInstructions.push(`- Create realistic, natural-looking person with professional appearance`);
      changeInstructions.push(`- Ensure facial features and body proportions look authentic and photogenic`);
      changeInstructions.push(`- Generate perfect human anatomy with no deformities or missing parts`);
      changeInstructions.push(`- Ensure hands have exactly 5 fingers each, properly formed`);
      changeInstructions.push(`- Create symmetrical, natural facial features`);
      changeInstructions.push(`- Match the original lighting and photo quality`);
    } else {
      keepInstructions.push(`- Person's face and physical characteristics - KEEP IDENTICAL`);
    }

    // Clothing changes
    if (clothing) {
      changeInstructions.push(`- COMPLETELY CHANGE clothing and outfit to match description`);
      changeInstructions.push(`- Replace current clothing with appropriate traditional/cultural attire`);
      changeInstructions.push(`- Make clothing change VERY OBVIOUS and DRAMATIC`);
      changeInstructions.push(`- Use colors, patterns, and styles that match the character description`);
    } else {
      keepInstructions.push(`- Clothing style and outfit - KEEP IDENTICAL`);
    }

    // Background changes
    if (background) {
      changeInstructions.push(`- Change background and environment to match description`);
      changeInstructions.push(`- Create an appropriate, professional background setting`);
    } else {
      keepInstructions.push(`- Background: ${analysisResult.latar} - KEEP IDENTICAL colors, textures, elements`);
    }

    // Always keep these elements - CRITICAL for product consistency
    keepInstructions.push(`- Product: ${analysisResult.produk} - IDENTICAL size, position, and details`);
    keepInstructions.push(`- Hand pose and gesture holding the product - EXACT SAME POSE`);
    keepInstructions.push(`- Product dimensions and scale - MUST remain EXACTLY the same size`);
    keepInstructions.push(`- Product proportions relative to hands/body - PRESERVE EXACTLY but ensure realistic scale`);
    keepInstructions.push(`- Product must look naturally sized for the new model's hands and body`);
    keepInstructions.push(`- Maintain logical product-to-hand size ratio that looks believable`);
    keepInstructions.push(`- Lighting and camera angle`);
    keepInstructions.push(`- Composition and framing`);

    const imagePrompt = isRevision
      ? `TUGAS REVISI: Perbaiki gambar ini sesuai permintaan: "${modelDescription}"

YANG HARUS TETAP SAMA (WAJIB):
- Model/orang - HARUS tetap orang yang sama persis, wajah sama, tubuh sama
- Pose dan posisi tubuh - HARUS identik dengan gambar sebelumnya
- Produk yang dipegang - HARUS produk yang sama persis, ukuran sama, posisi sama
- Posisi tangan dan cara memegang - HARUS identik dengan sebelumnya

YANG BOLEH DIUBAH SESUAI PERMINTAAN REVISI:
- Background/latar belakang (jika diminta dalam revisi)
- Ekspresi wajah (jika diminta dalam revisi)
- Pencahayaan (jika diminta dalam revisi)
- Detail kecil lainnya sesuai permintaan revisi

INSTRUKSI KETAT:
- JANGAN ganti model/orangnya - tetap gunakan orang yang sama
- Hanya ubah elemen yang diminta dalam revisi
- Pertahankan semua elemen yang tidak disebutkan dalam revisi
- Hasilkan gambar fotorealistik dengan kualitas profesional
- Buat dalam rasio aspek 9:16

NEGATIVE PROMPT (HINDARI SEPENUHNYA):
- tangan cacat, tangan bermutasi, jari ekstra, jari hilang, jari menyatu
- produk terdistorsi, produk melengkung, produk meleleh, produk melayang
- produk ganda, item duplikat, multiplikasi produk
- tangan buram, detail tangan tidak jelas, penyatuan tangan-produk
- kesalahan anatomi, distorsi bagian tubuh, kelainan bentuk anggota badan
- posisi tangan tidak realistis, pose tangan mustahil
- perubahan ukuran produk, distorsi bentuk produk
- objek menyatu, distorsi tumpang tindih, artefak visual
- kualitas rendah, pixelated, buram, fotografi amatir
- pencahayaan buatan, bayangan keras, area overexposed`
      : `Generate a professional product photo. Replace the person in the original image with this new model description: ${modelDescription}

CRITICAL REQUIREMENTS:
- Create a REAL PHOTOGRAPH, not a digital interface or screenshot
- The result must look like it was taken with a professional camera
- Replace ONLY the person/model with the new description
- Keep the EXACT same pose, hand position, and way of holding the product
- Keep the product identical (same size, position, appearance)
- Keep the background identical to the original
- Maintain the same lighting and camera angle

PHOTO QUALITY STANDARDS:
- Professional photography quality (DSLR camera result)
- Sharp, high-resolution details
- Natural lighting and shadows
- Realistic skin textures and facial features
- Perfect human anatomy (hands, fingers, face, body proportions)
- Natural clothing that fits the context
- Realistic background that supports the product context

HAND AND PRODUCT REQUIREMENTS:
- Hands must look natural with clear finger details
- Product must be held securely and naturally
- Keep the exact same product and person from the original image
- Maintain sharp focus on both hands and product text
- No distortion of hands or product

STRICT PROHIBITIONS:
- NO user interfaces, apps, or digital screens
- NO white backgrounds unless contextually appropriate
- NO cartoon, illustration, or artificial-looking elements
- NO deformed hands, extra fingers, or missing body parts
- NO blurry faces or distorted features
- NO unrealistic proportions or anatomy
- NO changing the product or its positioning

NEGATIVE PROMPT (AVOID THESE):
- deformed hands, extra fingers, missing fingers
- blurry hands, unclear fingers
- distorted product, changed product
- blurry text, unreadable text
- different person, changed appearance
- low quality, artifacts

OUTPUT: A realistic product photograph that looks professionally shot, ready for commercial use.`;

    console.log('🎯 Full prompt that will be sent to Gemini:', imagePrompt);

    // Prepare parts array
    const parts = [{ text: imagePrompt }, inlineData];

    // Add reference image if provided
    if (referenceImage) {
      const refBase64 = getBase64FromDataUrl(referenceImage);
      const refMimeType = getMimeTypeFromDataUrl(referenceImage);
      const refInlineData = {
        inlineData: {
          data: refBase64,
          mimeType: refMimeType,
        },
      };
      parts.push(refInlineData);
    }

    console.log('📤 Sending request to Gemini API...');
    console.log('🎯 Using model: gemini-2.0-flash-preview-image-generation');

    const apiCall = () => axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: parts
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          temperature: 0.2, // Lower temperature for more consistent results
          topK: 16, // Lower topK for more focused generation
          topP: 0.8, // Lower topP for more deterministic output
          maxOutputTokens: 8192,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 120000 // Increase timeout for image generation (2 minutes)
      }
    );

    const response = await retryApiCall(apiCall, 5, 3000); // 5 retries with 3 second initial delay

    console.log('📥 Received response from Gemini API');
    console.log('📊 Response status:', response.status);

    if (response.data && response.data.candidates && response.data.candidates[0]) {
      const candidate = response.data.candidates[0];

      // Look for image data in the response (following reference code pattern)
      const base64Data = candidate?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

      if (base64Data) {
        console.log('✅ Successfully generated image with Gemini API!');
        console.log('📸 Image data length:', base64Data.length);
        // Return the generated image as data URL
        return `data:image/png;base64,${base64Data}`;
      }

      // If no image found, throw error
      throw new Error('No image generated in the response');
    } else {
      throw new Error('No response from Gemini API');
    }
  } catch (error) {
    console.error('Image generation failed:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code
    });

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || 'Unknown error';

      console.error(`API Error ${status}:`, message);

      if (status === 400) {
        throw new Error(`Invalid request: ${message}`);
      } else if (status === 401 || status === 403) {
        throw new Error(`API key not valid. Please pass a valid API key.`);
      } else if (status === 429) {
        throw new Error('API quota exceeded. Please try again later.');
      } else {
        throw new Error(`API error (${status}): ${message}`);
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Image generation is taking too long.');
    } else {
      throw new Error('Failed to generate image. Please try again.');
    }
  }
};

// Analyze image with Gemini Vision API
export const analyzeImageWithGemini = async (imageDataUrl, apiKey) => {
  try {
    const base64Image = getBase64FromDataUrl(imageDataUrl);
    const mimeType = getMimeTypeFromDataUrl(imageDataUrl);

    const prompt = `Analyze this image and identify the following elements in Indonesian language:

1. PRODUK: What product is being shown or promoted in the image? (e.g., smartphone, clothing, food, etc.)
2. MODEL: Describe the person/model in the image (e.g., gender, approximate age, appearance, clothing style)
3. LATAR TEMPAT: Describe the background/setting/location (e.g., indoor/outdoor, specific location type, ambiance)

Please respond in the following JSON format:
{
  "produk": "description of the product",
  "model": "description of the model/person",
  "latar": "description of the background/setting"
}

Make sure your response is valid JSON and all descriptions are in Indonesian language.`;

    const response = await axios.post(
      `${GEMINI_API_BASE_URL}/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image
              }
            }
          ]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000
      }
    );

    if (response.data && response.data.candidates && response.data.candidates[0]) {
      const textResponse = response.data.candidates[0].content.parts[0].text;
      
      try {
        // Try to extract JSON from the response
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysisResult = JSON.parse(jsonMatch[0]);
          
          // Validate that all required fields are present
          if (analysisResult.produk && analysisResult.model && analysisResult.latar) {
            return analysisResult;
          } else {
            throw new Error('Incomplete analysis result');
          }
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.log('Raw response:', textResponse);
        
        // Fallback: create a structured response from the text
        return {
          produk: "Tidak dapat diidentifikasi secara otomatis",
          model: "Tidak dapat diidentifikasi secara otomatis", 
          latar: "Tidak dapat diidentifikasi secara otomatis"
        };
      }
    } else {
      throw new Error('No response from Gemini API');
    }
  } catch (error) {
    console.error('Image analysis failed:', error);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || 'Unknown error';
      
      if (status === 400) {
        throw new Error(`Invalid request: ${message}`);
      } else if (status === 401 || status === 403) {
        throw new Error('Invalid API key or insufficient permissions');
      } else if (status === 429) {
        throw new Error('API quota exceeded. Please try again later.');
      } else {
        throw new Error(`API error (${status}): ${message}`);
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. The image analysis is taking too long.');
    } else if (error.message.includes('Incomplete analysis result') || error.message.includes('No JSON found')) {
      throw new Error('Failed to analyze image properly. Please try with a different image.');
    } else {
      throw new Error('Network error. Please check your internet connection.');
    }
  }
};
