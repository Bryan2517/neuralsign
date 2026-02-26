/**
 * Word Sign Validation Service
 * Validates word signs using MediaPipe hand landmarks
 * MVP: Position-based validation (motion tracking deferred to Phase 2)
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

/**
 * Word Validator Class
 */
class WordValidator {
    constructor() {
        // MediaPipe landmark indices
        this.WRIST = 0;
        this.THUMB_TIP = 4;
        this.INDEX_TIP = 8;
        this.MIDDLE_TIP = 12;
        this.RING_TIP = 16;
        this.PINKY_TIP = 20;
        this.INDEX_MCP = 5;
        this.MIDDLE_MCP = 9;
        this.RING_MCP = 13;
        this.PINKY_MCP = 17;
    }

    /**
     * Validate a word sign against hand landmarks
     * @param {Object} word - Word definition with validation params
     * @param {Array} landmarks - MediaPipe hand landmarks
     * @param {string} handedness - 'Left' or 'Right'
     * @returns {Object} Validation result { isValid, confidence, feedback }
     */
    validateSign(word, landmarks, handedness = 'Right') {
        if (!word || !landmarks || landmarks.length < 21) {
            return {
                isValid: false,
                confidence: 0,
                feedback: 'No hand detected. Show your hand clearly to the camera.'
            };
        }

        const checks = [];
        const feedbacks = [];
        const validation = word.validation || {};
        const threshold = validation.confidenceThreshold || 0.7;

        // 1. Check handedness
        if (word.handedness && word.handedness !== 'both') {
            const expectedHand = word.handedness === 'right' ? 'Right' : 'Left';
            if (handedness !== expectedHand) {
                feedbacks.push(`Use your ${word.handedness} hand for this sign.`);
                checks.push(0.3);
            } else {
                checks.push(1.0);
            }
        }

        // 2. Check hand position (location)
        if (validation.handPosition) {
            const posScore = this.checkHandPosition(landmarks, validation.handPosition);
            checks.push(posScore);

            if (posScore < 0.5) {
                feedbacks.push(this.getPositionFeedback(word.location));
            }
        }

        // 3. Check hand shape for static signs
        if (word.isStatic) {
            const shapeScore = this.checkHandShape(word, landmarks);
            checks.push(shapeScore);

            if (shapeScore < 0.5) {
                feedbacks.push('Check your hand shape - make sure your fingers are in the correct position.');
            }
        }

        // 4. Check finger extension patterns
        if (word.id === 'water' || word.id === 'i-me' || word.id === 'you') {
            const fingerScore = this.checkSpecificSign(word.id, landmarks);
            checks.push(fingerScore);

            if (fingerScore < 0.5) {
                feedbacks.push(word.shortDescription || 'Adjust your finger positions.');
            }
        }

        // Calculate overall confidence
        const confidence = checks.length > 0
            ? checks.reduce((sum, c) => sum + c, 0) / checks.length
            : 0;

        const isValid = confidence >= threshold;

        // Build feedback
        let feedback;
        if (isValid) {
            if (confidence >= 0.9) {
                feedback = 'Perfect! Excellent sign execution! ✨';
            } else if (confidence >= 0.8) {
                feedback = 'Great job! Sign recognized correctly! 👍';
            } else {
                feedback = 'Good! Sign recognized. Keep practicing for better form.';
            }
        } else if (feedbacks.length > 0) {
            feedback = feedbacks[0]; // Show highest priority feedback
        } else {
            feedback = `Try again. ${word.shortDescription || 'Check the reference video.'}`;
        }

        return {
            isValid,
            confidence: Math.round(confidence * 100) / 100,
            feedback,
            details: {
                checksPerformed: checks.length,
                individualScores: checks
            }
        };
    }

