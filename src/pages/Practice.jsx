/**
 * Practice Page
 * Camera-based practice with AI validation
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Hand,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Camera,
    Zap,
    Target,
    Trophy,
    Flame,
    BarChart3,
    Loader2
} from 'lucide-react';

// Components
import PageContainer from '@/components/layout/PageContainer';
import CameraFeed from '@/components/camera/CameraFeed';
import ValidationFeedback from '@/components/feedback/ValidationFeedback';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Hooks
import { useHandDetection } from '@/hooks/useHandDetection';
import { usePractice } from '@/hooks/usePractice';

// Data
import { getSignByLetter } from '@/data/signsData';

// Lazy load 3D viewer
const ModelViewer = lazy(() => import('@/components/3d/ModelViewer'));

/**
 * Session stats card
 */
const SessionStats = ({ attempts, bestAccuracy, correctAttempts }) => (
    <div className="grid grid-cols-3 gap-3">
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-3 text-center"
        >
            <Target className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-xl font-bold text-dark-100">{attempts}</div>
            <div className="text-xs text-dark-400">Attempts</div>
        </motion.div>
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-3 text-center"
        >
            <BarChart3 className="w-5 h-5 text-secondary mx-auto mb-1" />
            <div className="text-xl font-bold text-dark-100">{bestAccuracy}%</div>
            <div className="text-xs text-dark-400">Best</div>
        </motion.div>
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-3 text-center"
        >
            <Trophy className="w-5 h-5 text-accent mx-auto mb-1" />
            <div className="text-xl font-bold text-dark-100">{correctAttempts}</div>
            <div className="text-xs text-dark-400">Correct</div>
        </motion.div>
    </div>
);

/**
 * Letter navigation component
 */
const LetterNav = ({
    currentLetter,
    currentIndex,
    total,
    onPrev,
    onNext,
    hasPrev,
    hasNext
}) => (
    <div className="flex items-center justify-between">
        <Button
            variant="ghost"
            size="sm"
            onClick={onPrev}
            disabled={!hasPrev}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
            Prev
        </Button>
        <span className="text-dark-400 text-sm">
            {currentIndex + 1} / {total}
        </span>
        <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            disabled={!hasNext}
            rightIcon={<ChevronRight className="w-4 h-4" />}
        >
            Next
        </Button>
    </div>
);

/**
 * Practice Page Component
 */
