/**
 * LetterCard Component
 * Individual letter card for the alphabet grid
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { getDifficultyColor, getDifficultyLabel } from '@/data/signsData';

/**
 * Difficulty Dots Component
 * Shows difficulty as dots (1-3)
 */
const DifficultyDots = memo(({ difficulty }) => (
    <div className="flex items-center gap-0.5" title={getDifficultyLabel(difficulty)}>
        {[1, 2, 3].map((level) => (
            <div
                key={level}
                className={`
          w-1.5 h-1.5 rounded-full transition-colors
          ${level <= difficulty ? 'bg-current' : 'bg-dark-600'}
        `}
            />
        ))}
    </div>
));

DifficultyDots.displayName = 'DifficultyDots';

/**
 * LetterCard Component
 * 
 * @param {string} letter - The letter to display (A-Z)
 * @param {boolean} isLearned - Whether the user has learned this sign
 * @param {number} difficulty - Difficulty level (1-3)
 * @param {boolean} isSelected - Whether this card is currently selected
 * @param {function} onClick - Click handler
 */
const LetterCard = memo(({
    letter,
    isLearned = false,
    difficulty = 1,
    isSelected = false,
    onClick,
}) => {
    // Determine card styling based on state
    const getBorderClass = () => {
        if (isSelected) return 'border-primary ring-2 ring-primary/30';
        if (isLearned) return 'border-success/30';
        return 'border-dark-700 hover:border-primary/50';
    };

    const getBackgroundClass = () => {
        if (isSelected) return 'bg-dark-700';
        if (isLearned) return 'bg-success/5';
        return 'bg-dark-800 hover:bg-dark-750';
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick?.(letter)}
            className={`
        relative w-full aspect-square
        flex flex-col items-center justify-center
        rounded-xl border-2 transition-all duration-200
        cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50
        ${getBorderClass()}
        ${getBackgroundClass()}
      `}
            aria-label={`Letter ${letter}${isLearned ? ', learned' : ''}`}
            aria-pressed={isSelected}
        >
            {/* Learned checkmark badge */}
            {isLearned && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 z-10"
                >
                    <div className="
            w-5 h-5 rounded-full
            bg-success flex items-center justify-center
            shadow-lg shadow-success/30
          ">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                </motion.div>
            )}

            {/* Letter */}
            <span className={`
        text-4xl sm:text-3xl md:text-4xl font-bold
        transition-colors duration-200
        ${isSelected ? 'text-primary' : isLearned ? 'text-success' : 'text-dark-200 group-hover:text-dark-100'}
      `}>
                {letter}
            </span>

            {/* Difficulty indicator */}
            <div className={`
        mt-2 text-xs
        ${difficulty === 1 ? 'text-success' : difficulty === 2 ? 'text-warning' : 'text-error'}
      `}>
                <DifficultyDots difficulty={difficulty} />
            </div>

            {/* Hover glow effect */}
            <div className={`
        absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300
        bg-gradient-to-br from-primary/5 to-secondary/5
        ${!isSelected ? 'group-hover:opacity-100' : ''}
      `} />
        </motion.button>
    );
});

LetterCard.displayName = 'LetterCard';

export default LetterCard;
