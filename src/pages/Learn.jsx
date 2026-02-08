/**
 * Learn Page
 * Main alphabet learning page with grid and detail views
 */

import { useState, useEffect, useCallback, lazy, Suspense, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    BookOpen,
    Trophy,
    XCircle
} from 'lucide-react';

// Components
import PageContainer from '@/components/layout/PageContainer';
import AlphabetGrid from '@/components/learning/AlphabetGrid';
import SignInfo from '@/components/learning/SignInfo';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Data & Services
import { getSignByLetter, alphabetSigns } from '@/data/signsData';
import { addLearnedSign, removeLearnedSign, getUserProfile } from '@/services/database';
import useAuthStore from '@/store/authStore';

// Lazy load the 3D viewer for performance
const ModelViewer = lazy(() => import('@/components/3d/ModelViewer'));

/**
 * Progress Stats Component
 */
const ProgressStats = memo(({ learnedCount, totalCount }) => {
    const progressPercent = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4 p-4 glass-card mb-6"
        >
            <div className="text-center">
                <div className="text-2xl font-bold gradient-text">{learnedCount}</div>
                <div className="text-sm text-dark-400">Learned</div>
            </div>
            <div className="text-center border-x border-dark-700">
                <div className="text-2xl font-bold gradient-text">{totalCount}</div>
                <div className="text-sm text-dark-400">Total Signs</div>
            </div>
            <div className="text-center">
                <div className="text-2xl font-bold gradient-text">{progressPercent}%</div>
                <div className="text-sm text-dark-400">Complete</div>
            </div>
        </motion.div>
    );
});

ProgressStats.displayName = 'ProgressStats';

/**
 * Navigation Controls Component
 */
const NavigationControls = memo(({
    currentLetter,
    onPrevious,
    onNext,
    hasPrevious,
    hasNext
}) => (
    <div className="flex items-center justify-between">
        <Button
            variant="ghost"
            onClick={onPrevious}
            disabled={!hasPrevious}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
            Previous
        </Button>

        <span className="text-dark-400 text-sm">
            Letter {currentLetter}
        </span>

        <Button
            variant="ghost"
            onClick={onNext}
            disabled={!hasNext}
            rightIcon={<ChevronRight className="w-4 h-4" />}
        >
            Next
        </Button>
    </div>
));

NavigationControls.displayName = 'NavigationControls';

/**
 * Learn Page Component
 */
