/**
 * WordPractice Component
 * Practice signing each word individually with camera validation
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useCallback, useRef, lazy, Suspense } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    SkipForward,
    Loader2,
    Target,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import Button from '@/components/common/Button';
import { getWordSign } from '@/data/commonWords';
import { validateSentenceSign, captureFrameFromVideo, canMakeRequest, getCooldownRemaining } from '@/services/geminiService';

// Lazy load components
const HandModel3D = lazy(() => import('@/components/3d/HandModel3D'));

/**
 * WordPractice Component
 * @param {string} word - Current word to practice
 * @param {number} wordIndex - Current word index
 * @param {number} totalWords - Total number of words
 * @param {string} fullSentence - The complete sentence for context
 * @param {Function} onComplete - Callback when word is correctly signed
 * @param {Function} onSkip - Callback when user skips this word
 * @param {Function} onBack - Callback to go to previous word
 */
const WordPractice = ({
    word,
    wordIndex = 0,
    totalWords = 1,
    fullSentence = '',
    onComplete,
    onSkip,
    onBack
}) => {
    const [validationResult, setValidationResult] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState(null);
    const [currentLetter, setCurrentLetter] = useState(0);
    const [cameraReady, setCameraReady] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Get sign data for word
    const wordSign = getWordSign(word || '');
    const letters = wordSign?.letters || [];
    const currentLetterChar = letters[currentLetter] || word?.charAt(0) || 'A';

    // Start camera
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setCameraReady(true);
            }
        } catch (err) {
            console.error('Camera error:', err);
            setError({
                type: 'camera',
                message: 'Could not access camera. Please check permissions.'
            });
        }
    }, []);

    // Stop camera
