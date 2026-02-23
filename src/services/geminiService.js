/**
 * Gemini AI Service
 * Handles communication with Google's Gemini Vision API for sign validation
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

// Gemini API configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Using Gemini 2.5 Flash Lite - highest RPM (10 requests/min) for vision tasks
const GEMINI_VISION_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';
const GEMINI_TEXT_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

// Rate limiting configuration
const MIN_REQUEST_INTERVAL = 3000; // 3 seconds between requests
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 2000; // 2 seconds

// Rate limiting state
let lastRequestTime = 0;
let cooldownEndTime = 0;

/**
 * Get remaining cooldown time in milliseconds
 * @returns {number} Milliseconds until next request is allowed
 */
export function getCooldownRemaining() {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const remainingCooldown = Math.max(0, MIN_REQUEST_INTERVAL - timeSinceLastRequest);
    const remainingRateLimit = Math.max(0, cooldownEndTime - now);
    return Math.max(remainingCooldown, remainingRateLimit);
}

/**
 * Check if we can make a request now
 * @returns {boolean} Whether a request is allowed
 */
export function canMakeRequest() {
    return getCooldownRemaining() === 0;
}

/**
 * Set a rate limit cooldown (called when we get 429)
 * @param {number} seconds - Seconds to wait
 */
export function setRateLimitCooldown(seconds = 10) {
    cooldownEndTime = Date.now() + (seconds * 1000);
    console.log(`⏳ Rate limit cooldown set for ${seconds} seconds`);
}

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if Gemini API key is configured
 * @returns {boolean} Whether API key exists
 */
export function isGeminiConfigured() {
    return !!GEMINI_API_KEY;
}

/**
 * Capture a frame from video element and convert to base64
 * 
 * @param {HTMLVideoElement} videoElement - The video element to capture from
 * @returns {string|null} Base64 encoded image data (without prefix) or null on error
 */
export function captureFrameFromVideo(videoElement) {
    try {
        if (!videoElement || videoElement.readyState < 2) {
            console.warn('⚠️ Video not ready for capture');
            return null;
        }

        // Create canvas with video dimensions
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth || 640;
        canvas.height = videoElement.videoHeight || 480;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('❌ Could not get canvas context');
            return null;
        }

        // Draw the current video frame
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Convert to base64 JPEG (smaller size than PNG)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

        // Remove the "data:image/jpeg;base64," prefix
        const base64Data = dataUrl.split(',')[1];

        console.log('📸 Frame captured successfully');
        return base64Data;
    } catch (error) {
        console.error('❌ Error capturing video frame:', error);
        return null;
    }
}

/**
 * Make a single API request to Gemini
 * @param {string} imageBase64 - Base64 encoded image
 * @param {string} prompt - The prompt text
 * @returns {Promise<{success: boolean, data?: any, rateLimited?: boolean, error?: string}>}
 */