const Learn = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // State
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [learnedSigns, setLearnedSigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMarkingLearned, setIsMarkingLearned] = useState(false);

    // Fetch user's learned signs on mount
    useEffect(() => {
        const fetchLearnedSigns = async () => {
            if (!user?.uid) {
                setIsLoading(false);
                return;
            }

            try {
                const profile = await getUserProfile(user.uid);
                setLearnedSigns(profile?.learnedSigns || []);
            } catch (error) {
                console.error('Error fetching learned signs:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLearnedSigns();
    }, [user?.uid]);

    // Handle lesson ID from URL (e.g., /learn/alphabet)
    useEffect(() => {
        // If we're at /learn/alphabet, show the alphabet grid
        // For now, we only support alphabet lesson
        if (lessonId && lessonId !== 'alphabet') {
            navigate('/learn', { replace: true });
        }
    }, [lessonId, navigate]);

    // Get current sign data
    const currentSign = selectedLetter ? getSignByLetter(selectedLetter) : null;

    // Check if current sign is learned
    const isCurrentSignLearned = selectedLetter && learnedSigns.includes(selectedLetter);

    // Navigation helpers
    const currentIndex = selectedLetter
        ? alphabetSigns.findIndex(s => s.letter === selectedLetter)
        : -1;
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < alphabetSigns.length - 1;

    // Handlers
    const handleSelectLetter = useCallback((letter) => {
        setSelectedLetter(letter);
        // Scroll to top on mobile
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleBack = useCallback(() => {
        setSelectedLetter(null);
    }, []);

    const handlePrevious = useCallback(() => {
        if (hasPrevious) {
            setSelectedLetter(alphabetSigns[currentIndex - 1].letter);
        }
    }, [hasPrevious, currentIndex]);

    const handleNext = useCallback(() => {
        if (hasNext) {
            setSelectedLetter(alphabetSigns[currentIndex + 1].letter);
        }
    }, [hasNext, currentIndex]);

    const handleToggleLearned = useCallback(async () => {
        if (!user?.uid || !selectedLetter) return;

        setIsMarkingLearned(true);
        try {
            if (isCurrentSignLearned) {
                // Remove from learned
                const wasRemoved = await removeLearnedSign(user.uid, selectedLetter);
                if (wasRemoved) {
                    setLearnedSigns(prev => prev.filter(s => s !== selectedLetter));
                }
            } else {
                // Add to learned
                const wasNew = await addLearnedSign(user.uid, selectedLetter);
                if (wasNew) {
                    setLearnedSigns(prev => [...prev, selectedLetter]);
                }
            }
        } catch (error) {
            console.error('Error toggling learned status:', error);
        } finally {
            setIsMarkingLearned(false);
        }
    }, [user?.uid, selectedLetter, isCurrentSignLearned]);

    // Loading state
    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center min-h-[400px]">
                    <LoadingSpinner size="lg" text="Loading your progress..." />
                </div>
            </PageContainer>
        );
    }

    // Detail View
    if (selectedLetter && currentSign) {
        return (
            <PageContainer>
                {/* Back button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-6"
                >
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        leftIcon={<ArrowLeft className="w-4 h-4" />}
                    >
                        Back to Alphabet
                    </Button>
                </motion.div>

                {/* Main content - responsive layout */}
                <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Left column: 3D Model */}
                    <div className="space-y-4">
                        <Suspense fallback={
                            <div className="aspect-square bg-dark-800 rounded-2xl flex items-center justify-center">
                                <LoadingSpinner text="Loading 3D viewer..." />
                            </div>
                        }>
                            <ModelViewer
                                letter={selectedLetter}
                                showControls={true}
                            />
                        </Suspense>

                        {/* Navigation controls */}
                        <NavigationControls
                            currentLetter={selectedLetter}
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            hasPrevious={hasPrevious}
                            hasNext={hasNext}
                        />

                        {/* Action buttons - Start Learning & Practice */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="secondary"
                                fullWidth
                                onClick={() => navigate(`/learn/letter/${selectedLetter}/practice`)}
                                leftIcon={<GraduationCap className="w-4 h-4" />}
                            >
                                Start Learning
                            </Button>

                            <Button
                                variant="outline"
                                fullWidth
                                onClick={() => navigate(`/practice?letter=${selectedLetter}`)}
                                leftIcon={<BookOpen className="w-4 h-4" />}
                            >
                                Practice
                            </Button>
                        </div>

                        {/* Practice prompt */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/20">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-dark-100">Ready to practice?</h4>
                                    <p className="text-xs text-dark-400 mt-0.5">
                                        Use the 3D model above to study the hand position
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right column: Sign Info */}
                    <div className="space-y-4">
                        <SignInfo signData={currentSign} />

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {isCurrentSignLearned ? (
                                <Button
                                    variant="outline"
                                    fullWidth
                                    onClick={handleToggleLearned}
                                    isLoading={isMarkingLearned}
                                    leftIcon={<XCircle className="w-4 h-4" />}
                                    className="border-success/30 text-success hover:bg-success/10"
                                >
                                    Unmark as Learned
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={handleToggleLearned}
                                    isLoading={isMarkingLearned}
                                    leftIcon={<Trophy className="w-4 h-4" />}
                                >
                                    Mark as Learned
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </PageContainer>
        );
    }

    // Grid View (default)
    return (
        <PageContainer>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-6"
            >
                <div className="p-3 rounded-xl bg-primary/10">
                    <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-dark-100">
                        Learn Sign Language
                    </h1>
                    <p className="text-dark-400">
                        Select a letter to start learning
                    </p>
                </div>
            </motion.div>

            {/* Progress Stats */}
            <ProgressStats
                learnedCount={learnedSigns.length}
                totalCount={alphabetSigns.length}
            />

            {/* Progress bar */}
            <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-dark-400">Overall Progress</span>
                    <span className="text-dark-300 font-medium">
                        {learnedSigns.length} / {alphabetSigns.length} letters
                    </span>
                </div>
                <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{
                            width: `${(learnedSigns.length / alphabetSigns.length) * 100}%`
                        }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full"
                    />
                </div>
            </motion.div>

            {/* Alphabet Grid */}
            <AlphabetGrid
                learnedSigns={learnedSigns}
                onSelectLetter={handleSelectLetter}
                selectedLetter={selectedLetter}
                showFilters={true}
            />

            {/* Encouragement message */}
            {learnedSigns.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-8 p-6 glass-card"
                >
                    <p className="text-dark-300">
                        👋 Welcome! Click on any letter above to start learning.
                    </p>
                </motion.div>
            )}

            {learnedSigns.length === alphabetSigns.length && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mt-8 p-6 glass-card border-success/30"
                >
                    <Trophy className="w-12 h-12 text-success mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-success mb-2">
                        Congratulations! 🎉
                    </h3>
                    <p className="text-dark-300">
                        You've learned all 26 letters of the ASL alphabet!
                    </p>
                </motion.div>
            )}
        </PageContainer>
    );
};

export default Learn;