// eslint-disable-next-line no-unused-vars
    const stopCamera = useCallback(() => {        
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraReady(false);
    }, []);

    // Validate sign
    const handleValidate = useCallback(async () => {
        if (!videoRef.current || !cameraReady) {
            setError({
                type: 'camera',
                message: 'Camera not ready. Please wait or refresh.'
            });
            return;
        }

        // Check cooldown
        if (!canMakeRequest()) {
            const remaining = getCooldownRemaining();
            setCooldownRemaining(Math.ceil(remaining / 1000));

            const interval = setInterval(() => {
                const newRemaining = getCooldownRemaining();
                if (newRemaining <= 0) {
                    setCooldownRemaining(0);
                    clearInterval(interval);
                } else {
                    setCooldownRemaining(Math.ceil(newRemaining / 1000));
                }
            }, 1000);

            return;
        }

        setIsValidating(true);
        setError(null);

        try {
            // Capture frame
            const imageBase64 = captureFrameFromVideo(videoRef.current);

            if (!imageBase64) {
                throw new Error('Could not capture frame from camera');
            }

            // Validate with Gemini
            const result = await validateSentenceSign(imageBase64, currentLetterChar, fullSentence);
            setValidationResult(result);

            // If correct, auto-advance after delay
            if (result.isCorrect) {
                setTimeout(() => {
                    if (currentLetter < letters.length - 1) {
                        // Next letter
                        setCurrentLetter(currentLetter + 1);
                        setValidationResult(null);
                    } else {
                        // Word complete
                        onComplete?.(result.accuracy);
                    }
                }, 1500);
            }
        } catch (err) {
            console.error('Validation error:', err);
            setError({
                type: 'validation',
                message: err.message || 'Validation failed. Please try again.'
            });
        } finally {
            setIsValidating(false);
        }
    }, [cameraReady, currentLetterChar, fullSentence, currentLetter, letters.length, onComplete]);

    // Handle retry
    const handleRetry = useCallback(() => {
        setValidationResult(null);
        setError(null);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-sm text-dark-400">
                        Word {wordIndex + 1} of {totalWords}
                    </p>
                    <h3 className="text-2xl font-bold text-dark-100">{word}</h3>
                    {letters.length > 1 && (
                        <p className="text-sm text-dark-400 mt-1">
                            Letter {currentLetter + 1}/{letters.length}: <span className="text-primary font-bold">{currentLetterChar}</span>
                        </p>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onBack}
                        disabled={wordIndex === 0}
                        className="p-2 rounded-lg bg-dark-600 text-dark-300 hover:bg-dark-500 
                                 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onSkip?.()}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-dark-600 
                                 text-dark-300 hover:bg-dark-500 transition-colors"
                    >
                        <SkipForward className="w-4 h-4" />
                        Skip
                    </button>
                </div>
            </div>

            {/* Letter Progress */}
            {letters.length > 1 && (
                <div className="flex items-center justify-center gap-1 mb-6">
                    {letters.map((letter, index) => (
                        <div
                            key={`letter-${index}`}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-all ${index === currentLetter
                                    ? 'bg-primary text-white scale-110'
                                    : index < currentLetter
                                        ? 'bg-success/20 text-success'
                                        : 'bg-dark-600 text-dark-400'
                                }`}
                        >
                            {letter}
                        </div>
                    ))}
                </div>
            )}

            {/* Main Content - Split View */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Reference Model */}
                <div className="relative h-64 rounded-xl overflow-hidden bg-dark-700/50">
                    <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-lg bg-dark-800/90">
                        <span className="text-sm text-dark-300">Reference</span>
                    </div>
                    <Suspense fallback={
                        <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    }>
                        <HandModel3D
                            letter={currentLetterChar}
                            modelPath={`/models/alphabet/letter_${currentLetterChar}.glb`}
                            autoRotate={true}
                        />
                    </Suspense>
                </div>

                {/* Camera Feed */}
                <div className="relative h-64 rounded-xl overflow-hidden bg-dark-700/50">
                    <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-lg bg-dark-800/90">
                        <span className="text-sm text-dark-300">Your Sign</span>
                    </div>

                    {!cameraReady ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                            <Camera className="w-12 h-12 text-dark-400" />
                            <Button
                                variant="primary"
                                onClick={startCamera}
                                leftIcon={<Camera className="w-4 h-4" />}
                            >
                                Start Camera
                            </Button>
                        </div>
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover transform scale-x-[-1]"
                            />

                            {/* Validation Overlay */}
                            <AnimatePresence>
                                {validationResult && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className={`absolute inset-0 flex items-center justify-center ${validationResult.isCorrect
                                                ? 'bg-success/20'
                                                : 'bg-error/20'
                                            }`}
                                    >
                                        {validationResult.isCorrect ? (
                                            <CheckCircle2 className="w-16 h-16 text-success" />
                                        ) : (
                                            <XCircle className="w-16 h-16 text-error" />
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </div>
            </div>

            {/* Validation Result */}
            <AnimatePresence>
                {validationResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mt-6 p-4 rounded-xl ${validationResult.isCorrect
                                ? 'bg-success/10 border border-success/30'
                                : 'bg-error/10 border border-error/30'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            {validationResult.isCorrect ? (
                                <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                            ) : (
                                <XCircle className="w-6 h-6 text-error flex-shrink-0" />
                            )}
                            <div className="flex-1">
                                <p className={`font-medium ${validationResult.isCorrect ? 'text-success' : 'text-error'}`}>
                                    {validationResult.isCorrect ? 'Great job!' : 'Keep trying!'}
                                </p>
                                <p className="text-sm text-dark-300 mt-1">{validationResult.feedback}</p>

                                {/* Accuracy */}
                                <div className="mt-2 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-dark-400" />
                                    <span className="text-sm text-dark-400">
                                        Accuracy: {validationResult.accuracy}%
                                    </span>
                                </div>

                                {/* Suggestions */}
                                {validationResult.suggestions?.length > 0 && !validationResult.isCorrect && (
                                    <ul className="mt-2 space-y-1">
                                        {validationResult.suggestions.map((tip, i) => (
                                            <li key={i} className="text-sm text-dark-400">• {tip}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-6 p-4 rounded-xl bg-error/10 border border-error/30"
                    >
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
                            <p className="text-sm text-error">{error.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
                {cameraReady && !validationResult?.isCorrect && (
                    <Button
                        variant="primary"
                        onClick={handleValidate}
                        isLoading={isValidating}
                        isDisabled={cooldownRemaining > 0}
                        leftIcon={isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                        className="flex-1"
                    >
                        {cooldownRemaining > 0
                            ? `Wait ${cooldownRemaining}s`
                            : isValidating
                                ? 'Validating...'
                                : 'Validate Sign'}
                    </Button>
                )}

                {validationResult && !validationResult.isCorrect && (
                    <Button
                        variant="outline"
                        onClick={handleRetry}
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                        Try Again
                    </Button>
                )}

                {validationResult?.isCorrect && currentLetter === letters.length - 1 && (
                    <Button
                        variant="success"
                        onClick={() => onComplete?.(validationResult.accuracy)}
                        leftIcon={<ChevronRight className="w-4 h-4" />}
                        className="flex-1"
                    >
                        Next Word
                    </Button>
                )}
            </div>
        </motion.div>
    );
};

export default WordPractice;
