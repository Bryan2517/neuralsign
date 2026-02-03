/**
 * SignSequence Component
 * Animated sequence showing how to fingerspell each word
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    RotateCcw,
    Loader2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { getWordSign } from '@/data/commonWords';

// Lazy load 3D viewer
const HandModel3D = lazy(() => import('@/components/3d/HandModel3D'));

// Speed options in milliseconds per letter
const SPEED_OPTIONS = {
    slow: { label: 'Slow', ms: 2500 },
    normal: { label: 'Normal', ms: 1500 },
    fast: { label: 'Fast', ms: 800 }
};

/**
 * SignSequence Component
 * @param {string[]} words - Array of words to display
 * @param {Function} onWordSelect - Callback when a word is selected
 * @param {number} currentWordIndex - Currently selected word index
 */
const SignSequence = ({ words = [], onWordSelect, currentWordIndex = 0 }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState('normal');
    const [loopEnabled, setLoopEnabled] = useState(false);
    const [currentWord, setCurrentWord] = useState(currentWordIndex);
    const [currentLetter, setCurrentLetter] = useState(0);

    // Get sign data for current word
    const wordSign = getWordSign(words[currentWord] || '');
    const letters = wordSign?.letters || [];
    const currentLetterChar = letters[currentLetter] || '';

    // Reset letter when word changes
    useEffect(() => {
        setCurrentLetter(0);
    }, [currentWord]);

    // Sync with parent's currentWordIndex
    useEffect(() => {
        if (currentWordIndex !== currentWord) {
            setCurrentWord(currentWordIndex);
            setCurrentLetter(0);
        }
    }, [currentWordIndex]);

    // Auto-play logic
    useEffect(() => {
        if (!isPlaying || letters.length === 0) return;

        const timer = setTimeout(() => {
            if (currentLetter < letters.length - 1) {
                // Next letter in current word
                setCurrentLetter(currentLetter + 1);
            } else if (currentWord < words.length - 1) {
                // Next word
                setCurrentWord(currentWord + 1);
                setCurrentLetter(0);
                onWordSelect?.(words[currentWord + 1], currentWord + 1);
            } else if (loopEnabled) {
                // Loop back to start
                setCurrentWord(0);
                setCurrentLetter(0);
                onWordSelect?.(words[0], 0);
            } else {
                // Stop at end
                setIsPlaying(false);
            }
        }, SPEED_OPTIONS[speed].ms);

        return () => clearTimeout(timer);
    }, [isPlaying, currentLetter, currentWord, letters.length, words, speed, loopEnabled, onWordSelect]);

    // Navigation handlers
    const handlePrevLetter = useCallback(() => {
        if (currentLetter > 0) {
            setCurrentLetter(currentLetter - 1);
        } else if (currentWord > 0) {
            const prevWord = currentWord - 1;
            const prevWordSign = getWordSign(words[prevWord] || '');
            setCurrentWord(prevWord);
            setCurrentLetter((prevWordSign?.letters?.length || 1) - 1);
            onWordSelect?.(words[prevWord], prevWord);
        }
    }, [currentLetter, currentWord, words, onWordSelect]);

    const handleNextLetter = useCallback(() => {
        if (currentLetter < letters.length - 1) {
            setCurrentLetter(currentLetter + 1);
        } else if (currentWord < words.length - 1) {
            setCurrentWord(currentWord + 1);
            setCurrentLetter(0);
            onWordSelect?.(words[currentWord + 1], currentWord + 1);
        }
    }, [currentLetter, letters.length, currentWord, words, onWordSelect]);

    const handlePlayPause = useCallback(() => {
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    const handleRestart = useCallback(() => {
        setCurrentWord(0);
        setCurrentLetter(0);
        setIsPlaying(false);
        onWordSelect?.(words[0], 0);
    }, [words, onWordSelect]);

    const handleWordClick = useCallback((index) => {
        setCurrentWord(index);
        setCurrentLetter(0);
        onWordSelect?.(words[index], index);
    }, [words, onWordSelect]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
        >
            {/* Word Progress Dots */}
            <div className="flex items-center justify-center gap-2 mb-6">
                {words.map((word, index) => (
                    <button
                        key={`word-${index}`}
                        onClick={() => handleWordClick(index)}
                        className={`group relative px-3 py-1 rounded-lg transition-all ${index === currentWord
                                ? 'bg-primary text-white'
                                : index < currentWord
                                    ? 'bg-success/20 text-success'
                                    : 'bg-dark-600 text-dark-400 hover:bg-dark-500'
                            }`}
                    >
                        <span className="text-sm font-medium">{word}</span>
                    </button>
                ))}
            </div>

            {/* Current Word Display */}
            <div className="text-center mb-4">
                <p className="text-sm text-dark-400 mb-1">
                    Word {currentWord + 1} of {words.length}
                </p>
                <h3 className="text-2xl font-bold text-dark-100">
                    {words[currentWord]}
                </h3>
                <p className="text-sm text-dark-400 mt-1">
                    {letters.length > 1
                        ? `Fingerspelling: ${letters.join(' - ')}`
                        : 'Single letter sign'}
                </p>
            </div>

            {/* Letter Progress */}
            {letters.length > 1 && (
                <div className="flex items-center justify-center gap-1 mb-4">
                    {letters.map((letter, index) => (
                        <div
                            key={`letter-${index}`}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-all ${index === currentLetter
                                    ? 'bg-primary text-white scale-125'
                                    : index < currentLetter
                                        ? 'bg-primary/30 text-primary'
                                        : 'bg-dark-600 text-dark-400'
                                }`}
                        >
                            {letter}
                        </div>
                    ))}
                </div>
            )}

            {/* 3D Model Area */}
            <div className="relative h-64 md:h-80 mb-6 rounded-xl overflow-hidden bg-dark-700/50">
                <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                }>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentLetterChar}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full"
                        >
                            <HandModel3D
                                letter={currentLetterChar}
                                modelPath={`/models/alphabet/letter_${currentLetterChar}.glb`}
                                autoRotate={true}
                            />
                        </motion.div>
                    </AnimatePresence>
                </Suspense>

                {/* Current Letter Badge */}
                <div className="absolute top-4 left-4 px-4 py-2 rounded-xl bg-dark-800/90 backdrop-blur-sm">
                    <span className="text-3xl font-bold text-primary">{currentLetterChar}</span>
                </div>

                {/* Letter count */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-dark-800/90 backdrop-blur-sm">
                    <span className="text-sm text-dark-300">
                        Letter {currentLetter + 1}/{letters.length}
                    </span>
                </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
                {/* Restart */}
                <button
                    onClick={handleRestart}
                    className="p-2 rounded-lg bg-dark-600 text-dark-300 hover:bg-dark-500 hover:text-dark-100 transition-colors"
                    title="Restart"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>

                {/* Previous */}
                <button
                    onClick={handlePrevLetter}
                    disabled={currentWord === 0 && currentLetter === 0}
                    className="p-2 rounded-lg bg-dark-600 text-dark-300 hover:bg-dark-500 hover:text-dark-100 
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Previous letter"
                >
                    <SkipBack className="w-5 h-5" />
                </button>

                {/* Play/Pause */}
                <button
                    onClick={handlePlayPause}
                    className="p-4 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
                    title={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? (
                        <Pause className="w-6 h-6" />
                    ) : (
                        <Play className="w-6 h-6 ml-0.5" />
                    )}
                </button>

                {/* Next */}
                <button
                    onClick={handleNextLetter}
                    disabled={currentWord === words.length - 1 && currentLetter === letters.length - 1}
                    className="p-2 rounded-lg bg-dark-600 text-dark-300 hover:bg-dark-500 hover:text-dark-100 
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Next letter"
                >
                    <SkipForward className="w-5 h-5" />
                </button>

                {/* Loop Toggle */}
                <button
                    onClick={() => setLoopEnabled(!loopEnabled)}
                    className={`p-2 rounded-lg transition-colors ${loopEnabled
                            ? 'bg-primary/20 text-primary'
                            : 'bg-dark-600 text-dark-300 hover:bg-dark-500'
                        }`}
                    title={loopEnabled ? 'Loop on' : 'Loop off'}
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>

            {/* Speed Controls */}
            <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-dark-400 mr-2">Speed:</span>
                {Object.entries(SPEED_OPTIONS).map(([key, { label }]) => (
                    <button
                        key={key}
                        onClick={() => setSpeed(key)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${speed === key
                                ? 'bg-primary/20 text-primary'
                                : 'bg-dark-600 text-dark-400 hover:bg-dark-500'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </motion.div>
    );
};

export default SignSequence;
