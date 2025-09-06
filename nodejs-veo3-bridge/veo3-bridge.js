#!/usr/bin/env node

/**
 * VEO 3 Bridge - Node.js script that uses the official Google GenAI SDK
 * This script acts as a bridge between React app and the JavaScript SDK
 * Based on the working reference implementation
 */

import { GoogleGenAI } from "@google/genai";
import fs from 'fs';

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
    console.error(JSON.stringify({
        success: false,
        error: 'Usage: node veo3-bridge.js <API_KEY> <PROMPT> [IMAGE_PATH]'
    }));
    process.exit(1);
}

const API_KEY = args[0];
const PROMPT = args[1];
const IMAGE_PATH = args[2] || null;

// Initialize Google GenAI - EXACT same as working reference
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Progress callback
function onProgress(message) {
    console.log(JSON.stringify({
        type: 'progress',
        message: message
    }));
}

// A utility to extract base64 data from a data URL
const getBase64Data = (dataUrl) => {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) {
        throw new Error('Invalid data URL');
    }
    return parts[1];
};

async function generateVideo() {
    try {
        onProgress("Initializing VEO 3 video generation...");

        // EXACT same parameters as working reference
        const generateVideosParams = {
            model: 'veo-3.0-generate-preview',
            prompt: PROMPT,
            config: {
                numberOfVideos: 1,
            },
        };

        if (IMAGE_PATH) {
            onProgress("Processing reference image...");
            
            // Read image file and convert to base64
            const imageBuffer = fs.readFileSync(IMAGE_PATH);
            const imageBase64 = imageBuffer.toString('base64');
            
            // Detect MIME type based on file extension
            let mimeType = 'image/jpeg';
            if (IMAGE_PATH.toLowerCase().endsWith('.png')) {
                mimeType = 'image/png';
            } else if (IMAGE_PATH.toLowerCase().endsWith('.webp')) {
                mimeType = 'image/webp';
            }

            generateVideosParams.image = {
                imageBytes: imageBase64,
                mimeType: mimeType,
            };
        }

        // EXACT same flow as working reference
        let operation = await ai.models.generateVideos(generateVideosParams);
        onProgress("Video generation started. This may take a few minutes...");

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            onProgress("Checking generation status...");
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        onProgress("Generation complete! Fetching your video...");

        // Debug: Log the complete operation response
        console.log(JSON.stringify({
            type: 'debug',
            message: 'Complete operation response',
            data: operation
        }));

        // Try different response structures based on documentation
        let videoData = null;
        let downloadLink = null;

        if (operation.response?.generatedVideos && operation.response.generatedVideos.length > 0) {
            videoData = operation.response.generatedVideos[0];
            downloadLink = videoData?.video?.uri;
        } else if (operation.response?.generateVideoResponse?.generatedSamples && operation.response.generateVideoResponse.generatedSamples.length > 0) {
            // Alternative response structure from official docs
            videoData = operation.response.generateVideoResponse.generatedSamples[0];
            downloadLink = videoData?.video?.uri;
        }

        if (downloadLink) {
            // Video found, continue with download
            
            // The API Key needs to be appended to the download URI
            const authenticatedUrl = `${downloadLink}&key=${API_KEY}`;
            
            onProgress("Downloading video...");
            
            const fetch = (await import('node-fetch')).default;
            const videoResponse = await fetch(authenticatedUrl);

            if (!videoResponse.ok) {
                throw new Error(`Failed to download video. Status: ${videoResponse.statusText}`);
            }

            onProgress("Creating video blob...");
            const videoBuffer = await videoResponse.buffer();
            const videoBase64 = videoBuffer.toString('base64');
            
            // Return success result
            console.log(JSON.stringify({
                success: true,
                videoData: videoBase64,
                mimeType: 'video/mp4',
                downloadUrl: authenticatedUrl,
                prompt: PROMPT,
                duration: 8, // VEO 3 generates ~8 second videos
                model: 'veo-3.0-generate-preview'
            }));
        } else {
            // Debug: Show what we actually got
            console.log(JSON.stringify({
                type: 'debug',
                message: 'No generatedVideos found',
                responseKeys: Object.keys(operation.response || {}),
                hasResponse: !!operation.response
            }));

            throw new Error("No video was generated. The response was empty.");
        }
    } catch (error) {
        console.error(JSON.stringify({
            success: false,
            error: error.message,
            stack: error.stack
        }));
        process.exit(1);
    }
}

// Run the generation
generateVideo();
