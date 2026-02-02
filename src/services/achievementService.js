/**
 * Achievement Service
 * Handles checking and unlocking achievements based on user progress
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { getUserProfile, getAllAchievements, unlockAchievement } from './database';

// Default achievements if Firestore doesn't have them
const DEFAULT_ACHIEVEMENTS = [
    {
        id: 'first_sign',
        name: 'First Sign',
        description: 'Learn your first sign',
        icon: '🎯',
        criteria: { type: 'signsLearned', value: 1 }
    },
    {
        id: 'getting_started',
        name: 'Getting Started',
        description: 'Learn 5 signs',
        icon: '🌱',
        criteria: { type: 'signsLearned', value: 5 }
    },
    {
        id: 'alphabet_half',
        name: 'Halfway There',
        description: 'Learn 13 signs (half the alphabet)',
        icon: '✨',
        criteria: { type: 'signsLearned', value: 13 }
    },
    {
        id: 'alphabet_master',
        name: 'Alphabet Master',
        description: 'Learn all 26 letters',
        icon: '👑',
        criteria: { type: 'signsLearned', value: 26 }
    },
    {
        id: 'streak_3',
        name: 'On a Roll',
        description: 'Practice 3 days in a row',
        icon: '🔥',
        criteria: { type: 'streak', value: 3 }
    },
    {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Practice 7 days in a row',
        icon: '⚡',
        criteria: { type: 'streak', value: 7 }
    },
    {
        id: 'streak_30',
        name: 'Dedication',
        description: 'Practice 30 days in a row',
        icon: '💪',
        criteria: { type: 'streak', value: 30 }
    },
    {
        id: 'perfect_practice',
        name: 'Perfect Practice',
        description: 'Get 100% accuracy on a sign',
        icon: '💯',
        criteria: { type: 'perfectSession', value: 1 }
    },
    {
        id: 'speed_learner',
        name: 'Speed Learner',
        description: 'Learn 5 signs in one session',
        icon: '⚡',
        criteria: { type: 'signsInSession', value: 5 }
    }
];

/**
 * Check and unlock achievements based on user data
 * 
 * @param {string} userId - User ID to check achievements for
 * @param {Object} userData - Optional user data (will be fetched if not provided)
 * @returns {Promise<Array>} Array of newly unlocked achievements
 */
export async function checkAndUnlockAchievements(userId, userData = null) {
    if (!userId) {
        console.warn('⚠️ No userId provided for achievement check');
        return [];
    }

    try {
        console.log('🏆 Checking achievements for user:', userId);

        // Get user profile if not provided
        const profile = userData || await getUserProfile(userId);

        if (!profile) {
            console.warn('⚠️ No user profile found');
            return [];
        }

        // Get user's already unlocked achievements
        const unlockedIds = new Set(
            (profile.achievements || []).map(a => a.id)
        );

        // Get achievement definitions (try Firestore first, fall back to defaults)
        let achievementDefs;
        try {
            achievementDefs = await getAllAchievements();
            if (!achievementDefs || achievementDefs.length === 0) {
                achievementDefs = DEFAULT_ACHIEVEMENTS;
            }
        } catch {
            achievementDefs = DEFAULT_ACHIEVEMENTS;
        }

        // Check each achievement
        const newlyUnlocked = [];

        for (const achievement of achievementDefs) {
            // Skip if already unlocked
            if (unlockedIds.has(achievement.id)) {
                continue;
            }

            // Check if criteria is met
            const isMet = checkAchievementCriteria(achievement, profile);

            if (isMet) {
                console.log(`🏆 Unlocking achievement: ${achievement.name}`);

                try {
                    await unlockAchievement(userId, achievement.id);
                    newlyUnlocked.push(achievement);
                } catch (error) {
                    console.error(`❌ Failed to unlock achievement ${achievement.id}:`, error);
                }
            }
        }

        if (newlyUnlocked.length > 0) {
            console.log(`✅ Unlocked ${newlyUnlocked.length} new achievements`);
        }

        return newlyUnlocked;
    } catch (error) {
        console.error('❌ Error checking achievements:', error);
        return [];
    }
}

/**
 * Check if an achievement's criteria is met
 * 
 * @param {Object} achievement - Achievement definition
 * @param {Object} userProfile - User profile data
 * @returns {boolean} Whether criteria is met
 */
function checkAchievementCriteria(achievement, userProfile) {
    const { criteria } = achievement;

    if (!criteria || !criteria.type) {
        return false;
    }

    const progress = userProfile.progress || {};
    const learnedSigns = userProfile.learnedSigns || [];
    const practiceHistory = userProfile.practiceHistory || [];

    switch (criteria.type) {
        case 'signsLearned':
            return learnedSigns.length >= criteria.value;

        case 'streak':
            return (progress.streak || 0) >= criteria.value;

        case 'perfectSession':
            // Check for any 100% accuracy practice session
            const perfectSessions = practiceHistory.filter(p => p.accuracy === 100);
            return perfectSessions.length >= criteria.value;

        case 'signsInSession':
            // This would need session tracking - simplified check
            return false;

        case 'totalPractice':
            return practiceHistory.length >= criteria.value;

        case 'accuracy':
            return (progress.accuracy || 0) >= criteria.value;

        default:
            console.warn(`⚠️ Unknown criteria type: ${criteria.type}`);
            return false;
    }
}

/**
 * Get all achievement definitions
 * 
 * @returns {Promise<Array>} Array of achievement definitions
 */
export async function getAchievementDefinitions() {
    try {
        const achievements = await getAllAchievements();
        if (achievements && achievements.length > 0) {
            return achievements;
        }
    } catch (error) {
        console.warn('⚠️ Could not fetch achievements from Firestore');
    }

    return DEFAULT_ACHIEVEMENTS;
}

/**
 * Get user's unlocked achievements with full details
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of unlocked achievements with details
 */
export async function getUserAchievementsWithDetails(userId) {
    if (!userId) return [];

    try {
        const profile = await getUserProfile(userId);
        const userAchievements = profile?.achievements || [];
        const allAchievements = await getAchievementDefinitions();

        // Map unlocked achievements to their definitions
        return userAchievements.map(ua => {
            const definition = allAchievements.find(a => a.id === ua.id);
            return {
                ...definition,
                ...ua,
                unlockedAt: ua.unlockedAt?.toDate?.() || ua.unlockedAt
            };
        });
    } catch (error) {
        console.error('❌ Error getting user achievements:', error);
        return [];
    }
}

export default {
    checkAndUnlockAchievements,
    getAchievementDefinitions,
    getUserAchievementsWithDetails
};
