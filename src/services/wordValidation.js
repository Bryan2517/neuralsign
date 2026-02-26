/**
 * Word Sign Validation Service
 * Validates word signs using MediaPipe hand landmarks
 * MVP: Position-based validation with high-accuracy scale-invariant heuristics.
 * * NeuralSign - AI Sign Language Learning Platform
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

        // 3. Check hand shape for static signs (Fallback)
        if (word.isStatic && !['water', 'i-me', 'you', 'yes', 'no', 'love', 'L', 'I', 'F'].includes(word.id)) {
            const shapeScore = this.checkHandShape(word, landmarks);
            checks.push(shapeScore);

            if (shapeScore < 0.5) {
                feedbacks.push('Check your hand shape - make sure your fingers are in the correct position.');
            }
        }

        // 4. Check specific finger extension patterns (Strict Validation)
        const strictWords = ['water', 'i-me', 'you', 'yes', 'no', 'love', 'L', 'I', 'F'];
        if (strictWords.includes(word.id)) {
            const fingerScore = this.checkSpecificSign(word.id, landmarks);
            checks.push(fingerScore);

            if (fingerScore < 0.5) {
                feedbacks.push(word.shortDescription || 'Adjust your finger positions strictly.');
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
     * Check basic hand shape for static signs (Fallback)
     * @param {Object} word - Word definition
     * @param {Array} landmarks - Hand landmarks
     * @returns {number} Score 0-1
     */
    checkHandShape(word, landmarks) {
        if (['yes', 'sorry'].includes(word.id)) {
            const fingersCurled = ['index', 'middle', 'ring', 'pinky']
                .filter(f => !this.isFingerExtended(landmarks, f)).length;
            return fingersCurled / 4;
        }
        return 0.6; // Default moderate score for unspecified shapes
    }

    /**
     * Check specific sign configurations with STRICT penalties to prevent false positives
     * @param {string} signId - Sign identifier
     * @param {Array} landmarks - Hand landmarks
     * @returns {number} Score 0-1
     */
    checkSpecificSign(signId, landmarks) {
        // Evaluate the boolean state of all 5 fingers first
        const thumbUp = this.isFingerExtended(landmarks, 'thumb');
        const indexUp = this.isFingerExtended(landmarks, 'index');
        const middleUp = this.isFingerExtended(landmarks, 'middle');
        const ringUp = this.isFingerExtended(landmarks, 'ring');
        const pinkyUp = this.isFingerExtended(landmarks, 'pinky');

        switch (signId) {
            case 'love': {
                // ILY (I Love You) handshape: Thumb, index, and pinky extended. Middle and ring curled.
                if (thumbUp && indexUp && !middleUp && !ringUp && pinkyUp) return 0.95;
                
                // Strict Penalty: If middle or ring are up, it is not Love.
                if (middleUp || ringUp) return 0.1;
                // Strict Penalty: Missing required core fingers.
                if (!thumbUp || !indexUp || !pinkyUp) return 0.1;
                
                return 0.3;
            }
            case 'want': {
                const palmSize = Math.hypot(landmarks[9].x - landmarks[0].x, landmarks[9].y - landmarks[0].y);
                let curvedScore = 0;
                const tips = [8, 12, 16, 20];
                const mcps = [5, 9, 13, 17];
                for(let i=0; i<4; i++) {
                    const tipDist = Math.hypot(landmarks[tips[i]].x - landmarks[mcps[i]].x, landmarks[tips[i]].y - landmarks[mcps[i]].y);
                    const ratio = tipDist / palmSize;
                    if (ratio > 0.35 && ratio < 0.85) {
                        curvedScore += 0.25;
                    }
                }
                if (curvedScore >= 0.75) return 0.95;
                return 0.2;
            }
            case 'water': {
                // W handshape: index, middle, ring extended; pinky and thumb curled
                if (indexUp && middleUp && ringUp && !pinkyUp && !thumbUp) return 0.95;
                
                // Strict Penalty: If pinky is up (e.g., 5 fingers open), it's absolutely NOT water.
                if (pinkyUp || thumbUp) return 0.1; 
                // Penalty: Missing required fingers
                if (!indexUp || !middleUp || !ringUp) return 0.2;
                
                return 0.3;
            }
            case 'i-me': {
                // Pointing to self: Only index is extended
                if (indexUp && !middleUp && !ringUp && !pinkyUp && !thumbUp) return 0.95;
                
                // Strict Penalty: If other fingers are up, it's a completely different sign
                if (middleUp || ringUp || pinkyUp || thumbUp) return 0.1;
                
                return 0.3;
            }
            case 'you': {
                // Pointing index finger (Usually relies on motion/direction, but static shape is the same as 'I')
                if (indexUp && !middleUp && !ringUp && !pinkyUp) return 0.90;
                
                if (middleUp || ringUp || pinkyUp) return 0.1;
                
                return 0.3;
            }
            case 'yes': {
                // Yes sign: Fist shape (All main fingers curled down)
                if (!indexUp && !middleUp && !ringUp && !pinkyUp) return 0.90;
                
                // Strict Penalty: Fingers cannot be open for 'yes'
                if (indexUp || middleUp || ringUp) return 0.1;
                
                return 0.4;
            }
            case 'no': {
                // No sign: Index and middle extended, ring and pinky curled
                if (indexUp && middleUp && !ringUp && !pinkyUp) return 0.90;
                
                // Strict Penalty: If ring or pinky is up, it's a different sign
                if (ringUp || pinkyUp) return 0.1;
                // Penalty: Missing primary fingers
                if (!indexUp || !middleUp) return 0.2;
                
                return 0.3;
            }
            case 'L': { 
                // L handshape: Index and thumb extended, others curled
                if (indexUp && thumbUp && !middleUp && !ringUp && !pinkyUp) return 0.95;
                if (middleUp || ringUp || pinkyUp) return 0.1;
                return 0.4;
            }
            case 'I': {
                // I handshape: Only pinky extended
                if (!indexUp && !middleUp && !ringUp && pinkyUp && !thumbUp) return 0.95;
                if (indexUp || middleUp || ringUp || thumbUp) return 0.1;
                return 0.4;
            }
            case 'F': {
                // F handshape: Middle, ring, pinky extended. Index curled down to thumb.
                if (!indexUp && middleUp && ringUp && pinkyUp) return 0.95;
                if (!middleUp || !ringUp || !pinkyUp) return 0.1;
                if (indexUp) return 0.1; // Index MUST be curled
                return 0.4;
            }
            default:
                return 0.5;
        }
    }

    /**
     * HIGH ACCURACY Finger Extension Detection (Scale-Invariant Joint Distances)
     * Solves issues caused by camera distance and palm rotation.
     * * @param {Array} landmarks - Hand landmarks
     * @param {string} finger - 'index', 'middle', 'ring', 'pinky', 'thumb'
     * @returns {boolean} Whether finger is truly extended
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

        const wrist = landmarks[0];

        if (finger === 'thumb') {
            // High-precision thumb detection:
            // Calculate distance from Thumb Tip (4) to Pinky Base (17)
            const thumbToPinkyDist = Math.hypot(
                landmarks[4].x - landmarks[17].x, 
                landmarks[4].y - landmarks[17].y
            );
            // Calculate actual Palm Width: Index Base (5) to Pinky Base (17)
            const palmWidth = Math.hypot(
                landmarks[5].x - landmarks[17].x, 
                landmarks[5].y - landmarks[17].y
            );
            
            // If thumb is extended, the distance to pinky base must be noticeably larger than the palm width
            return thumbToPinkyDist > (palmWidth * 1.2);
        }

        // High-precision detection for Index, Middle, Ring, Pinky:
        // Calculate distance from Tip to Wrist
        const tipDist = Math.hypot(landmarks[f.tip].x - wrist.x, landmarks[f.tip].y - wrist.y);
        // Calculate distance from PIP (middle joint) to Wrist
        const pipDist = Math.hypot(landmarks[f.pip].x - wrist.x, landmarks[f.pip].y - wrist.y);

        // If the finger is extended, the tip MUST be significantly further from the wrist than the middle joint.
        // The 1.15 multiplier provides a strict threshold so slightly bent fingers are correctly marked as closed.
        return tipDist > (pipDist * 1.15);
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

        if (['hello', 'goodbye'].includes(word.id)) {
            if (motionAnalysis.wave?.detected) score += 0.8;
            else if (motionAnalysis.sideToSide?.detected) score += 0.6;
            checks++;
        }

        if (['sorry', 'please'].includes(word.id)) {
            if (motionAnalysis.circular) score += 0.8;
            checks++;
        }

        if (word.id === 'yes') {
            if (motionAnalysis.direction === 'down' || motionAnalysis.direction === 'up') score += 0.7;
            checks++;
        }

        if (word.id === 'no') {
            if (motionAnalysis.sideToSide?.detected && motionAnalysis.speed === 'fast') score += 0.8;
            checks++;
        }

        if (['thank-you', 'go'].includes(word.id)) {
            if (motionAnalysis.direction === 'forward') score += 0.7;
            checks++;
        }

        return checks > 0 ? score / checks : 0;
    }

    /** Generate specific feedback based on motion analysis */
    generateMotionFeedback(word, motionAnalysis, confidence) {
        if (confidence >= 0.8) return 'Excellent motion! Sign recognized perfectly! ✨';
        if (confidence >= 0.6) return 'Good motion! Sign recognized. Keep refining the movement.';

        if (['hello', 'goodbye'].includes(word.id) && !motionAnalysis.wave?.detected) return 'Try waving your hand side to side more clearly.';
        if (['sorry', 'please'].includes(word.id) && !motionAnalysis.circular) return 'Make a circular motion on your chest.';
        if (word.id === 'yes' && motionAnalysis.direction === 'stationary') return 'Nod your fist up and down.';
        if (word.id === 'no' && !motionAnalysis.sideToSide?.detected) return 'Shake your hand side to side.';

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