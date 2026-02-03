/**
 * Sign Selector Component
 * Dropdown/grid to select from learned signs
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { getSignByLetter, getDifficultyLabel, getDifficultyColor } from '@/data/signsData';

/**
 * Sign Selector Component
 * 
 * @param {Object} props
 * @param {string[]} props.learnedSigns - Array of learned sign letters
 * @param {string} props.selectedSign - Currently selected sign
 * @param {function} props.onSelect - Callback when sign is selected
 * @param {string} props.viewMode - 'dropdown' or 'grid'
 */
const SignSelector = ({
    learnedSigns = [],
    selectedSign,
    onSelect,
    viewMode = 'grid'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter signs based on search
    const filteredSigns = useMemo(() => {
        if (!searchQuery) return learnedSigns;
        return learnedSigns.filter(sign =>
            sign.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [learnedSigns, searchQuery]);

    // Get sign data for selected sign
    const selectedSignData = selectedSign ? getSignByLetter(selectedSign) : null;

    if (viewMode === 'dropdown') {
        return (
            <div className="relative">
                {/* Dropdown trigger */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl hover:border-primary/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        {selectedSign ? (
                            <>
                                <span className="w-10 h-10 flex items-center justify-center bg-primary/20 rounded-lg text-xl font-bold text-primary">
                                    {selectedSign}
                                </span>
                                <div className="text-left">
                                    <div className="font-medium text-dark-100">Letter {selectedSign}</div>
                                    {selectedSignData && (
                                        <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getDifficultyColor(selectedSignData.difficulty)}`}>
                                            {getDifficultyLabel(selectedSignData.difficulty)}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <span className="text-dark-400">Select a sign...</span>
                        )}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-dark-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-600 rounded-xl shadow-xl z-50 overflow-hidden"
                        >
                            {/* Search */}
                            <div className="p-3 border-b border-dark-700">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                    <input
                                        type="text"
                                        placeholder="Search signs..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-100 placeholder-dark-400 focus:outline-none focus:border-primary"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                        >
                                            <X className="w-4 h-4 text-dark-400 hover:text-dark-200" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Options */}
                            <div className="max-h-60 overflow-y-auto p-2">
                                {filteredSigns.length === 0 ? (
                                    <div className="text-center py-4 text-dark-400 text-sm">
                                        No signs found
                                    </div>
                                ) : (
                                    filteredSigns.map(sign => {
                                        const signData = getSignByLetter(sign);
                                        const isSelected = sign === selectedSign;

                                        return (
                                            <button
                                                key={sign}
                                                onClick={() => {
                                                    onSelect(sign);
                                                    setIsOpen(false);
                                                }}
                                                className={`
                                                    w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                                                    ${isSelected
                                                        ? 'bg-primary/20 text-primary'
                                                        : 'hover:bg-dark-700 text-dark-100'
                                                    }
                                                `}
                                            >
                                                <span className={`
                                                    w-8 h-8 flex items-center justify-center rounded-lg font-bold
                                                    ${isSelected ? 'bg-primary text-white' : 'bg-dark-600'}
                                                `}>
                                                    {sign}
                                                </span>
                                                <span className="flex-1 text-left">Letter {sign}</span>
                                                {signData && (
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(signData.difficulty)}`}>
                                                        {getDifficultyLabel(signData.difficulty)}
                                                    </span>
                                                )}
                                                {isSelected && <Check className="w-4 h-4" />}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Click outside to close */}
                {isOpen && (
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </div>
        );
    }

    // Grid view
    return (
        <div className="space-y-3">
            {/* Search (for many signs) */}
            {learnedSigns.length > 10 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search signs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm text-dark-100 placeholder-dark-400 focus:outline-none focus:border-primary"
                    />
                </div>
            )}

            {/* Grid */}
            <div className="flex flex-wrap gap-2">
                {filteredSigns.map(sign => {
                    const signData = getSignByLetter(sign);
                    const isSelected = sign === selectedSign;

                    return (
                        <motion.button
                            key={sign}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSelect(sign)}
                            className={`
                                relative w-12 h-12 rounded-xl font-bold text-lg transition-all duration-200
                                ${isSelected
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-dark-100'
                                }
                            `}
                        >
                            {sign}
                            {isSelected && (
                                <motion.div
                                    layoutId="selectedIndicator"
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center"
                                >
                                    <Check className="w-3 h-3 text-white" />
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Selected sign info */}
            {selectedSignData && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-dark-400"
                >
                    <span>Selected:</span>
                    <span className="font-medium text-dark-100">Letter {selectedSign}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(selectedSignData.difficulty)}`}>
                        {getDifficultyLabel(selectedSignData.difficulty)}
                    </span>
                </motion.div>
            )}
        </div>
    );
};

export default SignSelector;
