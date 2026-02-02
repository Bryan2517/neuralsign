/**
 * AlphabetGrid Component
 * Displays all 26 letters in a responsive grid
 */

import { memo, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
import LetterCard from './LetterCard';
import { alphabetSigns, getDifficultyLabel } from '@/data/signsData';

/**
 * Filter Button Component
 */
const FilterButton = memo(({ label, isActive, onClick, count }) => (
    <button
        onClick={onClick}
        className={`
      px-3 py-1.5 rounded-lg text-sm font-medium
      transition-all duration-200
      ${isActive
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-dark-100'
            }
    `}
        aria-pressed={isActive}
    >
        {label}
        {count !== undefined && (
            <span className={`ml-1.5 text-xs ${isActive ? 'text-white/80' : 'text-dark-400'}`}>
                ({count})
            </span>
        )}
    </button>
));

FilterButton.displayName = 'FilterButton';

/**
 * AlphabetGrid Component
 * 
 * @param {Array} learnedSigns - Array of learned sign IDs
 * @param {function} onSelectLetter - Callback when letter is selected
 * @param {string} selectedLetter - Currently selected letter
 * @param {boolean} showFilters - Show filter buttons (default: true)
 * @param {string} className - Additional CSS classes
 */
const AlphabetGrid = memo(({
    learnedSigns = [],
    onSelectLetter,
    selectedLetter = null,
    showFilters = true,
    className = '',
}) => {
    const [filter, setFilter] = useState('all');

    // Create learned set for O(1) lookup
    const learnedSet = useMemo(() => new Set(learnedSigns), [learnedSigns]);

    // Filter signs based on current filter
    const filteredSigns = useMemo(() => {
        switch (filter) {
            case 'learned':
                return alphabetSigns.filter(sign => learnedSet.has(sign.id));
            case 'not-learned':
                return alphabetSigns.filter(sign => !learnedSet.has(sign.id));
            case 'easy':
                return alphabetSigns.filter(sign => sign.difficulty === 1);
            case 'medium':
                return alphabetSigns.filter(sign => sign.difficulty === 2);
            case 'hard':
                return alphabetSigns.filter(sign => sign.difficulty === 3);
            default:
                return alphabetSigns;
        }
    }, [filter, learnedSet]);

    // Calculate counts for filters
    const counts = useMemo(() => ({
        all: alphabetSigns.length,
        learned: learnedSigns.length,
        notLearned: alphabetSigns.length - learnedSigns.length,
        easy: alphabetSigns.filter(s => s.difficulty === 1).length,
        medium: alphabetSigns.filter(s => s.difficulty === 2).length,
        hard: alphabetSigns.filter(s => s.difficulty === 3).length,
    }), [learnedSigns.length]);

    return (
        <div className={className}>
            {/* Filter Bar */}
            {showFilters && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="w-4 h-4 text-dark-400" />
                        <span className="text-sm text-dark-400">Filter:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <FilterButton
                            label="All"
                            isActive={filter === 'all'}
                            onClick={() => setFilter('all')}
                            count={counts.all}
                        />
                        <FilterButton
                            label="Learned"
                            isActive={filter === 'learned'}
                            onClick={() => setFilter('learned')}
                            count={counts.learned}
                        />
                        <FilterButton
                            label="Not Learned"
                            isActive={filter === 'not-learned'}
                            onClick={() => setFilter('not-learned')}
                            count={counts.notLearned}
                        />
                        <div className="w-px h-6 bg-dark-600 self-center mx-1" />
                        <FilterButton
                            label="Easy"
                            isActive={filter === 'easy'}
                            onClick={() => setFilter('easy')}
                            count={counts.easy}
                        />
                        <FilterButton
                            label="Medium"
                            isActive={filter === 'medium'}
                            onClick={() => setFilter('medium')}
                            count={counts.medium}
                        />
                        <FilterButton
                            label="Hard"
                            isActive={filter === 'hard'}
                            onClick={() => setFilter('hard')}
                            count={counts.hard}
                        />
                    </div>
                </motion.div>
            )}

            {/* Grid */}
            <motion.div
                layout
                className="
          grid gap-3
          grid-cols-4 
          sm:grid-cols-5
          md:grid-cols-6 
          lg:grid-cols-8
          xl:grid-cols-9
        "
            >
                <AnimatePresence mode="popLayout">
                    {filteredSigns.map((sign, index) => (
                        <motion.div
                            key={sign.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{
                                delay: index * 0.02,
                                layout: { duration: 0.3 }
                            }}
                        >
                            <LetterCard
                                letter={sign.letter}
                                isLearned={learnedSet.has(sign.id)}
                                difficulty={sign.difficulty}
                                isSelected={selectedLetter === sign.letter}
                                onClick={onSelectLetter}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Empty state */}
            {filteredSigns.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                >
                    <p className="text-dark-400">No letters match the current filter.</p>
                    <button
                        onClick={() => setFilter('all')}
                        className="mt-2 text-primary hover:text-primary-dark text-sm"
                    >
                        Show all letters
                    </button>
                </motion.div>
            )}
        </div>
    );
});

AlphabetGrid.displayName = 'AlphabetGrid';

export default AlphabetGrid;
