/**
 * Sentence Builder Page
 * FUSED VERSION: Guided Wizard + Free Flow Builder
 * * NeuralSign - AI Sign Language Learning Platform
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Sparkles, GraduationCap, Camera,
    ChevronRight, ChevronLeft, ArrowLeft, BookOpen,
    Trophy, Home, Hand, CheckCircle, X, CheckCircle2, Info
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { savePracticedSentence, getUserProgress } from '@/services/database';
import { analyzeSentenceToSigns, translateASLSequence } from '@/services/geminiService';
import SentenceInput from '@/components/sentence/SentenceInput';
import WordBreakdown from '@/components/sentence/WordBreakdown';
import SignSequence from '@/components/sentence/SignSequence';
import FullSentencePractice from '@/components/sentence/FullSentencePractice';
import SavedSentences from '@/components/sentence/SavedSentences';
import Button from '@/components/common/Button';

import CameraFeed from '@/components/camera/CameraFeed';
import { useHandDetection } from '@/hooks/useHandDetection';
import { wordValidator } from '@/services/wordValidation';

// 🚀 正式引入队友的 3D 模型组件！
import ModelViewer from '@/components/3d/ModelViewer';

const STEPS = {
    INPUT: 'input', BREAKDOWN: 'breakdown', LEARN: 'learn', PRACTICE: 'practice', COMPLETE: 'complete'
};
const STEP_CONFIG = [
    { id: STEPS.INPUT, label: 'Input', icon: MessageSquare },
    { id: STEPS.BREAKDOWN, label: 'Breakdown', icon: Sparkles },
    { id: STEPS.LEARN, label: 'Learn', icon: GraduationCap },
    { id: STEPS.PRACTICE, label: 'Practice', icon: Camera }
];

const ACTIVE_VOCABULARY = [
    { id: 'i-me', englishText: 'I', isStatic: true },
    { id: 'love', englishText: 'Love', isStatic: true },
    { id: 'want', englishText: 'Want', isStatic: true }, 
    { id: 'water', englishText: 'Water', isStatic: true },
    { id: 'you', englishText: 'You', isStatic: true },
    { id: 'yes', englishText: 'Yes', isStatic: true },
    { id: 'no', englishText: 'No', isStatic: true }
];

// ============================================================================
// 🌟 THE FREE FLOW BUILDER
// ============================================================================
const FreeFlowMode = () => {
    const [sentence, setSentence] = useState([]);
    const [bestMatch, setBestMatch] = useState(null); 
    const [handPosition, setHandPosition] = useState({ x: 50, y: 50 }); 
    const [dwellProgress, setDwellProgress] = useState(0);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationResult, setTranslationResult] = useState(null);
    
    // 练习模式状态
    const [practiceWord, setPracticeWord] = useState(null); 
    const [practiceProgress, setPracticeProgress] = useState(0);
    const [isPracticeSuccess, setIsPracticeSuccess] = useState(false);

    const lockedWordRef = useRef(null);
    const dwellStartTimeRef = useRef(null);

    const {
        videoRef, canvasRef, isDetecting, isCameraActive,
        isCameraLoading, handDetected, detectionResult, startDetection, stopDetection
    } = useHandDetection({}); 

    useEffect(() => {
        let frameId;

        const processFrame = () => {
            if (!isDetecting || !handDetected || !detectionResult?.landmarks) {
                setBestMatch(null);
                setDwellProgress(0);
                setPracticeProgress(0);
                dwellStartTimeRef.current = null;
                lockedWordRef.current = null;
                return;
            }

            const landmarks = detectionResult.landmarks;
            const handedness = detectionResult.handedness || 'Right';

            let minY = 1, meanX = 0;
            landmarks.forEach(lm => {
                if (lm.y < minY) minY = lm.y;
                meanX += lm.x;
            });
            meanX = meanX / landmarks.length;
            setHandPosition({ x: (1 - meanX) * 100, y: minY * 100 });

            // 🎯 练习模式判断逻辑
            if (practiceWord) {
                if (isPracticeSuccess) return; 

                const targetWordObj = ACTIVE_VOCABULARY.find(w => w.id === practiceWord.toLowerCase());
                if (!targetWordObj) return;

                const result = wordValidator.validateSign(targetWordObj, landmarks, handedness);

                if (result.confidence > 0.80) {
                    if (!dwellStartTimeRef.current) {
                        dwellStartTimeRef.current = Date.now();
                    } else {
                        const elapsed = Date.now() - dwellStartTimeRef.current;
                        const pProgress = Math.min(100, (elapsed / 1500) * 100); 
                        setPracticeProgress(pProgress);

                        if (pProgress === 100 && !isPracticeSuccess) {
                            setIsPracticeSuccess(true);
                            setTimeout(() => {
                                setPracticeWord(null);
                                setIsPracticeSuccess(false);
                                setPracticeProgress(0);
                            }, 2000); 
                        }
                    }
                } else {
                    setPracticeProgress(0);
                    dwellStartTimeRef.current = null;
                }
                return; 
            }

            // 🗣️ 自由组句雷达模式
            let highestScore = 0;
            let topWord = null;

            ACTIVE_VOCABULARY.forEach(word => {
                const result = wordValidator.validateSign(word, landmarks, handedness);
                if (result.confidence > highestScore) {
                    highestScore = result.confidence;
                    topWord = word;
                }
            });

            const now = Date.now();
            
            if (highestScore > 0.75) {
                const currentWordText = topWord.englishText;
                setBestMatch(currentWordText); 

                if (lockedWordRef.current !== currentWordText) {
                    lockedWordRef.current = currentWordText;
                    dwellStartTimeRef.current = now;
                    setDwellProgress(0);
                } else {
                    const elapsed = now - dwellStartTimeRef.current;
                    const progress = Math.min(100, (elapsed / 2000) * 100);
                    setDwellProgress(progress);

                    if (progress === 100) {
                        setSentence(prev => [...prev, currentWordText]);
                        dwellStartTimeRef.current = now + 1500; 
                        setDwellProgress(0);
                    }
                }
            } else {
                setBestMatch("Thinking..."); 
                setDwellProgress(0); 
                lockedWordRef.current = null;
                dwellStartTimeRef.current = null;
            }
        };

        frameId = requestAnimationFrame(processFrame);
        return () => cancelAnimationFrame(frameId);
    }, [isDetecting, handDetected, detectionResult, practiceWord, isPracticeSuccess]);

    useEffect(() => {
        return () => stopDetection();
    }, []);

    const handleTranslate = async () => {
        setIsTranslating(true);
        try {
            const result = await translateASLSequence(sentence);
            setTranslationResult(result);
        } catch (error) {
            console.error("Translation failed", error);
            setTranslationResult({
                smoothEnglish: sentence.join(" "),
                feedback: "API connection failed. Please check your internet or API key.",
                missingSigns: []
            });
        } finally {
            setIsTranslating(false);
        }
    };

    const exitPracticeMode = () => {
        setPracticeWord(null);
        setIsPracticeSuccess(false);
        setPracticeProgress(0);
    };

    return (
        <div className="max-w-6xl mx-auto mt-6 relative px-2">
            
            {/* 练习模式顶部横幅 */}
            <AnimatePresence>
                {practiceWord && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -20, height: 0 }}
                        className="glass-card p-4 flex justify-between items-center border border-primary/50 shadow-lg mb-6 rounded-2xl"
                    >
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <Camera className="text-primary w-5 h-5" /> 
                                Practice Mode: <span className="text-primary capitalize">{practiceWord}</span>
                            </h2>
                            <p className="text-dark-300 text-xs mt-1">Mirror the 3D block and hold for 1.5 seconds.</p>
                        </div>
                        <Button variant="outline" onClick={exitPracticeMode} leftIcon={<X className="w-4 h-4"/>}>
                            Cancel Practice
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🚀 终极布局防爆裂设计：Flex Stretch + Min-H-0 */}
            <div className={`flex flex-col ${practiceWord ? 'lg:flex-row items-stretch' : ''} gap-6 w-full transition-all duration-500`}>
                
                {/* 左侧：摄像头区域主导高度 (flex-[2] 代表占约 66% 宽度) */}
                <div className={`relative glass-card p-2 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-center transition-all duration-500 ${practiceWord ? 'lg:flex-[2] shrink-0' : 'w-full'}`}>
                    {/* aspect-video 强制锁定 16:9 的视频比例，这是整个布局的高度基准 */}
                    <div className="relative w-full bg-dark-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                        <CameraFeed
                            videoRef={videoRef} canvasRef={canvasRef} isActive={isCameraActive}
                            isLoading={isCameraLoading} isDetecting={isDetecting} handDetected={handDetected}
                            onStart={startDetection} onStop={stopDetection} onRetry={startDetection}
                        />

                        {/* 组句雷达 */}
                        <AnimatePresence>
                            {!practiceWord && handDetected && bestMatch && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute pointer-events-none z-20 flex flex-col items-center"
                                    style={{ left: `${handPosition.x}%`, top: `${Math.max(5, handPosition.y - 15)}%`, transform: 'translateX(-50%)' }}
                                >
                                    <div className="relative flex items-center justify-center">
                                        <svg width="80" height="80" className="absolute -top-2 -left-2 rotate-[-90deg]">
                                            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="6" />
                                            <circle cx="40" cy="40" r="36" fill="none" stroke="#6366F1" strokeWidth="6" strokeDasharray="226" strokeDashoffset={226 - (226 * dwellProgress) / 100} />
                                        </svg>
                                        <div className="bg-dark-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-primary/50 shadow-lg z-10">
                                            <span className="text-white font-bold text-lg tracking-wider">{bestMatch}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 练习进度条 */}
                        <AnimatePresence>
                            {practiceWord && !isPracticeSuccess && handDetected && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                                    className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-64"
                                >
                                    <div className="bg-dark-900/95 backdrop-blur-md p-3 rounded-xl border border-primary/40 shadow-xl flex flex-col items-center">
                                        <span className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">
                                            {practiceProgress > 0 ? "Hold it steady..." : "Scanning Sign..."}
                                        </span>
                                        <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden border border-dark-700">
                                            <div 
                                                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-100 ease-linear"
                                                style={{ width: `${practiceProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 成功大满贯 */}
                        <AnimatePresence>
                            {practiceWord && isPracticeSuccess && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-30 bg-success/20 backdrop-blur-md flex flex-col items-center justify-center"
                                >
                                    <motion.div 
                                        initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring" }}
                                        className="bg-dark-900 p-6 rounded-full border-4 border-success shadow-[0_0_60px_rgba(34,197,94,0.6)] mb-4"
                                    >
                                        <CheckCircle2 className="w-16 h-16 text-success" />
                                    </motion.div>
                                    <h1 className="text-5xl font-extrabold text-white drop-shadow-xl mb-2">Perfect!</h1>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        {!isCameraActive && !isCameraLoading && (
                            <div className="absolute inset-0 z-40 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm">
                                <Button variant="primary" onClick={startDetection} rightIcon={<Camera className="w-5 h-5" />}>
                                    Turn On Camera to Start
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 右侧：队友的 3D 模型区域 (flex-[1] 代表占 33% 宽度，且高度被强制拉平) */}
                <AnimatePresence>
                    {practiceWord && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20, width: 0 }} 
                            animate={{ opacity: 1, x: 0, width: 'auto' }} 
                            exit={{ opacity: 0, x: 20, width: 0 }}
                            className="lg:flex-[1] w-full flex flex-col min-w-[280px]"
                        >
                            <div className="glass-card flex-1 flex flex-col border border-dark-600 shadow-2xl rounded-2xl bg-dark-800/80 overflow-hidden relative">
                                
                                {/* 标题栏 */}
                                <div className="p-4 border-b border-dark-700 shrink-0 bg-dark-900/40">
                                    <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-primary" /> 3D Reference
                                    </h3>
                                </div>
                                
                                {/* 核心黑魔法：min-h-0 强制内部组件(ModelViewer)收缩，绝不撑大外层 */}
                                <div className="flex-1 min-h-0 p-4 flex flex-col items-center justify-center relative">
                                    <div className="w-full flex-1 relative flex items-center justify-center min-h-0">
                                        {/* 队友的 ModelViewer，就算它报错，也只会在这个框里报错，不会影响整体布局 */}
                                        {/* 传入完整的单词(Love)，并加上 flex-1 h-full 强制约束它的高度 */}
                                            <ModelViewer 
                                                letter={practiceWord} 
                                                className="flex-1 w-full min-h-0 h-full" 
                                            />
                                    </div>
                                    
                                    {/* 底部文字 */}
                                    <div className="text-center shrink-0 w-full mt-2 bg-dark-900/60 py-3 rounded-xl border border-dark-700/50 backdrop-blur-sm">
                                        <p className="text-2xl font-black text-white capitalize tracking-wide drop-shadow-md">{practiceWord}</p>
                                        <p className="text-xs text-primary mt-1 opacity-80">Target Sign</p>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 底部：Sentence Dock */}
            <AnimatePresence>
                {!practiceWord && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                        <div className="glass-card p-6 border border-dark-700 min-h-[120px] flex flex-col relative mt-6 rounded-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-medium text-dark-300 uppercase tracking-wider">Your Sentence</h3>
                                <Button variant="outline" className="py-1 px-3 text-xs" onClick={() => { setSentence([]); setTranslationResult(null); }}>
                                    Clear
                                </Button>
                            </div>
                            
                            <div className="flex-1 flex items-center gap-2 flex-wrap mb-4 bg-dark-800/50 p-4 rounded-xl border border-dark-600 shadow-inner">
                                {sentence.length === 0 ? (
                                    <p className="text-dark-500 italic w-full text-center py-2">No words captured yet. Sign continuously to build...</p>
                                ) : (
                                    sentence.map((word, idx) => (
                                        <motion.div key={idx} initial={{ scale: 0, x: -20 }} animate={{ scale: 1, x: 0 }}
                                            className="bg-primary border border-primary-light px-4 py-2 rounded-lg text-white font-bold shadow-lg"
                                        >
                                            {word}
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {sentence.length > 0 && !translationResult && (
                                <Button variant="secondary" className="w-full shadow-lg hover:shadow-primary/20" onClick={handleTranslate} isLoading={isTranslating} rightIcon={<Sparkles className="w-4 h-4"/>}>
                                    Translate & Check Grammar
                                </Button>
                            )}
                        </div>

                        {/* Gemini 反馈与练习推荐 */}
                        {translationResult && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="glass-card p-6 border border-success/50 bg-gradient-to-br from-success/10 to-transparent mt-4 shadow-2xl rounded-2xl"
                            >
                                <div className="flex items-start gap-4">
                                    <CheckCircle className="w-6 h-6 text-success shrink-0 mt-1 drop-shadow" />
                                    <div className="flex-1">
                                        <h4 className="text-sm text-dark-300 uppercase tracking-wider mb-1">Smooth English</h4>
                                        <p className="text-2xl font-bold text-white mb-4">{translationResult.smoothEnglish}</p>
                                        
                                        {/* 🚀 完美复刻队友的 Grammar Note UI */}
                                        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6 mt-4 shadow-inner">
                                            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 drop-shadow-md" />
                                            <div>
                                                <p className="text-sm font-bold text-dark-200 mb-1 tracking-wide">Grammar Note</p>
                                                <p className="text-sm text-dark-400 leading-relaxed">
                                                {translationResult.feedback}
                                                </p>
                                            </div>
                                        </div>

                                        {translationResult.missingSigns && translationResult.missingSigns.length > 0 && (
                                            <div className="border-t border-success/20 pt-5">
                                                <h4 className="text-sm font-bold text-warning uppercase tracking-wider mb-4 flex items-center gap-2 drop-shadow">
                                                    <Sparkles className="w-5 h-5" /> Practice Missing Signs:
                                                </h4>
                                                <div className="flex flex-wrap gap-4">
                                                    {translationResult.missingSigns.slice(0, 2).map((sign, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            onClick={() => setPracticeWord(sign)} 
                                                            className="group flex items-center gap-4 bg-dark-800 p-4 rounded-2xl border-2 border-dark-600 hover:border-primary cursor-pointer transition-all hover:scale-105 shadow-xl hover:shadow-primary/30"
                                                        >
                                                            <div className="w-20 h-20 rounded-xl bg-dark-900 border border-primary/20 flex items-center justify-center relative overflow-hidden group-hover:bg-primary/5 transition-colors">
                                                                <Hand className="w-10 h-10 text-primary/20 absolute z-0" />
                                                                <svg className="absolute inset-0 w-full h-full z-10 drop-shadow-md" viewBox="0 0 100 100">
                                                                    <path d="M50 90 L30 50 M50 90 L45 45 M50 90 L60 45 M50 90 L75 50" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" fill="none"/>
                                                                    <path d="M30 50 L20 30 L15 15 M45 45 L40 20 L35 10 M60 45 L65 20 L70 10 M75 50 L85 30 L90 15" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="2" fill="none"/>
                                                                    <circle cx="50" cy="90" r="3" fill="#EC4899"/>
                                                                    <circle cx="30" cy="50" r="2.5" fill="#8B5CF6"/> <circle cx="20" cy="30" r="2" fill="#8B5CF6"/> <circle cx="15" cy="15" r="2.5" fill="#6366F1"/>
                                                                    <circle cx="45" cy="45" r="2.5" fill="#8B5CF6"/> <circle cx="40" cy="20" r="2" fill="#8B5CF6"/> <circle cx="35" cy="10" r="2.5" fill="#6366F1"/>
                                                                    <circle cx="60" cy="45" r="2.5" fill="#8B5CF6"/> <circle cx="65" cy="20" r="2" fill="#8B5CF6"/> <circle cx="70" cy="10" r="2.5" fill="#6366F1"/>
                                                                    <circle cx="75" cy="50" r="2.5" fill="#8B5CF6"/> <circle cx="85" cy="30" r="2" fill="#8B5CF6"/> <circle cx="90" cy="15" r="2.5" fill="#6366F1"/>
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-extrabold text-2xl capitalize tracking-wide group-hover:text-primary transition-colors">{sign}</p>
                                                                <p className="text-sm text-primary mt-1 flex items-center gap-1 opacity-80 group-hover:opacity-100 font-medium">
                                                                    <Camera className="w-4 h-4"/> Click to practice
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ============================================================================
// 👑 MAIN PAGE EXPORT
// ============================================================================
const SentenceBuilder = () => {
    const [mode, setMode] = useState('freeflow'); 
    const { user } = useAuthStore();

    const [currentStep, setCurrentStep] = useState(STEPS.INPUT);
    const [sentenceData, setSentenceData] = useState({ original: '', aslWords: [], explanation: '' });
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    
    // eslint-disable-next-line no-unused-vars
    const [learnMode, setLearnMode] = useState('sequence'); 
    // eslint-disable-next-line no-unused-vars
    const [practiceResults, setPracticeResults] = useState(null);
    
    const [savedSentences, setSavedSentences] = useState([]);
    const [showSavedSentences, setShowSavedSentences] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadSentences = async () => {
            if (user?.uid) {
                try {
                    const progress = await getUserProgress(user.uid);
                    if (progress?.practicedSentences) setSavedSentences(progress.practicedSentences);
                } catch (error) { console.error(error); }
            }
        };
        loadSentences();
    }, [user?.uid]);

    const handleSentenceSubmit = useCallback(async (sentence) => {
        setIsTranslating(true);
        try {
            const result = await analyzeSentenceToSigns(sentence);
            setSentenceData({ original: result.original || sentence, aslWords: result.aslWords || [], explanation: result.explanation || '' });
            setCurrentStep(STEPS.BREAKDOWN);
        } catch (error) { console.error(error); } finally { setIsTranslating(false); }
    }, []);

    const handleWordClick = useCallback((word, index) => { setCurrentWordIndex(index); setCurrentStep(STEPS.LEARN); }, []);
    const handleWordSelect = useCallback((word, index) => { setCurrentWordIndex(index); }, []);

    const handlePracticeComplete = useCallback(async (results) => {
        setPracticeResults(results); setCurrentStep(STEPS.COMPLETE);
        if (user?.uid) {
            setIsSaving(true);
            try {
                const sentenceRecord = { id: Date.now().toString(), original: sentenceData.original, aslWords: sentenceData.aslWords, accuracy: results.averageAccuracy, duration: results.duration, completedAt: Date.now() };
                await savePracticedSentence(user.uid, sentenceRecord);
                setSavedSentences(prev => [sentenceRecord, ...prev]);
            } catch (error) { console.error(error); } finally { setIsSaving(false); }
        }
    }, [user?.uid, sentenceData]);

    const handlePracticeExit = useCallback(() => {
        setCurrentStep(STEPS.INPUT); setSentenceData({ original: '', aslWords: [], explanation: '' });
        setCurrentWordIndex(0); setPracticeResults(null);
    }, []);

    const handlePracticeSaved = useCallback((sentence) => {
        setSentenceData({ original: sentence.original, aslWords: sentence.aslWords, explanation: '' });
        setShowSavedSentences(false); setCurrentStep(STEPS.BREAKDOWN);
    }, []);

    const handleDeleteSentence = useCallback((id) => { setSavedSentences(prev => prev.filter(s => s.id !== id)); }, []);

    const goToNextStep = useCallback(() => {
        const stepOrder = [STEPS.INPUT, STEPS.BREAKDOWN, STEPS.LEARN, STEPS.PRACTICE];
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex < stepOrder.length - 1) setCurrentStep(stepOrder[currentIndex + 1]);
    }, [currentStep]);

    const goToPrevStep = useCallback(() => {
        const stepOrder = [STEPS.INPUT, STEPS.BREAKDOWN, STEPS.LEARN, STEPS.PRACTICE];
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex > 0) setCurrentStep(stepOrder[currentIndex - 1]);
    }, [currentStep]);

    const getStepIndex = (step) => STEP_CONFIG.findIndex(s => s.id === step);

    return (
        <div className="min-h-screen bg-dark-900 pt-20 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3">
                        Sentence Builder
                    </h1>
                    <p className="text-dark-400 text-lg max-w-xl mx-auto mb-6">
                        Build sentences using sign language or learn pre-written ASL phrases.
                    </p>
                    
                    <div className="inline-flex bg-dark-800 p-1 rounded-xl border border-dark-700 shadow-inner">
                        <button onClick={() => setMode('freeflow')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'freeflow' ? 'bg-primary text-white shadow-lg' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}>
                            <Hand className="w-4 h-4" /> Free Sign
                        </button>
                        <button onClick={() => setMode('guided')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'guided' ? 'bg-primary text-white shadow-lg' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}>
                            <BookOpen className="w-4 h-4" /> Guided 
                        </button>
                    </div>
                </motion.div>

                {mode === 'freeflow' ? <FreeFlowMode /> : (
                    <div className="mt-8 max-w-4xl mx-auto">
                        {currentStep === STEPS.INPUT && (
                            <div className="text-center mb-6">
                                <button onClick={() => setShowSavedSentences(!showSavedSentences)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700/50 text-dark-300 hover:bg-dark-700 transition-colors">
                                    <BookOpen className="w-4 h-4" /> {showSavedSentences ? 'New Sentence' : `My Sentences (${savedSentences.length})`}
                                </button>
                            </div>
                        )}
                        {currentStep !== STEPS.COMPLETE && !showSavedSentences && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
                                <div className="flex items-center justify-center gap-2 md:gap-4">
                                    {STEP_CONFIG.map((step, index) => {
                                        const Icon = step.icon; 
                                        const isActive = step.id === currentStep; 
                                        const isCompleted = getStepIndex(currentStep) > index;
                                        return (
                                            <div key={step.id} className="flex items-center">
                                                {/* 🚀 核心修改：将 div 换成 button，加入 onClick 事件和悬浮动效，支持全局自由跳转！ */}
                                                <button 
                                                    onClick={() => setCurrentStep(step.id)}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm ${isActive ? 'bg-primary text-white shadow-primary/30' : isCompleted ? 'bg-success/20 text-success hover:bg-success/30' : 'bg-dark-700/50 text-dark-400 hover:bg-dark-600'}`}
                                                >
                                                    <Icon className="w-5 h-5" /> 
                                                    <span className="hidden md:inline text-sm font-bold tracking-wide">{step.label}</span>
                                                </button>
                                                {index < STEP_CONFIG.length - 1 && <ChevronRight className="w-5 h-5 text-dark-500 mx-1 md:mx-2" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            {/* The rest of the guided mode code remains exactly the same */}
                            {showSavedSentences && currentStep === STEPS.INPUT && (
                                <motion.div key="saved" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                    <SavedSentences sentences={savedSentences} onPractice={handlePracticeSaved} onDelete={handleDeleteSentence} />
                                </motion.div>
                            )}
                            {currentStep === STEPS.INPUT && !showSavedSentences && (
                                <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                    <SentenceInput onSentenceSubmit={handleSentenceSubmit} isLoading={isTranslating} />
                                </motion.div>
                            )}
                            {currentStep === STEPS.BREAKDOWN && (
                                <motion.div key="breakdown" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                                    <WordBreakdown original={sentenceData.original} aslWords={sentenceData.aslWords} explanation={sentenceData.explanation} onWordClick={handleWordClick} />
                                    <div className="flex flex-wrap gap-4 justify-between">
                                        <Button variant="outline" onClick={() => setCurrentStep(STEPS.INPUT)} leftIcon={<ChevronLeft className="w-4 h-4" />}>New Sentence</Button>
                                        <div className="flex gap-3">
                                            <Button variant="secondary" onClick={() => { setLearnMode('sequence'); goToNextStep(); }} leftIcon={<GraduationCap className="w-4 h-4" />}>Watch Sequence</Button>
                                            <Button variant="primary" onClick={() => { setLearnMode('practice'); setCurrentStep(STEPS.PRACTICE); }} leftIcon={<Camera className="w-4 h-4" />}>Start Practice</Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            {currentStep === STEPS.LEARN && (
                                <motion.div key="learn" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                                    <SignSequence words={sentenceData.aslWords} currentWordIndex={currentWordIndex} onWordSelect={handleWordSelect} />
                                    <div className="flex flex-wrap gap-4 justify-between">
                                        <Button variant="outline" onClick={goToPrevStep} leftIcon={<ChevronLeft className="w-4 h-4" />}>Back to Breakdown</Button>
                                        <Button variant="primary" onClick={goToNextStep} rightIcon={<ChevronRight className="w-4 h-4" />}>Start Practice</Button>
                                    </div>
                                </motion.div>
                            )}
                            {currentStep === STEPS.PRACTICE && (
                                <motion.div key="practice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                    <FullSentencePractice sentence={sentenceData.original} words={sentenceData.aslWords} onComplete={handlePracticeComplete} onExit={handlePracticeExit} />
                                </motion.div>
                            )}
                            {currentStep === STEPS.COMPLETE && (
                                <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-8 text-center">
                                    <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.2 }} className="mb-6">
                                        <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-warning/20 to-secondary/20"><Trophy className="w-20 h-20 text-warning" /></div>
                                    </motion.div>
                                    <h2 className="text-3xl font-bold text-dark-100 mb-2">Sentence Completed!</h2>
                                    <p className="text-xl text-dark-300 mb-8">"{sentenceData.original}"</p>
                                    {isSaving && <p className="text-sm text-dark-400 mb-4">Saving your progress...</p>}
                                    <div className="flex flex-wrap justify-center gap-4">
                                        <Button variant="outline" onClick={() => { setCurrentStep(STEPS.BREAKDOWN); setPracticeResults(null); }} leftIcon={<ArrowLeft className="w-4 h-4" />}>Practice Again</Button>
                                        <Button variant="primary" onClick={handlePracticeExit} leftIcon={<Home className="w-4 h-4" />}>New Sentence</Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SentenceBuilder;