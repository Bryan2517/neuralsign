/**
 * MediaPipe Hand Tracking Service
 * Handles MediaPipe Hands integration for real-time hand landmark detection
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

// MediaPipe CDN URL
const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/';

// Brand colors for drawing
const COLORS = {
    joint: '#6366F1',      // Primary indigo for landmarks
    connection: '#8B5CF6', // Secondary purple for connections
    thumb: '#EC4899',      // Accent pink for thumb
};

// Hand landmark connections (pairs of indices to draw lines between)
const HAND_CONNECTIONS = [
    // Thumb
    [0, 1], [1, 2], [2, 3], [3, 4],
    // Index finger
    [0, 5], [5, 6], [6, 7], [7, 8],
    // Middle finger
    [0, 9], [9, 10], [10, 11], [11, 12],
    // Ring finger
    [0, 13], [13, 14], [14, 15], [15, 16],
    // Pinky
    [0, 17], [17, 18], [18, 19], [19, 20],
    // Palm connections
    [5, 9], [9, 13], [13, 17]
];

// Finger tip indices (for special highlighting)
const FINGER_TIPS = [4, 8, 12, 16, 20];

/**
 * MediaPipe Hands instance (singleton)
 */
let handsInstance = null;
let isLoading = false;
let loadError = null;

/**
 * Initialize MediaPipe Hands
 * 
 * @param {Function} onResultsCallback - Callback function called with detection results
 * @returns {Promise<Object>} MediaPipe Hands instance
 */
export async function initializeMediaPipe(onResultsCallback) {
    // Return existing instance if already initialized
    if (handsInstance) {
        console.log('ℹ️ MediaPipe already initialized, reusing instance');
        handsInstance.onResults(onResultsCallback);
        return handsInstance;
    }

    // Wait if currently loading
    if (isLoading) {
        console.log('⏳ MediaPipe is loading, waiting...');
        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                if (!isLoading) {
                    clearInterval(checkInterval);
                    if (loadError) {
                        reject(loadError);
                    } else {
                        handsInstance.onResults(onResultsCallback);
                        resolve(handsInstance);
                    }
                }
            }, 100);
        });
    }

    isLoading = true;
    loadError = null;

    try {
        console.log('🤖 Initializing MediaPipe Hands...');

        // Dynamically import MediaPipe Hands from CDN
        const Hands = await loadMediaPipeHands();

        // Create Hands instance
        handsInstance = new Hands({
            locateFile: (file) => {
                console.log(`📦 Loading MediaPipe file: ${file}`);
                return `${MEDIAPIPE_CDN}${file}`;
            }
        });

        // Configure options
        handsInstance.setOptions({
            maxNumHands: 1,           // Only track one hand for simpler learning
            modelComplexity: 1,       // 0 = lite, 1 = full
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        // Set results callback
        handsInstance.onResults(onResultsCallback);

        console.log('✅ MediaPipe Hands initialized successfully');
        isLoading = false;
        return handsInstance;
    } catch (error) {
        console.error('❌ Failed to initialize MediaPipe:', error);
        loadError = error;
        isLoading = false;
        throw error;
    }
}

/**
 * Load MediaPipe Hands from CDN
 * @returns {Promise<Function>} Hands constructor
 */
async function loadMediaPipeHands() {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.Hands) {
            resolve(window.Hands);
            return;
        }

        // Create script element
        const script = document.createElement('script');
        script.src = `${MEDIAPIPE_CDN}hands.js`;
        script.async = true;
        script.crossOrigin = 'anonymous';

        script.onload = () => {
            if (window.Hands) {
                console.log('✅ MediaPipe Hands script loaded');
                resolve(window.Hands);
            } else {
                reject(new Error('MediaPipe Hands not found after script load'));
            }
        };

        script.onerror = () => {
            reject(new Error('Failed to load MediaPipe Hands script'));
        };

        document.head.appendChild(script);
    });
}

/**
 * Send a video frame to MediaPipe for processing
 * 
 * @param {HTMLVideoElement} videoElement - Video element to process
 * @returns {Promise<void>}
 */
export async function processVideoFrame(videoElement) {
    if (!handsInstance) {
        console.warn('⚠️ MediaPipe not initialized');
        return;
    }

    if (!videoElement || videoElement.readyState < 2) {
        return;
    }

    try {
        await handsInstance.send({ image: videoElement });
    } catch (error) {
        console.warn('⚠️ Error processing video frame:', error);
    }
}

/**
 * Draw hand landmarks on a canvas
 * 
 * @param {HTMLCanvasElement} canvas - Canvas element to draw on
 * @param {Object} results - MediaPipe results object
 * @param {boolean} mirror - Whether to mirror the drawing (default true)
 */