    /**
     * Check if hand is in the expected position
     * @param {Array} landmarks - Hand landmarks
     * @param {Object} expectedPosition - { x: { min, max }, y: { min, max } }
     * @returns {number} Score 0-1
     */
    checkHandPosition(landmarks, expectedPosition) {
        const palmCenter = this.calculatePalmCenter(landmarks);

        const { x: expectedX, y: expectedY } = expectedPosition;
        let score = 1.0;

        if (expectedX) {
            if (palmCenter.x < expectedX.min) {
                score *= Math.max(0.2, 1 - (expectedX.min - palmCenter.x) * 3);
            } else if (palmCenter.x > expectedX.max) {
                score *= Math.max(0.2, 1 - (palmCenter.x - expectedX.max) * 3);
            }
        }

        if (expectedY) {
            if (palmCenter.y < expectedY.min) {
                score *= Math.max(0.2, 1 - (expectedY.min - palmCenter.y) * 3);
            } else if (palmCenter.y > expectedY.max) {
                score *= Math.max(0.2, 1 - (palmCenter.y - expectedY.max) * 3);
            }
        }

        return Math.max(0, Math.min(1, score));
    }

    /**
     * Calculate palm center from landmarks
     * @param {Array} landmarks - Hand landmarks
     * @returns {Object} { x, y }
     */
    calculatePalmCenter(landmarks) {
        const palmIndices = [0, 5, 9, 13, 17]; // Wrist and MCP joints
        let sumX = 0, sumY = 0;

        for (const idx of palmIndices) {
            sumX += landmarks[idx].x;
            sumY += landmarks[idx].y;
        }

        return {
            x: sumX / palmIndices.length,
            y: sumY / palmIndices.length
        };
    }

    /**
     * Check basic hand shape for static signs
     * @param {Object} word - Word definition
     * @param {Array} landmarks - Hand landmarks
     * @returns {number} Score 0-1
     */
    checkHandShape(word, landmarks) {
        // For pointing signs (pronouns), check if index finger is extended
        if (['i-me', 'you', 'he-him', 'she-her'].includes(word.id)) {
            const indexExtended = this.isFingerExtended(landmarks, 'index');
            const middleRetracted = !this.isFingerExtended(landmarks, 'middle');
            const ringRetracted = !this.isFingerExtended(landmarks, 'ring');

            let score = 0;
            if (indexExtended) score += 0.6;
            if (middleRetracted) score += 0.2;
            if (ringRetracted) score += 0.2;
            return score;
        }

        // For fist signs (yes, sorry), check all fingers curled
        if (['yes', 'sorry'].includes(word.id)) {
            const fingersCurled = ['index', 'middle', 'ring', 'pinky']
                .filter(f => !this.isFingerExtended(landmarks, f)).length;
            return fingersCurled / 4;
        }

        return 0.6; // Default moderate score for unspecified shapes
    }

    /**
     * Check specific sign configurations
     * @param {string} signId - Sign identifier
     * @param {Array} landmarks - Hand landmarks
     * @returns {number} Score 0-1
     */
    checkSpecificSign(signId, landmarks) {
        switch (signId) {
            case 'water': {
                // W handshape: index, middle, ring extended; pinky curled
                const indexUp = this.isFingerExtended(landmarks, 'index');
                const middleUp = this.isFingerExtended(landmarks, 'middle');
                const ringUp = this.isFingerExtended(landmarks, 'ring');
                const pinkyDown = !this.isFingerExtended(landmarks, 'pinky');

                let score = 0;
                if (indexUp) score += 0.3;
                if (middleUp) score += 0.3;
                if (ringUp) score += 0.2;
                if (pinkyDown) score += 0.2;
                return score;
            }
            case 'i-me': {
                // Point to self
                const indexUp = this.isFingerExtended(landmarks, 'index');
                return indexUp ? 0.8 : 0.2;
            }
            case 'you': {
                // Point forward
                const indexUp = this.isFingerExtended(landmarks, 'index');
                return indexUp ? 0.8 : 0.2;
            }
            
            default:
                return 0.5;
        }
    }

    /**
     * Check if a specific finger is extended
     * @param {Array} landmarks - Hand landmarks
     * @param {string} finger - 'index', 'middle', 'ring', 'pinky', 'thumb'
     * @returns {boolean} Whether finger is extended
     */
    isFingerExtended(landmarks, finger) {
        const fingerMap = {
            thumb: { tip: 4, pip: 3, mcp: 2 },
            index: { tip: 8, pip: 6, mcp: 5 },
            middle: { tip: 12, pip: 10, mcp: 9 },
            ring: { tip: 16, pip: 14, mcp: 13 },
            pinky: { tip: 20, pip: 18, mcp: 17 }
        };

        const f = fingerMap[finger];
        if (!f) return false;

        if (finger === 'thumb') {
            // Thumb uses x-axis comparison
            return Math.abs(landmarks[f.tip].x - landmarks[f.mcp].x) > 0.05;
        }

        // Other fingers: tip should be further from wrist than PIP joint
        const tipToWrist = Math.hypot(
            landmarks[f.tip].x - landmarks[0].x,
            landmarks[f.tip].y - landmarks[0].y
        );
        const pipToWrist = Math.hypot(
            landmarks[f.pip].x - landmarks[0].x,
            landmarks[f.pip].y - landmarks[0].y
        );

        return tipToWrist > pipToWrist * 0.95;
    }

