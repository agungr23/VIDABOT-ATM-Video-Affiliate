#!/usr/bin/env node

/**
 * VEO 3 Bridge Server - Express server that provides REST API for VEO 3 generation
 * This server uses the official Google GenAI SDK and provides endpoints for React app
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({
    dest: path.join(__dirname, 'tmp'),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Ensure tmp directory exists
const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'VEO 3 Bridge Server',
        timestamp: new Date().toISOString()
    });
});

// VEO 3 video generation endpoint
app.post('/generate-video', upload.single('referenceImage'), async (req, res) => {
    try {
        const { apiKey, prompt, config } = req.body;

        console.log('🚀 BRIDGE: Received video generation request');
        console.log('📋 Request details:', {
            hasApiKey: !!apiKey,
            promptLength: prompt?.length,
            hasConfig: !!config,
            hasFile: !!req.file,
            fileName: req.file?.originalname,
            fileSize: req.file?.size,
            fileMimeType: req.file?.mimetype
        });

        if (!apiKey || !prompt) {
            return res.status(400).json({
                success: false,
                error: 'API key and prompt are required'
            });
        }

        // Initialize Google GenAI
        const ai = new GoogleGenAI({ apiKey });

        // Prepare generation parameters
        const generateVideosParams = {
            model: 'veo-3.0-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                ...config
            },
        };

        // Handle reference image if provided
        if (req.file) {
            console.log('🖼️ BRIDGE: Processing reference image...');
            console.log('📁 File details:', {
                originalname: req.file.originalname,
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size,
                mimetype: req.file.mimetype
            });

            const imageBuffer = fs.readFileSync(req.file.path);
            console.log('✅ Image buffer read:', { bufferSize: imageBuffer.length });

            const imageBase64 = imageBuffer.toString('base64');
            console.log('✅ Image converted to base64:', {
                base64Length: imageBase64.length,
                base64Preview: imageBase64.substring(0, 50) + '...'
            });

            // Detect MIME type
            let mimeType = 'image/jpeg';
            if (req.file.originalname.toLowerCase().endsWith('.png')) {
                mimeType = 'image/png';
            } else if (req.file.originalname.toLowerCase().endsWith('.webp')) {
                mimeType = 'image/webp';
            }
            console.log('🎯 Detected MIME type:', mimeType);

            generateVideosParams.image = {
                imageBytes: imageBase64,
                mimeType: mimeType,
            };

            console.log('✅ IMAGE-TO-VIDEO: Reference image added to VEO3 params');
            console.log('📋 Image object:', {
                hasBytesProperty: !!generateVideosParams.image.imageBytes,
                mimeType: generateVideosParams.image.mimeType,
                bytesLength: generateVideosParams.image.imageBytes.length
            });

            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
            console.log('🗑️ Temporary file cleaned up');
        } else {
            console.log('📝 TEXT-TO-VIDEO: No reference image provided');
        }

        // Send initial response
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Transfer-Encoding': 'chunked'
        });

        const sendProgress = (message) => {
            res.write(JSON.stringify({
                type: 'progress',
                message: message
            }) + '\n');
        };

        sendProgress("Initializing VEO 3 video generation...");

        // Log final parameters before API call
        console.log('🚀 BRIDGE: Calling VEO3 API with parameters:');
        console.log('📋 Final generateVideosParams:', {
            model: generateVideosParams.model,
            promptLength: generateVideosParams.prompt.length,
            hasImage: !!generateVideosParams.image,
            mode: generateVideosParams.image ? 'IMAGE-TO-VIDEO' : 'TEXT-TO-VIDEO',
            configKeys: Object.keys(generateVideosParams.config || {})
        });

        if (generateVideosParams.image) {
            console.log('🖼️ IMAGE DATA BEING SENT TO VEO3:', {
                mimeType: generateVideosParams.image.mimeType,
                bytesLength: generateVideosParams.image.imageBytes.length,
                isBase64: typeof generateVideosParams.image.imageBytes === 'string'
            });
        }

        // Start video generation
        console.log('🎬 Starting VEO3 video generation...');
        let operation = await ai.models.generateVideos(generateVideosParams);
        sendProgress("Video generation started. This may take a few minutes...");

        // Poll for completion
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            sendProgress("Checking generation status...");
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        sendProgress("Generation complete! Fetching your video...");

        // Extract video data
        let videoData = null;
        let downloadLink = null;

        if (operation.response?.generatedVideos && operation.response.generatedVideos.length > 0) {
            videoData = operation.response.generatedVideos[0];
            downloadLink = videoData?.video?.uri;
        } else if (operation.response?.generateVideoResponse?.generatedSamples && operation.response.generateVideoResponse.generatedSamples.length > 0) {
            videoData = operation.response.generateVideoResponse.generatedSamples[0];
            downloadLink = videoData?.video?.uri;
        }

        if (downloadLink) {
            // Download video
            const authenticatedUrl = `${downloadLink}&key=${apiKey}`;
            sendProgress("Downloading video...");
            
            const fetch = (await import('node-fetch')).default;
            const videoResponse = await fetch(authenticatedUrl);

            if (!videoResponse.ok) {
                throw new Error(`Failed to download video. Status: ${videoResponse.statusText}`);
            }

            sendProgress("Creating video blob...");
            const videoBuffer = await videoResponse.buffer();
            const videoBase64 = videoBuffer.toString('base64');
            
            // Send final result
            res.write(JSON.stringify({
                type: 'result',
                success: true,
                videoData: videoBase64,
                mimeType: 'video/mp4',
                downloadUrl: authenticatedUrl,
                prompt: prompt,
                duration: 8,
                model: 'veo-3.0-generate-preview'
            }) + '\n');
        } else {
            throw new Error("No video was generated. The response was empty.");
        }

        res.end();

    } catch (error) {
        console.error('Generation error:', error);

        // Handle specific error types
        let errorMessage = error.message;
        let statusCode = 500;

        if (error.status === 403 || error.message.includes('PERMISSION_DENIED')) {
            errorMessage = 'VEO 3 API access denied. Your API key does not have access to VEO 3 preview. Please request access from Google AI Studio or use a different API key with VEO 3 permissions.';
            statusCode = 403;
        } else if (error.status === 401 || error.message.includes('API key not valid')) {
            errorMessage = 'Invalid API key. Please check your Google AI Studio API key.';
            statusCode = 401;
        } else if (error.status === 429 || error.message.includes('quota exceeded')) {
            errorMessage = 'API quota exceeded. Please try again later or upgrade your plan.';
            statusCode = 429;
        }

        if (!res.headersSent) {
            res.status(statusCode).json({
                success: false,
                error: errorMessage,
                originalError: error.message
            });
        } else {
            res.write(JSON.stringify({
                type: 'error',
                success: false,
                error: errorMessage,
                originalError: error.message
            }) + '\n');
            res.end();
        }
    }
});

// Simple video generation endpoint (for testing)
app.post('/generate-simple', async (req, res) => {
    try {
        const { apiKey, prompt } = req.body;
        
        if (!apiKey || !prompt) {
            return res.status(400).json({
                success: false,
                error: 'API key and prompt are required'
            });
        }

        // Initialize Google GenAI
        const ai = new GoogleGenAI({ apiKey });

        const generateVideosParams = {
            model: 'veo-3.0-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
            },
        };

        // Generate video
        let operation = await ai.models.generateVideos(generateVideosParams);
        
        // Poll for completion
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        // Extract and return result
        let downloadLink = null;
        if (operation.response?.generatedVideos && operation.response.generatedVideos.length > 0) {
            downloadLink = operation.response.generatedVideos[0]?.video?.uri;
        }

        if (downloadLink) {
            const authenticatedUrl = `${downloadLink}&key=${apiKey}`;
            
            res.json({
                success: true,
                downloadUrl: authenticatedUrl,
                prompt: prompt,
                duration: 8,
                model: 'veo-3.0-generate-preview'
            });
        } else {
            throw new Error("No video was generated");
        }

    } catch (error) {
        console.error('Simple generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 VEO 3 Bridge Server running on port ${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`🎬 Video generation: POST http://localhost:${PORT}/generate-video`);
});
