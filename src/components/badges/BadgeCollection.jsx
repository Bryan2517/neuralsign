/**
 * Badge Collection Component
 * Display all badges with unlock status
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Lock, Star, Filter, Check } from 'lucide-react';
import { achievements, tierColors, categories, getAchievementsByCategory } from '@/data/achievements';

const BadgeCollection = ({
    unlockedAchievements = [],
    showFilter = true,
    className = ''
}) => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedBadge, setSelectedBadge] = useState(null);

    // Create unlocked set for quick lookup
    const unlockedIds = useMemo(() =>
        new Set(unlockedAchievements.map(a => a.id)),
        [unlockedAchievements]
    );

    // Filter badges by category
    const filteredBadges = useMemo(() => {
        if (activeCategory === 'all') return achievements;
        return getAchievementsByCategory(activeCategory);
    }, [activeCategory]);

    // Calculate stats
    const stats = useMemo(() => ({
        total: achievements.length,
        unlocked: unlockedAchievements.length,
        percentage: Math.round((unlockedAchievements.length / achievements.length) * 100)
    }), [unlockedAchievements]);

    // Rarity colors
    const rarityColors = {
        bronze: { bg: 'from-amber-900/40 to-amber-700/40', border: 'border-amber-600', text: 'text-amber-500' },
        silver: { bg: 'from-gray-600/40 to-gray-400/40', border: 'border-gray-400', text: 'text-gray-300' },
        gold: { bg: 'from-yellow-600/40 to-yellow-400/40', border: 'border-yellow-500', text: 'text-yellow-400' },
        platinum: { bg: 'from-cyan-600/40 to-purple-500/40', border: 'border-cyan-400', text: 'text-cyan-300' }
    };

    const categoryList = [
        { id: 'all', name: 'All Badges', icon: '🏅' },
        ...Object.entries(categories).map(([id, cat]) => ({ id, ...cat }))
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-6 ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-warning/10">
                        <Award className="w-6 h-6 text-warning" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-dark-100">Badge Collection</h3>
                        <p className="text-sm text-dark-400">
                            {stats.unlocked}/{stats.total} unlocked ({stats.percentage}%)
                        </p>
                    </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-dark-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.percentage}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-warning to-amber-400 rounded-full"
                        />
                    </div>
                    <span className="text-sm font-medium text-warning">{stats.percentage}%</span>
                </div>
            </div>

            {/* Category Filter */}
            {showFilter && (
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {categoryList.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap
                text-sm font-medium transition-all
                ${activeCategory === cat.id
                                    ? 'bg-primary text-white'
                                    : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                                }
              `}
                        >
                            <span>{cat.icon}</span>
                            {cat.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Badge Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {filteredBadges.map((badge, index) => {
                    const isUnlocked = unlockedIds.has(badge.id);
                    const rarity = rarityColors[badge.tier];
                    const unlockedData = unlockedAchievements.find(a => a.id === badge.id);

                    return (
                        <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.02 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setSelectedBadge(badge)}
                            className={`
                relative p-3 rounded-xl cursor-pointer
                transition-all border
                ${isUnlocked
                                    ? `bg-gradient-to-br ${rarity.bg} ${rarity.border}`
                                    : 'bg-dark-700/50 border-dark-600 opacity-60'
                                }
              `}
                        >
                            {/* Lock Overlay */}
                            {!isUnlocked && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-dark-900/50">
                                    <Lock className="w-5 h-5 text-dark-500" />
                                </div>
                            )}

                            {/* Badge Icon */}
                            <div className={`text-3xl text-center mb-2 ${!isUnlocked && 'grayscale'}`}>
                                {badge.icon}
                            </div>

                            {/* Badge Name */}
                            <h4 className={`text-xs font-medium text-center truncate ${isUnlocked ? 'text-dark-100' : 'text-dark-500'}`}>
                                {badge.name}
                            </h4>

                            {/* Tier Indicator */}
                            {isUnlocked && (
                                <div className={`text-[10px] text-center mt-1 ${rarity.text}`}>
                                    {badge.tier.toUpperCase()}
                                </div>
                            )}

                            {/* Checkmark for unlocked */}
                            {isUnlocked && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Badge Detail Modal */}
            <AnimatePresence>
                {selectedBadge && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedBadge(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-sm"
                        >
                            <BadgeDetailCard
                                badge={selectedBadge}
                                isUnlocked={unlockedIds.has(selectedBadge.id)}
                                unlockedAt={unlockedAchievements.find(a => a.id === selectedBadge.id)?.unlockedAt}
                                onClose={() => setSelectedBadge(null)}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

/**
 * Badge Detail Card
 */
const BadgeDetailCard = ({ badge, isUnlocked, unlockedAt, onClose }) => {
    const rarity = tierColors[badge.tier];

    return (
        <div className={`
      rounded-2xl overflow-hidden
      bg-gradient-to-b from-dark-800 to-dark-900
      border ${isUnlocked ? rarity.border : 'border-dark-600'}
    `}>
            {/* Header with gradient */}
            <div className={`
        p-6 text-center
        ${isUnlocked ? `bg-gradient-to-br ${rarity.bg}` : 'bg-dark-700/50'}
      `}>
                <div className={`text-6xl mb-3 ${!isUnlocked && 'grayscale'}`}>
                    {badge.icon}
                </div>
                <h3 className="text-xl font-bold text-dark-100">{badge.name}</h3>
                <p className={`text-sm ${rarity.text} uppercase font-medium mt-1`}>
                    {badge.tier} Badge
                </p>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
                <p className="text-dark-300 text-center">{badge.description}</p>

                <div className="flex items-center justify-center gap-6 py-3 border-y border-dark-700">
                    <div className="text-center">
                        <span className="text-xs text-dark-500 block">XP Reward</span>
                        <span className="text-lg font-bold text-warning">+{badge.xpReward}</span>
                    </div>
                    <div className="text-center">
                        <span className="text-xs text-dark-500 block">Category</span>
                        <span className="text-lg font-medium text-dark-200">{categories[badge.category]?.name}</span>
                    </div>
                </div>

                {isUnlocked && unlockedAt && (
                    <div className="text-center text-sm text-dark-400">
                        <Check className="w-4 h-4 inline-block text-success mr-1" />
                        Unlocked on {new Date(unlockedAt).toLocaleDateString()}
                    </div>
                )}

                {!isUnlocked && (
                    <div className="text-center text-sm text-dark-500">
                        <Lock className="w-4 h-4 inline-block mr-1" />
                        Keep practicing to unlock this badge!
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="w-full py-2 rounded-lg bg-dark-700 text-dark-300 hover:bg-dark-600 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default BadgeCollection;