async function makeGeminiRequest(imageBase64, prompt) {
    try {
        const response = await fetch(`${GEMINI_VISION_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: imageBase64
                            }
                        },
                        {
                            text: prompt
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.4,
                    topK: 32,
                    topP: 1,
                    maxOutputTokens: 1024,
                }
            })
        });

        // Handle rate limiting
        if (response.status === 429) {
            return { success: false, rateLimited: true };
        }

        // Handle other errors
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Gemini API error:', response.status, errorText);
            return { success: false, error: errorText };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('❌ Request error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Validate a hand sign using Gemini Vision API with retry logic
 * 
 * @param {string} imageBase64 - Base64 encoded image (without prefix)
 * @param {string} targetLetter - The ASL letter the user is trying to sign
 * @returns {Promise<Object>} Validation result with isCorrect, accuracy, feedback, suggestions
 */
export async function validateHandSign(imageBase64, targetLetter) {
    // Default error response
    const errorResponse = {
        isCorrect: false,
        accuracy: 0,
        feedback: 'Unable to analyze. Please try again.',
        suggestions: ['Check your internet connection', 'Try again in a moment']
    };

    // Check API key
    if (!GEMINI_API_KEY) {
        console.error('❌ Gemini API key not configured');
        return {
            ...errorResponse,
            feedback: 'AI validation not configured. Please add VITE_GEMINI_API_KEY to your .env file.'
        };
    }

    // Validate input
    if (!imageBase64) {
        return {
            ...errorResponse,
            feedback: 'No image captured. Please ensure camera is working.'
        };
    }

    // Check cooldown
    const cooldown = getCooldownRemaining();
    if (cooldown > 0) {
        console.log(`⏳ Waiting ${Math.ceil(cooldown / 1000)}s for cooldown...`);
        await sleep(cooldown);
    }

    // Update last request time
    lastRequestTime = Date.now();

    console.log(`🔍 Validating sign for letter "${targetLetter}"...`);

    // Construct the prompt for Gemini - Very lenient for learning
    const prompt = `You are a friendly, encouraging sign language teacher helping a beginner learn ASL.
The user is trying to make the ASL (American Sign Language) letter "${targetLetter}".

IMPORTANT: Be VERY LENIENT and FORGIVING in your grading. This is for learning, not a strict test.
Remember these are beginners using a webcam - angles, lighting, and minor imperfections are NORMAL.
- If the general hand shape is roughly recognizable as the letter, give HIGH accuracy (80-95%)
- If the hand shape is close but has minor issues (slightly wrong finger position, angle, etc), still give good accuracy (65-80%)
- Only give low accuracy (below 50) if the sign is completely wrong or no hand is visible
- Focus on what they're doing RIGHT, not just what's wrong
- When in doubt, give the learner the benefit of the doubt and round UP

Respond with ONLY a valid JSON object in exactly this format (no additional text, no markdown, no code blocks):
{
  "isCorrect": true or false,
  "accuracy": a number between 0 and 100,
  "feedback": "a brief, encouraging feedback message (max 50 words)",
  "suggestions": ["suggestion 1", "suggestion 2"]
}

Rules for your response:
- isCorrect should be true if accuracy is 50 or above (very lenient threshold for learners)
- Be very encouraging and positive, even when the sign needs improvement
- Acknowledge effort and progress
- Suggestions should be gentle and constructive
- If no hand is detected, set accuracy to 0 and feedback to "No hand detected. Please show your hand clearly."
- If hand is partially visible or at an angle, still try to give credit for effort (at least 50-60% accuracy)
- Webcam distortion and angles should NOT significantly penalize the score
- Respond with ONLY the JSON object, nothing else`;

    // Retry logic with exponential backoff
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (attempt > 0) {
            const backoffTime = INITIAL_BACKOFF * Math.pow(2, attempt - 1);
            console.log(`🔄 Retry attempt ${attempt + 1}/${MAX_RETRIES} after ${backoffTime}ms...`);
            await sleep(backoffTime);
        }

        const result = await makeGeminiRequest(imageBase64, prompt);

        if (result.success) {
            // Extract text response
            const textResponse = result.data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textResponse) {
                console.error('❌ No text response from Gemini');
                return errorResponse;
            }

            console.log('📝 Raw Gemini response:', textResponse);

            // Parse JSON from response (handle potential extra text)
            const parsedResult = parseGeminiResponse(textResponse);

            if (parsedResult) {
                console.log('✅ Validation result:', parsedResult);
                return parsedResult;
            }

            return errorResponse;
        }

        if (result.rateLimited) {
            console.warn(`⚠️ Rate limited (attempt ${attempt + 1}/${MAX_RETRIES})`);
            setRateLimitCooldown(10); // Set 10 second cooldown
            lastError = 'Rate limited';
            continue; // Retry after backoff
        }

        lastError = result.error;
    }

    // All retries exhausted
    console.error('❌ All retry attempts failed:', lastError);
    return {
        ...errorResponse,
        feedback: 'Too many requests. Please wait a moment before trying again.',
        suggestions: ['Wait 10-15 seconds', 'Try again']
    };
}

/**
 * Parse Gemini response to extract JSON object
 * Handles cases where Gemini adds extra text or markdown
 * 
 * @param {string} responseText - Raw text response from Gemini
 * @returns {Object|null} Parsed result object or null
 */
function parseGeminiResponse(responseText) {
    try {
        // First, try direct JSON parse
        const parsed = JSON.parse(responseText.trim());
        return validateAndNormalizeResult(parsed);
    } catch {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[1].trim());
                return validateAndNormalizeResult(parsed);
            } catch {
                console.warn('⚠️ Could not parse JSON from code block');
            }
        }

        // Try to find JSON object in text
        const objectMatch = responseText.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            try {
                const parsed = JSON.parse(objectMatch[0]);
                return validateAndNormalizeResult(parsed);
            } catch {
                console.warn('⚠️ Could not parse JSON object from response');
            }
        }

        console.error('❌ Could not parse Gemini response as JSON');
        return null;
    }
}

/**
 * Validate and normalize the result object
 * 
 * @param {Object} result - Parsed result object
 * @returns {Object} Normalized result
 */
function validateAndNormalizeResult(result) {
    return {
        isCorrect: typeof result.isCorrect === 'boolean'
            ? result.isCorrect
            : (result.accuracy >= 50),
        accuracy: typeof result.accuracy === 'number'
            ? Math.max(0, Math.min(100, Math.round(result.accuracy)))
            : 0,
        feedback: typeof result.feedback === 'string'
            ? result.feedback
            : 'Analysis complete.',
        suggestions: Array.isArray(result.suggestions)
            ? result.suggestions.slice(0, 3)
            : []
    };
}

/**
 * Analyze a sentence and break it down into ASL signs
 * Uses proper ASL grammar rules: TIME + TOPIC + COMMENT, question words at end
 * 
 * @param {string} sentence - Plain text sentence to analyze
 * @returns {Promise<{original: string, aslWords: string[], explanation: string}>}
 */
export async function analyzeSentenceToSigns(sentence) {
    // Default response
    const defaultResponse = {
        original: sentence,
        aslWords: sentence.toUpperCase().split(/\s+/).filter(Boolean),
        explanation: 'Basic word splitting (AI translation unavailable)'
    };

    // Check API key
    if (!GEMINI_API_KEY) {
        console.warn('⚠️ Gemini API not configured, returning split words');
        return defaultResponse;
    }

    if (!sentence || typeof sentence !== 'string') {
        return { original: '', aslWords: [], explanation: '' };
    }

    // Check cooldown
    const cooldown = getCooldownRemaining();
    if (cooldown > 0) {
        console.log(`⏳ Waiting ${Math.ceil(cooldown / 1000)}s for cooldown...`);
        await sleep(cooldown);
    }

    // Update last request time
    lastRequestTime = Date.now();

    try {
        console.log(`📝 Analyzing sentence for ASL: "${sentence}"`);

        const prompt = `You are an expert ASL (American Sign Language) translator and teacher.
Convert this English sentence into ASL signing order:
"${sentence}"

IMPORTANT RULES FOR ASL TRANSLATION:
1. ASL has different grammar than English - word order changes
2. Remove filler words: a, an, the, is, am, are, was, were, be, been, being
3. Remove auxiliary verbs when not needed
4. Keep only content words (nouns, verbs, adjectives, adverbs)
5. ASL often follows: TIME + TOPIC + COMMENT structure
6. Questions: Question word often at end (WHO, WHAT, WHERE, WHEN, WHY, HOW)
7. Use present tense when tense is clear from context
8. Simplify complex words to basic equivalents when possible

Examples:
"I am going to the store" → ["I", "GO", "STORE"]
"What is your name?" → ["YOUR", "NAME", "WHAT"]
"The cat is sleeping" → ["CAT", "SLEEP"]
"I will eat dinner later" → ["LATER", "I", "EAT", "DINNER"]
"Where are you going?" → ["YOU", "GO", "WHERE"]

Respond with ONLY a JSON object (no markdown, no code blocks):
{
  "original": "the original sentence",
  "aslWords": ["WORD1", "WORD2", "WORD3"],
  "explanation": "Brief explanation of ASL grammar used (1 sentence)"
}

Keep all words in UPPERCASE.
Ensure the ASL order is natural and grammatically correct for ASL.`;

        const response = await fetch(`${GEMINI_TEXT_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    topK: 20,
                    topP: 0.8,
                    maxOutputTokens: 512,
                }
            })
        });

        // Handle rate limiting
        if (response.status === 429) {
            setRateLimitCooldown(10);
            console.warn('⚠️ Rate limited during sentence analysis');
            return {
                ...defaultResponse,
                explanation: 'Rate limited. Please wait a moment and try again.'
            };
        }

        if (!response.ok) {
            console.error('❌ Gemini API error:', response.status);
            return defaultResponse;
        }

        const data = await response.json();
        const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            return defaultResponse;
        }

        console.log('📝 Raw Gemini response:', textResponse);

        // Parse JSON response
        try {
            // Try direct parse first
            const parsed = JSON.parse(textResponse.trim());
            if (parsed.original && Array.isArray(parsed.aslWords)) {
                console.log('✅ Sentence analyzed:', parsed);
                return {
                    original: parsed.original || sentence,
                    aslWords: parsed.aslWords.map(w => String(w).toUpperCase()),
                    explanation: parsed.explanation || 'ASL grammar applied'
                };
            }
        } catch {
            // Try to extract JSON from markdown code blocks
            const jsonMatch = textResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                try {
                    const parsed = JSON.parse(jsonMatch[1].trim());
                    if (parsed.aslWords) {
                        return {
                            original: parsed.original || sentence,
                            aslWords: parsed.aslWords.map(w => String(w).toUpperCase()),
                            explanation: parsed.explanation || 'ASL grammar applied'
                        };
                    }
                } catch {
                    console.warn('⚠️ Could not parse JSON from code block');
                }
            }

            // Try to find JSON object in text
            const objectMatch = textResponse.match(/\{[\s\S]*\}/);
            if (objectMatch) {
                try {
                    const parsed = JSON.parse(objectMatch[0]);
                    if (parsed.aslWords) {
                        return {
                            original: parsed.original || sentence,
                            aslWords: parsed.aslWords.map(w => String(w).toUpperCase()),
                            explanation: parsed.explanation || 'ASL grammar applied'
                        };
                    }
                } catch {
                    console.warn('⚠️ Could not parse JSON object from response');
                }
            }
        }

        return defaultResponse;
    } catch (error) {
        console.error('❌ Error analyzing sentence:', error);
        return defaultResponse;
    }
}

