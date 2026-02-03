/**
 * Sentence Builder Page
 * Main page for translating sentences to ASL and practicing
 * 
 * Multi-step flow: INPUT → BREAKDOWN → LEARN → PRACTICE
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Sparkles,
    GraduationCap,
    Camera,
    ChevronRight,
    ChevronLeft,
    ArrowLeft,
    BookOpen,
    Trophy,
    Home
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

// Steps for the wizard
const STEPS = {
    INPUT: 'input',
    BREAKDOWN: 'breakdown',
    LEARN: 'learn',
    PRACTICE: 'practice',
    COMPLETE: 'complete'
};

// Step configuration
const STEP_CONFIG = [
    { id: STEPS.INPUT, label: 'Input', icon: MessageSquare },
    { id: STEPS.BREAKDOWN, label: 'Breakdown', icon: Sparkles },
    { id: STEPS.LEARN, label: 'Learn', icon: GraduationCap },
    { id: STEPS.PRACTICE, label: 'Practice', icon: Camera }
];

const SentenceBuilder = () => {
    const { user } = useAuthStore();

    // Step state
    const [currentStep, setCurrentStep] = useState(STEPS.INPUT);

    // Sentence data
    const [sentenceData, setSentenceData] = useState({
        original: '',
        aslWords: [],
        explanation: ''
    });

    // Learning state
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [learnMode, setLearnMode] = useState('sequence'); // 'sequence' | 'practice'

    // Practice results
    const [practiceResults, setPracticeResults] = useState(null);

    // Saved sentences
    const [savedSentences, setSavedSentences] = useState([]);
    const [showSavedSentences, setShowSavedSentences] = useState(false);

    // Loading states
    const [isTranslating, setIsTranslating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Load saved sentences on mount
    useEffect(() => {
        const loadSentences = async () => {
            if (user?.uid) {
                try {
                    const progress = await getUserProgress(user.uid);
                    if (progress?.practicedSentences) {
                        setSavedSentences(progress.practicedSentences);
                    }
                } catch (error) {
                    console.error('Error loading sentences:', error);
                }
            }
        };
        loadSentences();
    }, [user?.uid]);

    // Handle sentence submit (from input)
    const handleSentenceSubmit = useCallback(async (sentence) => {
        setIsTranslating(true);

        try {
            const result = await analyzeSentenceToSigns(sentence);

            setSentenceData({
                original: result.original || sentence,
                aslWords: result.aslWords || [],
                explanation: result.explanation || ''
            });

            setCurrentStep(STEPS.BREAKDOWN);
        } catch (error) {
            console.error('Error analyzing sentence:', error);
        } finally {
            setIsTranslating(false);
        }
    }, []);

    // Handle word click in breakdown
    const handleWordClick = useCallback((word, index) => {
        setCurrentWordIndex(index);
        setCurrentStep(STEPS.LEARN);
    }, []);

    // Handle word selection in sequence
    const handleWordSelect = useCallback((word, index) => {
        setCurrentWordIndex(index);
    }, []);

    // Handle practice completion
    const handlePracticeComplete = useCallback(async (results) => {
        setPracticeResults(results);
        setCurrentStep(STEPS.COMPLETE);

        // Save to database
        if (user?.uid) {
            setIsSaving(true);
            try {
                const sentenceRecord = {
                    id: Date.now().toString(),
                    original: sentenceData.original,
                    aslWords: sentenceData.aslWords,
                    accuracy: results.averageAccuracy,
                    duration: results.duration,
                    completedAt: Date.now()
                };

                await savePracticedSentence(user.uid, sentenceRecord);

                // Update local state
                setSavedSentences(prev => [sentenceRecord, ...prev]);
            } catch (error) {
                console.error('Error saving sentence:', error);
            } finally {
                setIsSaving(false);
            }
        }
    }, [user?.uid, sentenceData]);

    // Handle practice exit
    const handlePracticeExit = useCallback(() => {
        setCurrentStep(STEPS.INPUT);
        setSentenceData({ original: '', aslWords: [], explanation: '' });
        setCurrentWordIndex(0);
        setPracticeResults(null);
    }, []);

    // Handle practicing a saved sentence
    const handlePracticeSaved = useCallback((sentence) => {
        setSentenceData({
            original: sentence.original,
            aslWords: sentence.aslWords,
            explanation: ''
        });
        setShowSavedSentences(false);
        setCurrentStep(STEPS.BREAKDOWN);
    }, []);

    // Handle deleting a saved sentence
    const handleDeleteSentence = useCallback((id) => {
        setSavedSentences(prev => prev.filter(s => s.id !== id));
    }, []);

    // Go to next step
    const goToNextStep = useCallback(() => {
        const stepOrder = [STEPS.INPUT, STEPS.BREAKDOWN, STEPS.LEARN, STEPS.PRACTICE];
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex < stepOrder.length - 1) {
            setCurrentStep(stepOrder[currentIndex + 1]);
        }
    }, [currentStep]);

    // Go to previous step
    const goToPrevStep = useCallback(() => {
        const stepOrder = [STEPS.INPUT, STEPS.BREAKDOWN, STEPS.LEARN, STEPS.PRACTICE];
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(stepOrder[currentIndex - 1]);
        }
    }, [currentStep]);

    // Get step index
    const getStepIndex = (step) => {
        return STEP_CONFIG.findIndex(s => s.id === step);
    };

    return (
        <div className="min-h-screen bg-dark-900 pt-20 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent 
                                 bg-clip-text text-transparent mb-3">
                        Sentence Builder
                    </h1>
                    <p className="text-dark-400 text-lg max-w-xl mx-auto">
                        Translate sentences to ASL and learn to sign them word by word
                    </p>

                    {/* Toggle Saved Sentences */}
                    {currentStep === STEPS.INPUT && (
                        <button
                            onClick={() => setShowSavedSentences(!showSavedSentences)}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg 
                                     bg-dark-700/50 text-dark-300 hover:bg-dark-700 transition-colors"
                        >
                            <BookOpen className="w-4 h-4" />
                            {showSavedSentences ? 'New Sentence' : `My Sentences (${savedSentences.length})`}
                        </button>
                    )}
                </motion.div>

                {/* Progress Steps */}
                {currentStep !== STEPS.COMPLETE && !showSavedSentences && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-center gap-2 md:gap-4">
                            {STEP_CONFIG.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = step.id === currentStep;
                                const isCompleted = getStepIndex(currentStep) > index;

                                return (
                                    <div key={step.id} className="flex items-center">
                                        <div
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isActive
                                                ? 'bg-primary/20 text-primary'
                                                : isCompleted
                                                    ? 'bg-success/20 text-success'
                                                    : 'bg-dark-700/50 text-dark-400'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="hidden md:inline text-sm font-medium">
                                                {step.label}
                                            </span>
                                        </div>

                                        {index < STEP_CONFIG.length - 1 && (
                                            <ChevronRight className="w-5 h-5 text-dark-500 mx-1" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Main Content */}
                <AnimatePresence mode="wait">
                    {/* Saved Sentences View */}
                    {showSavedSentences && currentStep === STEPS.INPUT && (
                        <motion.div
                            key="saved"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <SavedSentences
                                sentences={savedSentences}
                                onPractice={handlePracticeSaved}
                                onDelete={handleDeleteSentence}
                            />
                        </motion.div>
                    )}

                    {/* Step 1: Input */}
                    {currentStep === STEPS.INPUT && !showSavedSentences && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <SentenceInput
                                onSentenceSubmit={handleSentenceSubmit}
                                isLoading={isTranslating}
                            />
                        </motion.div>
                    )}

                    {/* Step 2: Breakdown */}
                    {currentStep === STEPS.BREAKDOWN && (
                        <motion.div
                            key="breakdown"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <WordBreakdown
                                original={sentenceData.original}
                                aslWords={sentenceData.aslWords}
                                explanation={sentenceData.explanation}
                                onWordClick={handleWordClick}
                            />

                            {/* Breakdown Actions */}
                            <div className="flex flex-wrap gap-4 justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentStep(STEPS.INPUT)}
                                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                                >
                                    New Sentence
                                </Button>
                                <div className="flex gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setLearnMode('sequence');
                                            goToNextStep();
                                        }}
                                        leftIcon={<GraduationCap className="w-4 h-4" />}
                                    >
                                        Watch Sequence
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            setLearnMode('practice');
                                            setCurrentStep(STEPS.PRACTICE);
                                        }}
                                        leftIcon={<Camera className="w-4 h-4" />}
                                    >
                                        Start Practice
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Learn (Sequence) */}
                    {currentStep === STEPS.LEARN && (
                        <motion.div
                            key="learn"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <SignSequence
                                words={sentenceData.aslWords}
                                currentWordIndex={currentWordIndex}
                                onWordSelect={handleWordSelect}
                            />

                            {/* Learn Actions */}
                            <div className="flex flex-wrap gap-4 justify-between">
                                <Button
                                    variant="outline"
                                    onClick={goToPrevStep}
                                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                                >
                                    Back to Breakdown
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={goToNextStep}
                                    rightIcon={<ChevronRight className="w-4 h-4" />}
                                >
                                    Start Practice
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Practice */}
                    {currentStep === STEPS.PRACTICE && (
                        <motion.div
                            key="practice"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <FullSentencePractice
                                sentence={sentenceData.original}
                                words={sentenceData.aslWords}
                                onComplete={handlePracticeComplete}
                                onExit={handlePracticeExit}
                            />
                        </motion.div>
                    )}

                    {/* Step 5: Complete */}
                    {currentStep === STEPS.COMPLETE && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card p-8 text-center"
                        >
                            {/* Trophy */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className="mb-6"
                            >
                                <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-warning/20 to-secondary/20">
                                    <Trophy className="w-20 h-20 text-warning" />
                                </div>
                            </motion.div>

                            <h2 className="text-3xl font-bold text-dark-100 mb-2">
                                Sentence Completed!
                            </h2>
                            <p className="text-xl text-dark-300 mb-8">
                                "{sentenceData.original}"
                            </p>

                            {/* Saving indicator */}
                            {isSaving && (
                                <p className="text-sm text-dark-400 mb-4">
                                    Saving your progress...
                                </p>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap justify-center gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setCurrentStep(STEPS.BREAKDOWN);
                                        setPracticeResults(null);
                                    }}
                                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                                >
                                    Practice Again
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handlePracticeExit}
                                    leftIcon={<Home className="w-4 h-4" />}
                                >
                                    New Sentence
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SentenceBuilder;