const Practice = () => {
    const navigate = useNavigate();
    const [isPracticing, setIsPracticing] = useState(false);
    const hasStartedRef = useRef(false);

    // Practice hook
    const {
        targetLetter,
        setTargetLetter,
        attempts,
        correctAttempts,
        bestAccuracy,
        handleValidationResult,
        handleCorrectSign,
        nextLetter,
        prevLetter,
        hasNextLetter,
        hasPrevLetter,
        currentLetterIndex,
        totalLetters
    } = usePractice();

    // Detection hook
    const {
        videoRef,
        canvasRef,
        isDetecting,
        isValidating,
        isCameraActive,
        isCameraLoading,
        handDetected,
        validationResult,
        error,
        cooldownRemaining,
        startDetection,
        stopDetection,
        validateSign,
        clearValidation
    } = useHandDetection({
        targetLetter,
        onCorrectSign: handleCorrectSign,
        onValidationResult: handleValidationResult
    });

    // Get sign data for current letter
    const signData = getSignByLetter(targetLetter);

    /**
     * Start practice mode - just set state, detection starts via useEffect
     */
    const handleStartPractice = useCallback(() => {
        setIsPracticing(true);
    }, []);

    /**
     * Stop practice mode
     */
    const handleStopPractice = useCallback(() => {
        stopDetection();
        setIsPracticing(false);
    }, [stopDetection]);

    /**
     * Handle validate button click
     */
    const handleValidate = useCallback(async () => {
        await validateSign();
    }, [validateSign]);

    /**
     * Handle try again
     */
    const handleTryAgain = useCallback(() => {
        clearValidation();
    }, [clearValidation]);

    /**
     * Handle next letter
     */
    const handleNextLetter = useCallback(() => {
        clearValidation();
        nextLetter();
    }, [clearValidation, nextLetter]);

    /**
     * Handle letter change
     */
    const handleLetterChange = useCallback((letter) => {
        clearValidation();
        setTargetLetter(letter);
    }, [clearValidation, setTargetLetter]);

    /**
     * Handle prev letter
     */
    const handlePrevLetter = useCallback(() => {
        clearValidation();
        prevLetter();
    }, [clearValidation, prevLetter]);

    // Start detection after video element is mounted
    useEffect(() => {
        if (isPracticing && !hasStartedRef.current) {
            hasStartedRef.current = true;
            // Use requestAnimationFrame to ensure DOM is painted
            const timer = setTimeout(() => {
                requestAnimationFrame(() => {
                    startDetection();
                });
            }, 150);
            return () => clearTimeout(timer);
        }

        // Reset the ref when practice stops
        if (!isPracticing) {
            hasStartedRef.current = false;
        }
    }, [isPracticing]); // Intentionally exclude startDetection to prevent infinite loop

    // Cleanup on unmount only
    useEffect(() => {
        return () => {
            stopDetection();
        };
    }, []); // Empty deps - only run on unmount

    // Show initial mode selection if not practicing
    if (!isPracticing) {
        return (
            <PageContainer>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-secondary/10">
                            <Hand className="w-8 h-8 text-secondary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-dark-100">Practice</h1>
                            <p className="text-dark-400">Practice ASL signs with AI validation</p>
                        </div>
                    </div>
                </motion.div>

                {/* Camera Practice Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 mb-6"
                >
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-dark-100 mb-1">
                                Camera Practice
                            </h2>
                            <p className="text-dark-400 text-sm">
                                Use your camera to practice signs with real-time AI feedback.
                                Make the sign, then tap Validate to check your accuracy.
                            </p>
                        </div>
                    </div>

                    {/* Target letter selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-dark-300 mb-3">
                            Select letter to practice:
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => (
                                <button
                                    key={letter}
                                    onClick={() => handleLetterChange(letter)}
                                    className={`
                                        w-10 h-10 rounded-lg font-bold text-lg transition-all duration-200
                                        ${targetLetter === letter
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                            : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-dark-100'
                                        }
                                    `}
                                >
                                    {letter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Start button */}
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={handleStartPractice}
                        leftIcon={<Camera className="w-5 h-5" />}
                    >
                        Start Practice with Letter {targetLetter}
                    </Button>
                </motion.div>

                {/* AI Features Note */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 flex items-start gap-4"
                >
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-dark-100 mb-1">Powered by AI</h3>
                        <p className="text-sm text-dark-400">
                            NeuralSign uses Google's Gemini AI to analyze your hand positions
                            and provide personalized feedback. MediaPipe tracks your hand in
                            real-time for accurate detection.
                        </p>
                    </div>
                </motion.div>
            </PageContainer>
        );
    }

    // Practice mode active
    return (
        <PageContainer>
            {/* Header with back button */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-6"
            >
                <Button
                    variant="ghost"
                    onClick={handleStopPractice}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                    Exit Practice
                </Button>

                <div className="flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-full">
                    <Flame className="w-4 h-4 text-accent" />
                    <span className="text-dark-200 font-medium">
                        Practicing: <span className="text-primary font-bold">{targetLetter}</span>
                    </span>
                </div>
            </motion.div>

            {/* Main content - two column layout */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Left column: Camera + Controls */}
                <div className="space-y-4">
                    {/* Camera feed */}
                    <CameraFeed
                        videoRef={videoRef}
                        canvasRef={canvasRef}
                        isActive={isCameraActive}
                        isLoading={isCameraLoading}
                        isDetecting={isDetecting}
                        handDetected={handDetected}
                        error={error}
                        onStart={startDetection}
                        onStop={stopDetection}
                        onRetry={startDetection}
                    />

                    {/* Validate button */}
                    <AnimatePresence>
                        {isCameraActive && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                            >
                                <Button
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    onClick={handleValidate}
                                    disabled={isValidating || cooldownRemaining > 0}
                                    leftIcon={
                                        isValidating
                                            ? <Loader2 className="w-5 h-5 animate-spin" />
                                            : <Zap className="w-5 h-5" />
                                    }
                                    className={`
                                        ${!isValidating && cooldownRemaining === 0
                                            ? 'animate-pulse-subtle'
                                            : ''
                                        }
                                    `}
                                >
                                    {isValidating
                                        ? 'Analyzing...'
                                        : cooldownRemaining > 0
                                            ? `Wait ${cooldownRemaining}s...`
                                            : 'Validate Sign'
                                    }
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Letter navigation */}
                    <LetterNav
                        currentLetter={targetLetter}
                        currentIndex={currentLetterIndex}
                        total={totalLetters}
                        onPrev={handlePrevLetter}
                        onNext={handleNextLetter}
                        hasPrev={hasPrevLetter()}
                        hasNext={hasNextLetter()}
                    />
                </div>

                {/* Right column: Target + Feedback + Stats */}
                <div className="space-y-4">
                    {/* Target letter display */}
                    <motion.div
                        key={targetLetter}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-6 text-center"
                    >
                        <div className="text-sm text-dark-400 mb-2">Make this sign:</div>
                        <div className="text-8xl font-bold gradient-text mb-4">
                            {targetLetter}
                        </div>
                        {signData && (
                            <div className="text-sm text-dark-400">
                                {signData.description}
                            </div>
                        )}
                    </motion.div>

                    {/* 3D Model (optional) */}
                    <Suspense fallback={
                        <div className="glass-card p-4 aspect-square flex items-center justify-center">
                            <LoadingSpinner text="Loading model..." />
                        </div>
                    }>
                        <div className="hidden lg:block">
                            <ModelViewer
                                letter={targetLetter}
                                showControls={false}
                                height="250px"
                            />
                        </div>
                    </Suspense>

                    {/* Validation feedback */}
                    <ValidationFeedback
                        result={validationResult}
                        isValidating={isValidating}
                        targetLetter={targetLetter}
                        onTryAgain={handleTryAgain}
                        onNext={handleNextLetter}
                        cooldownRemaining={cooldownRemaining}
                    />

                    {/* Session stats */}
                    <SessionStats
                        attempts={attempts}
                        bestAccuracy={bestAccuracy}
                        correctAttempts={correctAttempts}
                    />
                </div>
            </div>
        </PageContainer>
    );
};

export default Practice;