    /**
     * Get position feedback based on location
     * @param {string} location - Expected location
     * @returns {string} Feedback message
     */
    getPositionFeedback(location) {
        const labels = {
            'chest': 'Move your hand closer to your chest.',
            'chin': 'Bring your hand up near your chin.',
            'mouth': 'Move your hand closer to your mouth.',
            'neutral-space': 'Hold your hand in front of you at mid-level.',
            'face-side': 'Position your hand near the side of your face.'
        };
        return labels[location] || 'Adjust your hand position.';
    }
}

/**
 * Enhanced Word Validator Class
 * Integrates motion tracking and gesture recognition for dynamic signs
 */
class EnhancedWordValidator {
    constructor() {
        this.baseValidator = new WordValidator();
        this.motionTracker = null;
        this.gestureRecognizer = null;
        this.initialized = false;
    }

    /** Lazy-load OpenCV services */
    async initialize() {
        if (this.initialized) return;

        try {
            const { motionTracker } = await import('./opencv/motionTracker');
            const { gestureRecognizer } = await import('./opencv/gestureRecognizer');

            this.motionTracker = motionTracker;
            this.gestureRecognizer = gestureRecognizer;

            await this.gestureRecognizer.initialize();
            this.initialized = true;
        } catch (err) {
            console.warn('Enhanced validator: OpenCV services unavailable, using base validator.', err);
        }
    }

    /**
     * Validate a sign with enhanced motion analysis
     * @param {Object} word - Word definition
     * @param {Array} landmarks - MediaPipe landmarks
     * @param {string} handedness - 'Left' or 'Right'
     * @returns {Object} Validation result
     */
    async validateSign(word, landmarks, handedness = 'Right') {
        // Always run base validation
        const baseResult = this.baseValidator.validateSign(word, landmarks, handedness);

        // If static sign or OpenCV unavailable, return base result
        if (word.isStatic || !this.initialized || !this.motionTracker) {
            return baseResult;
        }

        // Feed position into motion tracker
        this.motionTracker.addPosition(landmarks, Date.now());

        // Attempt dynamic/motion-based validation
        const motionResult = this.validateDynamicSign(word);

        if (!motionResult) {
            return baseResult;
        }

        // Merge: take the better confidence, combine feedbacks
        const mergedConfidence = Math.max(baseResult.confidence, motionResult.confidence);
        const mergedValid = mergedConfidence >= (word.validation?.confidenceThreshold || 0.7);

        return {
            isValid: mergedValid,
            confidence: Math.round(mergedConfidence * 100) / 100,
            feedback: mergedValid
                ? motionResult.feedback || baseResult.feedback
                : motionResult.feedback || baseResult.feedback,
            details: {
                ...baseResult.details,
                motionAnalysis: motionResult.motionAnalysis,
                gestureMatch: motionResult.gestureMatch
            }
        };
    }

    /**
     * Validate a dynamic sign using motion analysis
     */
    validateDynamicSign(word) {
        if (!this.motionTracker) return null;

        const motionAnalysis = this.motionTracker.analyzeMotion();

        // Need enough trajectory data
        if (motionAnalysis.trajectoryLength < 15) {
            return null;
        }

        // Try gesture recognition
        let gestureMatch = null;
        if (this.gestureRecognizer) {
            const trajectory = this.motionTracker.getTrajectory(2.0);
            const result = this.gestureRecognizer.recognizeGesture(trajectory, motionAnalysis);

            if (result.recognized && result.gesture === word.id) {
                gestureMatch = result;
            }
        }

        // Calculate confidence from motion analysis
        let motionConfidence = 0;
        const checks = [];

        // Check if motion matches expected type
        if (gestureMatch) {
            checks.push(gestureMatch.confidence);
        }

        // Validate motion patterns against word expectations
        const motionScore = this.validateBasicMotion(word, motionAnalysis);
        if (motionScore > 0) {
            checks.push(motionScore);
        }

        motionConfidence = checks.length > 0
            ? checks.reduce((s, c) => s + c, 0) / checks.length
            : 0;

        // Generate motion-specific feedback
        const feedback = this.generateMotionFeedback(word, motionAnalysis, motionConfidence);

        return {
            confidence: motionConfidence,
            feedback,
            motionAnalysis,
            gestureMatch
        };
    }