/**
 * Validate a hand sign in the context of a sentence word
 * 
 * @param {string} imageBase64 - Base64 encoded image (without prefix)
 * @param {string} targetWord - The word the user is trying to sign
 * @param {string} fullSentence - The complete sentence for context
 * @returns {Promise<Object>} Validation result
 */
export async function validateSentenceSign(imageBase64, targetWord, fullSentence) {
    // Default error response
    const errorResponse = {
        isCorrect: false,
        accuracy: 0,
        feedback: 'Unable to analyze. Please try again.',
        suggestions: ['Check your internet connection', 'Try again in a moment']
    };

    // Check API key
    if (!GEMINI_API_KEY) {
        console.error('❌ Gemini API key not configured');
        return {
            ...errorResponse,
            feedback: 'AI validation not configured.'
        };
    }

    // Validate input
    if (!imageBase64) {
        return {
            ...errorResponse,
            feedback: 'No image captured. Please ensure camera is working.'
        };
    }

    // Check cooldown
    const cooldown = getCooldownRemaining();
    if (cooldown > 0) {
        console.log(`⏳ Waiting ${Math.ceil(cooldown / 1000)}s for cooldown...`);
        await sleep(cooldown);
    }

    // Update last request time
    lastRequestTime = Date.now();

    console.log(`🔍 Validating sign for word "${targetWord}" in sentence context...`);

    const prompt = `You are a friendly sign language expert analyzing a hand sign in the context of a sentence.
The user is signing the word "${targetWord}" as part of the sentence: "${fullSentence}"

Since this word is being fingerspelled, check if the user is making the correct hand shape for the letter(s) in "${targetWord}".

IMPORTANT: Be VERY LENIENT. This is a learning app, not an exam. Webcam angles and lighting can affect appearance.

Analyze the hand position and respond with ONLY a valid JSON object:
{
  "isCorrect": true or false,
  "accuracy": a number between 0 and 100,
  "feedback": "brief encouraging message",
  "suggestions": ["tip 1", "tip 2"]
}

Rules:
- isCorrect = true if accuracy >= 50 (lenient for learners)
- Be encouraging and specific, focus on what they're doing right
- If the general hand shape is recognizable, give high accuracy (80-95%)
- Consider that context matters - some words can be signed differently depending on sentence meaning
- If no hand is detected, set accuracy to 0
- For fingerspelling, focus on the general letter shapes being recognizable
- Webcam distortion and angles should NOT significantly penalize the score

Respond with ONLY the JSON object, nothing else.`;

    // Retry logic with exponential backoff
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (attempt > 0) {
            const backoffTime = INITIAL_BACKOFF * Math.pow(2, attempt - 1);
            console.log(`🔄 Retry attempt ${attempt + 1}/${MAX_RETRIES} after ${backoffTime}ms...`);
            await sleep(backoffTime);
        }

        const result = await makeGeminiRequest(imageBase64, prompt);

        if (result.success) {
            const textResponse = result.data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textResponse) {
                console.error('❌ No text response from Gemini');
                return errorResponse;
            }

            console.log('📝 Raw Gemini response:', textResponse);

            const parsedResult = parseGeminiResponse(textResponse);

            if (parsedResult) {
                console.log('✅ Validation result:', parsedResult);
                return parsedResult;
            }

            return errorResponse;
        }

        if (result.rateLimited) {
            console.warn(`⚠️ Rate limited (attempt ${attempt + 1}/${MAX_RETRIES})`);
            setRateLimitCooldown(10);
            lastError = 'Rate limited';
            continue;
        }

        lastError = result.error;
    }

    // All retries exhausted
    console.error('❌ All retry attempts failed:', lastError);
    return {
        ...errorResponse,
        feedback: 'Too many requests. Please wait a moment before trying again.',
        suggestions: ['Wait 10-15 seconds', 'Try again']
    };
}

export default {
    isGeminiConfigured,
    captureFrameFromVideo,
    validateHandSign,
    analyzeSentenceToSigns,
    validateSentenceSign,
    getCooldownRemaining,
    canMakeRequest
};

