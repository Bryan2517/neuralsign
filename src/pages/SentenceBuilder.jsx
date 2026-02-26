/**
 * Sentence Builder Page
 * FUSED VERSION: Guided Wizard (Teammate) + Free Flow Builder (Your Idea)
 * * NeuralSign - AI Sign Language Learning Platform
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Sparkles, GraduationCap, Camera,
    ChevronRight, ChevronLeft, ArrowLeft, BookOpen,
    Trophy, Home, Hand, CheckCircle
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { savePracticedSentence, getUserProgress } from '@/services/database';
import { analyzeSentenceToSigns } from '@/services/geminiService';
import SentenceInput from '@/components/sentence/SentenceInput';
import WordBreakdown from '@/components/sentence/WordBreakdown';
import SignSequence from '@/components/sentence/SignSequence';
import FullSentencePractice from '@/components/sentence/FullSentencePractice';
import SavedSentences from '@/components/sentence/SavedSentences';
import Button from '@/components/common/Button';

import CameraFeed from '@/components/camera/CameraFeed';
import { useHandDetection } from '@/hooks/useHandDetection';
import { wordValidator } from '@/services/wordValidation';

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
    { id: 'water', englishText: 'Water', isStatic: true },
    { id: 'i-me', englishText: 'I', isStatic: true },
    { id: 'you', englishText: 'You', isStatic: true },
    { id: 'yes', englishText: 'Yes', isStatic: true },
    { id: 'no', englishText: 'No', isStatic: true },
    { id: 'L', englishText: 'L', isStatic: true },
    { id: 'I', englishText: 'I', isStatic: true },
    { id: 'F', englishText: 'F', isStatic: true },
    { id: 'love', englishText: 'Love', isStatic: true }
];

// ============================================================================
// 🌟 YOUR COMPONENT: THE FREE FLOW BUILDER (Auto-Detect)
// ============================================================================
const FreeFlowMode = () => {
    const [sentence, setSentence] = useState([]);
    const [bestMatch, setBestMatch] = useState(null); 
    const [handPosition, setHandPosition] = useState({ x: 50, y: 50 }); 
    const [dwellProgress, setDwellProgress] = useState(0);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationResult, setTranslationResult] = useState(null);
    
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
                dwellStartTimeRef.current = null;
                lockedWordRef.current = null;
                return;
            }

            const landmarks = detectionResult.landmarks;
            const handedness = detectionResult.handedness || 'Right';

            let highestScore = 0;
            let topWord = null;

            ACTIVE_VOCABULARY.forEach(word => {
                const result = wordValidator.validateSign(word, landmarks, handedness);
                if (result.confidence > highestScore) {
                    highestScore = result.confidence;
                    topWord = word;
                }
            });

            let minY = 1, meanX = 0;
            landmarks.forEach(lm => {
                if (lm.y < minY) minY = lm.y;
                meanX += lm.x;
            });
            meanX = meanX / landmarks.length;
            
            setHandPosition({ x: (1 - meanX) * 100, y: minY * 100 });

            const now = Date.now();
            
            if (highestScore > 0.70) {
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
    }, [isDetecting, handDetected, detectionResult]);

    useEffect(() => {
        return () => stopDetection();
    }, []);

    const handleTranslate = () => {
        setIsTranslating(true);
        setTimeout(() => {
            setTranslationResult({
                smoothEnglish: "I want water.",
                feedback: "Good! In ASL, you can sign 'WATER' and 'I' directly."
            });
            setIsTranslating(false);
        }, 1500);
    };

    return (
        <div className="grid lg:grid-cols-1 gap-6 max-w-4xl mx-auto mt-6">
            <div className="relative glass-card p-2 rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative bg-dark-900 rounded-xl overflow-hidden aspect-video">
                    <CameraFeed
                        videoRef={videoRef} canvasRef={canvasRef} isActive={isCameraActive}
                        isLoading={isCameraLoading} isDetecting={isDetecting} handDetected={handDetected}
                        onStart={startDetection} onStop={stopDetection} onRetry={startDetection}
                    />

                    <AnimatePresence>
                        {handDetected && bestMatch && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute pointer-events-none z-20 flex flex-col items-center"
                                style={{
                                    left: `${handPosition.x}%`, top: `${Math.max(5, handPosition.y - 15)}%`, transform: 'translateX(-50%)'
                                }}
                            >
                                <div className="relative flex items-center justify-center">
                                    <svg width="80" height="80" className="absolute -top-2 -left-2 rotate-[-90deg]">
                                        <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="6" />
                                        <circle cx="40" cy="40" r="36" fill="none" stroke="#6366F1" strokeWidth="6"
                                                strokeDasharray="226" strokeDashoffset={226 - (226 * dwellProgress) / 100} 
                                        />
                                    </svg>
                                    <div className="bg-dark-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-primary/50 shadow-lg z-10">
                                        <span className="text-white font-bold text-lg tracking-wider">{bestMatch}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isCameraActive && !isCameraLoading && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm">
                            <Button variant="primary" onClick={startDetection} rightIcon={<Camera className="w-5 h-5" />}>
                                Turn On Camera to Start
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-card p-6 border border-dark-700 min-h-[120px] flex flex-col relative">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-dark-300 uppercase tracking-wider">Your Sentence</h3>
                    <Button variant="outline" className="py-1 px-3 text-xs" onClick={() => { setSentence([]); setTranslationResult(null); }}>
                        Clear
                    </Button>
                </div>
                
                <div className="flex-1 flex items-center gap-2 flex-wrap mb-4 bg-dark-800/50 p-4 rounded-xl border border-dark-600">
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
                     <Button variant="secondary" className="w-full" onClick={handleTranslate} isLoading={isTranslating} rightIcon={<Sparkles className="w-4 h-4"/>}>
                        Translate & Check Grammar
                     </Button>
                )}
            </div>

            <AnimatePresence>
                {translationResult && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="glass-card p-6 border border-success/50 bg-success/10"
                    >
                        <div className="flex items-start gap-4">
                            <CheckCircle className="w-6 h-6 text-success shrink-0 mt-1" />
                            <div>
                                <h4 className="text-sm text-dark-300 uppercase tracking-wider mb-1">Smooth English</h4>
                                <p className="text-2xl font-bold text-white mb-4">{translationResult.smoothEnglish}</p>
                                <h4 className="text-sm text-dark-300 uppercase tracking-wider mb-1">ASL Grammar Feedback</h4>
                                <p className="text-dark-100">{translationResult.feedback}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}; // <--- This was the missing bracket that broke your file!

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
            <div className="max-w-4xl mx-auto">
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
                    <div className="mt-8">
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
                                        const Icon = step.icon; const isActive = step.id === currentStep; const isCompleted = getStepIndex(currentStep) > index;
                                        return (
                                            <div key={step.id} className="flex items-center">
                                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isActive ? 'bg-primary/20 text-primary' : isCompleted ? 'bg-success/20 text-success' : 'bg-dark-700/50 text-dark-400'}`}>
                                                    <Icon className="w-5 h-5" /> <span className="hidden md:inline text-sm font-medium">{step.label}</span>
                                                </div>
                                                {index < STEP_CONFIG.length - 1 && <ChevronRight className="w-5 h-5 text-dark-500 mx-1" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
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