    /** Basic motion validation based on word expectations */
    validateBasicMotion(word, motionAnalysis) {
        let score = 0;
        let checks = 0;

        // Wave-type signs (hello, goodbye)
        if (['hello', 'goodbye'].includes(word.id)) {
            if (motionAnalysis.wave?.detected) {
                score += 0.8;
            } else if (motionAnalysis.sideToSide?.detected) {
                score += 0.6;
            }
            checks++;
        }

        // Circular motion signs (sorry, please)
        if (['sorry', 'please'].includes(word.id)) {
            if (motionAnalysis.circular) {
                score += 0.8;
            }
            checks++;
        }

        // Nodding signs (yes)
        if (word.id === 'yes') {
            if (motionAnalysis.direction === 'down' || motionAnalysis.direction === 'up') {
                score += 0.7;
            }
            checks++;
        }

        // Shaking signs (no)
        if (word.id === 'no') {
            if (motionAnalysis.sideToSide?.detected && motionAnalysis.speed === 'fast') {
                score += 0.8;
            }
            checks++;
        }

        // Forward motion signs (thank-you, go)
        if (['thank-you', 'go'].includes(word.id)) {
            if (motionAnalysis.direction === 'forward') {
                score += 0.7;
            }
            checks++;
        }

        return checks > 0 ? score / checks : 0;
    }

    /** Generate specific feedback based on motion analysis */
    generateMotionFeedback(word, motionAnalysis, confidence) {
        if (confidence >= 0.8) {
            return 'Excellent motion! Sign recognized perfectly! ✨';
        }

        if (confidence >= 0.6) {
            return 'Good motion! Sign recognized. Keep refining the movement.';
        }

        // Specific motion feedback
        if (['hello', 'goodbye'].includes(word.id) && !motionAnalysis.wave?.detected) {
            return 'Try waving your hand side to side more clearly.';
        }

        if (['sorry', 'please'].includes(word.id) && !motionAnalysis.circular) {
            return 'Make a circular motion on your chest.';
        }

        if (word.id === 'yes' && motionAnalysis.direction === 'stationary') {
            return 'Nod your fist up and down.';
        }

        if (word.id === 'no' && !motionAnalysis.sideToSide?.detected) {
            return 'Shake your hand side to side.';
        }

        return 'Keep practicing the motion. Watch the reference video for guidance.';
    }

    /** Get current motion data for UI display */
    getMotionData() {
        if (!this.motionTracker) return null;
        return this.motionTracker.analyzeMotion();
    }

    /** Get trajectory for overlay drawing */
    getTrajectory() {
        if (!this.motionTracker) return [];
        return this.motionTracker.getTrajectory(2.0);
    }

    /** Reset motion tracking (e.g., between attempts) */
    resetMotion() {
        if (this.motionTracker) {
            this.motionTracker.clear();
        }
    }
}

/**
 * Validate a word sign (convenience function)
 * @param {Object} word - Word definition
 * @param {Array} landmarks - MediaPipe landmarks
 * @param {string} handedness - 'Left' or 'Right'
 * @returns {Object} Validation result
 */
export function validateWordSign(word, landmarks, handedness = 'Right') {
    const validator = new WordValidator();
    return validator.validateSign(word, landmarks, handedness);
}

/**
 * Validate a word sign with enhanced motion (async convenience function)
 */
export async function validateWordSignEnhanced(word, landmarks, handedness = 'Right') {
    return await enhancedWordValidator.validateSign(word, landmarks, handedness);
}

export const wordValidator = new WordValidator();
export const enhancedWordValidator = new EnhancedWordValidator();
export default validateWordSign;
