/**
 * LetterDetail Page
 * Dedicated page for viewing a specific letter
 * Route: /learn/:letter
 */

import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    Trophy,
    BookOpen,
    Home
} from 'lucide-react';

// Components
import PageContainer from '@/components/layout/PageContainer';
import SignInfo from '@/components/learning/SignInfo';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Data & Services
import { getSignByLetter, alphabetSigns } from '@/data/signsData';
import { addLearnedSign, getUserProfile } from '@/services/database';
import useAuthStore from '@/store/authStore';

// Lazy load the 3D viewer for performance
const ModelViewer = lazy(() => import('@/components/3d/ModelViewer'));

/**
 * LetterDetail Page Component
 */
const LetterDetail = () => {
    const { letter: urlLetter } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Normalize the letter (uppercase)
    const letter = urlLetter?.toUpperCase();

    // State
    const [learnedSigns, setLearnedSigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMarkingLearned, setIsMarkingLearned] = useState(false);

    // Get sign data
    const signData = getSignByLetter(letter);

    // Calculate navigation
    const currentIndex = alphabetSigns.findIndex(s => s.letter === letter);
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < alphabetSigns.length - 1;
    const previousLetter = hasPrevious ? alphabetSigns[currentIndex - 1].letter : null;
    const nextLetter = hasNext ? alphabetSigns[currentIndex + 1].letter : null;

    // Check if sign is learned
    const isLearned = learnedSigns.includes(letter);

    // Fetch user's learned signs
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

    // Redirect if invalid letter
    useEffect(() => {
        if (!signData && !isLoading) {
            navigate('/learn', { replace: true });
        }
    }, [signData, isLoading, navigate]);

    // Mark sign as learned
    const handleMarkAsLearned = useCallback(async () => {
        if (!user?.uid || !letter || isLearned) return;

        setIsMarkingLearned(true);
        try {
            const wasNew = await addLearnedSign(user.uid, letter);
            if (wasNew) {
                setLearnedSigns(prev => [...prev, letter]);
            }
        } catch (error) {
            console.error('Error marking sign as learned:', error);
        } finally {
            setIsMarkingLearned(false);
        }
    }, [user?.uid, letter, isLearned]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft' && hasPrevious) {
                navigate(`/learn/${previousLetter}`);
            } else if (e.key === 'ArrowRight' && hasNext) {
                navigate(`/learn/${nextLetter}`);
            } else if (e.key === 'Escape') {
                navigate('/learn');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate, hasPrevious, hasNext, previousLetter, nextLetter]);

    // Loading state
    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center min-h-[400px]">
                    <LoadingSpinner size="lg" text="Loading..." />
                </div>
            </PageContainer>
        );
    }

    // Invalid letter
    if (!signData) {
        return null;
    }

    return (
        <PageContainer>
            {/* Header with navigation */}
            <div className="flex items-center justify-between mb-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link to="/learn">
                        <Button
                            variant="ghost"
                            leftIcon={<ArrowLeft className="w-4 h-4" />}
                        >
                            Back to Alphabet
                        </Button>
                    </Link>
                </motion.div>

                {/* Letter navigation badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hidden sm:flex items-center gap-2"
                >
                    {hasPrevious && (
                        <Link
                            to={`/learn/${previousLetter}`}
                            className="
                px-3 py-1 rounded-lg bg-dark-700
                text-dark-300 hover:text-dark-100
                text-sm font-medium transition-colors
              "
                        >
                            ← {previousLetter}
                        </Link>
                    )}
                    <span className="
            px-4 py-1 rounded-lg
            bg-primary/20 text-primary
            text-sm font-bold
          ">
                        {letter}
                    </span>
                    {hasNext && (
                        <Link
                            to={`/learn/${nextLetter}`}
                            className="
                px-3 py-1 rounded-lg bg-dark-700
                text-dark-300 hover:text-dark-100
                text-sm font-medium transition-colors
              "
                        >
                            {nextLetter} →
                        </Link>
                    )}
                </motion.div>
            </div>

            {/* Main content */}
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Left column: 3D Model */}
                <motion.div
                    key={letter}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <Suspense fallback={
                        <div className="aspect-square bg-dark-800 rounded-2xl flex items-center justify-center">
                            <LoadingSpinner text="Loading 3D viewer..." />
                        </div>
                    }>
                        <ModelViewer
                            letter={letter}
                            showControls={true}
                        />
                    </Suspense>

                    {/* Mobile navigation */}
                    <div className="flex items-center justify-between lg:hidden">
                        <Link to={hasPrevious ? `/learn/${previousLetter}` : '#'}>
                            <Button
                                variant="ghost"
                                disabled={!hasPrevious}
                                leftIcon={<ChevronLeft className="w-4 h-4" />}
                            >
                                {previousLetter || 'Previous'}
                            </Button>
                        </Link>

                        <span className="text-dark-400 text-sm">
                            {currentIndex + 1} of {alphabetSigns.length}
                        </span>

                        <Link to={hasNext ? `/learn/${nextLetter}` : '#'}>
                            <Button
                                variant="ghost"
                                disabled={!hasNext}
                                rightIcon={<ChevronRight className="w-4 h-4" />}
                            >
                                {nextLetter || 'Next'}
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Right column: Sign Info */}
                <motion.div
                    key={`info-${letter}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                >
                    <SignInfo signData={signData} />

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {isLearned ? (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="
                  flex items-center justify-center gap-2
                  w-full py-3 px-4 rounded-xl
                  bg-success/10 border border-success/30
                  text-success font-medium
                "
                            >
                                <CheckCircle className="w-5 h-5" />
                                You've learned this sign!
                            </motion.div>
                        ) : (
                            <Button
                                variant="primary"
                                fullWidth
                                onClick={handleMarkAsLearned}
                                isLoading={isMarkingLearned}
                                leftIcon={<Trophy className="w-4 h-4" />}
                            >
                                Mark as Learned
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            fullWidth
                            onClick={() => navigate(`/practice?letter=${letter}`)}
                            leftIcon={<BookOpen className="w-4 h-4" />}
                        >
                            Practice
                        </Button>
                    </div>

                    {/* Desktop navigation */}
                    <div className="hidden lg:flex items-center justify-between pt-4 border-t border-dark-700">
                        <Link to={hasPrevious ? `/learn/${previousLetter}` : '#'}>
                            <Button
                                variant="ghost"
                                disabled={!hasPrevious}
                                leftIcon={<ChevronLeft className="w-4 h-4" />}
                            >
                                Previous: {previousLetter || '—'}
                            </Button>
                        </Link>

                        <Link to={hasNext ? `/learn/${nextLetter}` : '#'}>
                            <Button
                                variant="ghost"
                                disabled={!hasNext}
                                rightIcon={<ChevronRight className="w-4 h-4" />}
                            >
                                Next: {nextLetter || '—'}
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Keyboard hint */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="hidden lg:flex items-center justify-center gap-4 mt-8 text-xs text-dark-500"
            >
                <span className="flex items-center gap-1">
                    <kbd className="px-2 py-0.5 rounded bg-dark-700 text-dark-300">←</kbd>
                    <kbd className="px-2 py-0.5 rounded bg-dark-700 text-dark-300">→</kbd>
                    Navigate letters
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                    <kbd className="px-2 py-0.5 rounded bg-dark-700 text-dark-300">Esc</kbd>
                    Back to grid
                </span>
            </motion.div>
        </PageContainer>
    );
};

export default LetterDetail;