export function drawHandLandmarks(canvas, results, mirror = true) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Check if hands detected
    if (!results?.multiHandLandmarks?.length) {
        return;
    }

    // Save context state
    ctx.save();

    // Mirror if needed (for selfie view)
    if (mirror) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }

    // Draw each detected hand
    for (const landmarks of results.multiHandLandmarks) {
        // Draw connections (lines)
        drawConnections(ctx, landmarks, canvas.width, canvas.height);

        // Draw landmarks (dots)
        drawLandmarkDots(ctx, landmarks, canvas.width, canvas.height);
    }

    // Restore context state
    ctx.restore();
}

/**
 * Draw connections between landmarks
 */
function drawConnections(ctx, landmarks, width, height) {
    ctx.strokeStyle = COLORS.connection;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    for (const [start, end] of HAND_CONNECTIONS) {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];

        if (startPoint && endPoint) {
            ctx.beginPath();
            ctx.moveTo(startPoint.x * width, startPoint.y * height);
            ctx.lineTo(endPoint.x * width, endPoint.y * height);
            ctx.stroke();
        }
    }
}

/**
 * Draw landmark dots
 */
function drawLandmarkDots(ctx, landmarks, width, height) {
    for (let i = 0; i < landmarks.length; i++) {
        const landmark = landmarks[i];
        const x = landmark.x * width;
        const y = landmark.y * height;

        // Determine color and size based on landmark type
        let color = COLORS.joint;
        let radius = 5;

        // Wrist is larger
        if (i === 0) {
            radius = 8;
        }
        // Finger tips get accent color
        else if (FINGER_TIPS.includes(i)) {
            color = COLORS.thumb;
            radius = 7;
        }
        // Thumb landmarks
        else if (i >= 1 && i <= 4) {
            color = COLORS.thumb;
        }

        // Draw outer glow
        ctx.beginPath();
        ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.fill();

        // Draw main dot
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Draw inner highlight
        ctx.beginPath();
        ctx.arc(x - radius * 0.2, y - radius * 0.2, radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
    }
}

/**
 * Extract hand landmarks from MediaPipe results
 * 
 * @param {Object} results - MediaPipe results object
 * @returns {Object} Object with detected flag and landmarks array
 */
export function extractHandLandmarks(results) {
    if (!results?.multiHandLandmarks?.length) {
        return {
            detected: false,
            landmarks: [],
            handedness: null
        };
    }

    // Get the first detected hand
    const landmarks = results.multiHandLandmarks[0];
    const handedness = results.multiHandedness?.[0]?.label || 'Unknown';

    return {
        detected: true,
        landmarks: landmarks.map((lm, index) => ({
            index,
            x: lm.x,
            y: lm.y,
            z: lm.z
        })),
        handedness
    };
}

/**
 * Get landmark name by index
 * 
 * @param {number} index - Landmark index (0-20)
 * @returns {string} Human-readable landmark name
 */
export function getLandmarkName(index) {
    const names = {
        0: 'Wrist',
        1: 'Thumb CMC',
        2: 'Thumb MCP',
        3: 'Thumb IP',
        4: 'Thumb Tip',
        5: 'Index MCP',
        6: 'Index PIP',
        7: 'Index DIP',
        8: 'Index Tip',
        9: 'Middle MCP',
        10: 'Middle PIP',
        11: 'Middle DIP',
        12: 'Middle Tip',
        13: 'Ring MCP',
        14: 'Ring PIP',
        15: 'Ring DIP',
        16: 'Ring Tip',
        17: 'Pinky MCP',
        18: 'Pinky PIP',
        19: 'Pinky DIP',
        20: 'Pinky Tip'
    };
    return names[index] || `Landmark ${index}`;
}

/**
 * Clean up MediaPipe resources
 */
export function cleanupMediaPipe() {
    if (handsInstance) {
        try {
            handsInstance.close();
        } catch (error) {
            console.warn('⚠️ Error closing MediaPipe:', error);
        }
        handsInstance = null;
    }
    isLoading = false;
    loadError = null;
    console.log('🧹 MediaPipe cleaned up');
}

/**
 * Check if MediaPipe is ready
 * @returns {boolean}
 */
export function isMediaPipeReady() {
    return handsInstance !== null && !isLoading;
}

export default {
    initializeMediaPipe,
    processVideoFrame,
    drawHandLandmarks,
    extractHandLandmarks,
    getLandmarkName,
    cleanupMediaPipe,
    isMediaPipeReady
};
