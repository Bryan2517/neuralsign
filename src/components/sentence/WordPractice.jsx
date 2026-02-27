/**
 * WordPractice Component
 * Practice signing each word individually with camera validation
 * * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useCallback, useRef, lazy, Suspense, useEffect } from 'react';
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
    RefreshCw,
    Box,
    Type
} from 'lucide-react';
import Button from '@/components/common/Button';
import { getWordSign } from '@/data/commonWords';

// 🚀 引入新旧两个 API，以及自动检测引擎
import { validateSentenceSign, validateWholeWordSign, captureFrameFromVideo, canMakeRequest, getCooldownRemaining } from '@/services/geminiService';
import CameraFeed from '@/components/camera/CameraFeed';
import { useHandDetection } from '@/hooks/useHandDetection';

// Lazy load components
const HandModel3D = lazy(() => import('@/components/3d/HandModel3D'));

/**
 * WordPractice Component
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
    // 🚀 新增：模式切换开关 (保留队友心血的关键)
    const [practiceMode, setPracticeMode] = useState('word'); // 'word' | 'spell'

    const [validationResult, setValidationResult] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState(null);
    const [currentLetter, setCurrentLetter] = useState(0);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    // 🚀 新增：自动检测进度条
    const [practiceProgress, setPracticeProgress] = useState(0);
    const dwellStartTimeRef = useRef(null);

    // 🚀 替换为 Free Flow 的高级自动检测 Hook
    const {
        videoRef, canvasRef, isDetecting, isCameraActive,
        isCameraLoading, handDetected, startDetection, stopDetection
    } = useHandDetection({});

    // Get sign data for word (保留队友的原版数据结构)
    const wordSign = getWordSign(word || '');
    const letters = wordSign?.letters || [];
    const currentLetterChar = letters[currentLetter] || word?.charAt(0) || 'A';

    // 确定当前应该验证的目标和显示的文字
    const isWholeWordMode = practiceMode === 'word';
    const targetSignDisplay = isWholeWordMode ? word : currentLetterChar;

    // 当切换单词时，重置状态
    useEffect(() => {
        setCurrentLetter(0);
        setValidationResult(null);
        setError(null);
        setPracticeProgress(0);
        dwellStartTimeRef.current = null;
    }, [word, practiceMode]);

    // 自动清理摄像头
    useEffect(() => {
        return () => stopDetection();
    }, [stopDetection]);

    // 🎯 核心验证逻辑 (兼容两种模式)
    const handleValidate = useCallback(async () => {
        if (!videoRef.current || !isCameraActive) {
            setError({ type: 'camera', message: 'Camera not ready. Please turn it on.' });
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
            const imageBase64 = captureFrameFromVideo(videoRef.current);
            if (!imageBase64) throw new Error('Could not capture frame from camera');

            let result;
            // 🚀 智能分流：根据模式调用不同的 AI 提示词
            if (isWholeWordMode) {
                result = await validateWholeWordSign(imageBase64, word, fullSentence);
            } else {
                result = await validateSentenceSign(imageBase64, currentLetterChar, fullSentence);
            }
            
            setValidationResult(result);

            // If correct, auto-advance after delay
            if (result.isCorrect) {
                setTimeout(() => {
                    if (isWholeWordMode) {
                        // 整词模式：直接通关这个词
                        onComplete?.(result.accuracy);
                    } else {
                        // 逐字模式：走队友的原版逻辑，进入下一个字母
                        if (currentLetter < letters.length - 1) {
                            setCurrentLetter(currentLetter + 1);
                            setValidationResult(null);
                        } else {
                            onComplete?.(result.accuracy);
                        }
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
            setPracticeProgress(0); // 重置自动检测进度条
            dwellStartTimeRef.current = null;
        }
    }, [isCameraActive, isWholeWordMode, word, currentLetterChar, fullSentence, currentLetter, letters.length, onComplete]);

    // 🚀 自动检测引擎 (1.5秒自动抓拍，彻底解放双手)
    useEffect(() => {
        let frameId;
        const processFrame = () => {
            if (!isDetecting || !handDetected || isValidating || validationResult?.isCorrect || cooldownRemaining > 0) {
                setPracticeProgress(0);
                dwellStartTimeRef.current = null;
                return;
            }

            if (!dwellStartTimeRef.current) {
                dwellStartTimeRef.current = Date.now();
            } else {
                const elapsed = Date.now() - dwellStartTimeRef.current;
                const progress = Math.min(100, (elapsed / 1500) * 100);
                setPracticeProgress(progress);

                if (progress === 100) {
                    dwellStartTimeRef.current = null;
                    handleValidate(); // 🎯 进度满，自动触发抓拍验证！
                }
            }
        };

        frameId = requestAnimationFrame(processFrame);
        return () => cancelAnimationFrame(frameId);
    }, [isDetecting, handDetected, isValidating, validationResult, cooldownRemaining, handleValidate]);

    // Handle retry
    const handleRetry = useCallback(() => {
        setValidationResult(null);
        setError(null);
        setPracticeProgress(0);
        dwellStartTimeRef.current = null;
    }, []);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            
            {/* 🚀 新增：模式切换器 Toggle */}
            <div className="flex justify-center mb-6">
                <div className="inline-flex bg-dark-800 p-1 rounded-xl border border-dark-700 shadow-inner">
                    <button 
                        onClick={() => setPracticeMode('word')} 
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${practiceMode === 'word' ? 'bg-primary text-white shadow-lg' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}
                    >
                        <Box className="w-4 h-4" /> Whole Word
                    </button>
                    <button 
                        onClick={() => setPracticeMode('spell')} 
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${practiceMode === 'spell' ? 'bg-primary text-white shadow-lg' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}
                    >
                        <Type className="w-4 h-4" /> Fingerspelling
                    </button>
                </div>
            </div>

            {/* Header (精确保留了队友的UI结构) */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-sm text-dark-400">
                        Word {wordIndex + 1} of {totalWords}
                    </p>
                    <h3 className="text-2xl font-bold text-dark-100 uppercase tracking-wide">{word}</h3>
                    {/* 仅在拼写模式下显示字母进度提示 */}
                    {!isWholeWordMode && letters.length > 1 && (
                        <p className="text-sm text-dark-400 mt-1">
                            Letter {currentLetter + 1}/{letters.length}: <span className="text-primary font-bold">{currentLetterChar}</span>
                        </p>
                    )}
                </div>
            </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onBack}
                        disabled={wordIndex === 0}
                        title="Previous Word"
                        className="p-2 rounded-lg bg-dark-600 text-dark-300 hover:bg-dark-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    {/* 🚀 新增：Skip Letter (仅在拼写模式，且当前不是最后一个字母时显示) */}
                    {!isWholeWordMode && currentLetter < letters.length - 1 && (
                        <button
                            onClick={() => {
                                setCurrentLetter(prev => prev + 1);
                                setValidationResult(null);
                                setPracticeProgress(0);
                                dwellStartTimeRef.current = null;
                            }}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-dark-600 text-dark-300 hover:bg-dark-500 transition-colors"
                        >
                            <SkipForward className="w-4 h-4" /> Skip Letter
                        </button>
                    )}

                    <button
                        onClick={() => onSkip?.()}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-dark-600 text-dark-300 hover:bg-dark-500 transition-colors"
                    >
                        <SkipForward className="w-4 h-4" /> {isWholeWordMode ? 'Skip' : 'Skip Word'}
                    </button>
                </div>

            {/* Letter Progress (仅在拼写模式下显示) */}
            {!isWholeWordMode && letters.length > 1 && (
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
            <div className="grid md:grid-cols-2 gap-6 items-stretch">
                {/* Reference Model */}
                <div className="relative h-64 md:h-80 rounded-xl overflow-hidden bg-dark-700/50 flex flex-col border border-dark-600">
                    <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-lg bg-dark-800/90 border border-dark-700">
                        <span className="text-sm text-dark-300">Reference</span>
                    </div>
                    <div className="flex-1 relative cursor-move">
                        <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>}>
                            <HandModel3D
                                letter={targetSignDisplay}
                                // 🚀 核心：如果是整词模式，传 null 触发紫色方块。否则加载具体字母模型。
                                modelPath={isWholeWordMode ? null : `/models/alphabet/letter_${currentLetterChar}.glb`}
                                autoRotate={true}
                            />
                        </Suspense>
                    </div>
                </div>
            </div>
                {/* Camera Feed */}
                <div className="relative h-64 md:h-80 rounded-xl overflow-hidden bg-dark-950 flex flex-col border border-dark-600">
                    <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-lg bg-dark-800/90 border border-dark-700">
                        <span className="text-sm text-dark-300">Your Sign</span>
                    </div>

                    <div className="flex-1 relative bg-black flex items-center justify-center">
                        {/* 🚀 修复 Camera：加上 absolute inset-0 强制铺满，避免尺寸塌陷 */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <CameraFeed
                                videoRef={videoRef} canvasRef={canvasRef} isActive={isCameraActive}
                                isLoading={isCameraLoading} isDetecting={isDetecting} handDetected={handDetected}
                                onStart={() => startDetection()} onStop={() => stopDetection()} onRetry={() => startDetection()}
                            />
                        </div>

                        {/* 🎯 自动检测进度条 */}
                        <AnimatePresence>
                            {!isValidating && !validationResult?.isCorrect && handDetected && cooldownRemaining === 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                                    className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-64"
                                >
                                    <div className="bg-dark-900/95 backdrop-blur-md p-3 rounded-xl border border-primary/40 shadow-xl flex flex-col items-center">
                                        <span className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">
                                            {practiceProgress > 0 ? "Hold it steady..." : "Show Your Hand"}
                                        </span>
                                        <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden border border-dark-700">
                                            <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-100 ease-linear" style={{ width: `${practiceProgress}%` }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Validation Overlay (精确保留队友逻辑) */}
                        <AnimatePresence>
                            {validationResult && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className={`absolute inset-0 flex items-center justify-center z-30 ${validationResult.isCorrect ? 'bg-success/20 backdrop-blur-sm' : 'bg-error/20 backdrop-blur-sm'}`}
                                >
                                    {validationResult.isCorrect ? (
                                        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring" }} className="bg-dark-900 p-6 rounded-full border-4 border-success shadow-lg">
                                            <CheckCircle2 className="w-16 h-16 text-success" />
                                        </motion.div>
                                    ) : (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-dark-900 p-6 rounded-full border-4 border-error shadow-lg">
                                            <XCircle className="w-16 h-16 text-error" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 验证中的 Loading 遮罩 */}
                        <AnimatePresence>
                            {isValidating && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 bg-dark-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                    <p className="text-primary font-bold uppercase tracking-widest animate-pulse">AI is grading...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 未开启摄像头时的占位 */}
                        {!isCameraActive && !isCameraLoading && (
                            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-dark-900/90 backdrop-blur-sm">
                                <Camera className="w-12 h-12 text-dark-400" />
                                {/* 🚀 修复点击事件：使用 () => startDetection() 确保正确触发 */}
                                <Button variant="primary" onClick={() => startDetection()} leftIcon={<Camera className="w-4 h-4" />}>
                                    Start Camera
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

            {/* Validation Result Box (精确保留队友原版) */}
            <AnimatePresence>
                {validationResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className={`mt-6 p-4 rounded-xl ${validationResult.isCorrect ? 'bg-success/10 border border-success/30' : 'bg-error/10 border border-error/30'}`}
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
                                    <span className="text-sm text-dark-400">Accuracy: {validationResult.accuracy}%</span>
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

            {/* Error Display (精确保留队友原版) */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-6 p-4 rounded-xl bg-error/10 border border-error/30">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
                            <p className="text-sm text-error">{error.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Buttons (精确保留队友原版，并适配新状态) */}
            <div className="mt-6 flex flex-wrap gap-3">
                {isCameraActive && !validationResult?.isCorrect && (
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
                                : 'Validate Sign (Manual)'}
                    </Button>
                )}

                {validationResult && !validationResult.isCorrect && (
                    <Button variant="outline" onClick={handleRetry} leftIcon={<RefreshCw className="w-4 h-4" />}>
                        Try Again
                    </Button>
                )}

                {/* 如果是 Whole Word 模式，只要正确就显示 Next Word。如果是 Spell 模式，必须是最后一个字母才显示 */}
                {validationResult?.isCorrect && (isWholeWordMode || currentLetter === letters.length - 1) && (
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