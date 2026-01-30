/**
 * Database Seed Utility
 * Seeds Firestore with initial signs and achievements data
 * 
 * Run once to populate the database with initial data
 */

import { doc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { COLLECTIONS } from '@/services/database';

/**
 * Alphabet Signs Data
 * All 26 ASL alphabet letters with metadata
 */
const alphabetSigns = [
    { id: 'A', display: 'A', difficulty: 1, tips: ['Make a fist with thumb on the side', 'Keep fingers tight'], commonMistakes: ['Thumb in front instead of side'] },
    { id: 'B', display: 'B', difficulty: 1, tips: ['Flat hand with thumb tucked across palm', 'Fingers together pointing up'], commonMistakes: ['Spreading fingers apart'] },
    { id: 'C', display: 'C', difficulty: 1, tips: ['Curved hand like holding a cup', 'Keep thumb and fingers curved equally'], commonMistakes: ['Making hand too flat'] },
    { id: 'D', display: 'D', difficulty: 2, tips: ['Index finger up, other fingers touch thumb', 'Circle formed by thumb and middle finger'], commonMistakes: ['Not touching thumb and fingers'] },
    { id: 'E', display: 'E', difficulty: 1, tips: ['Fingers curled into palm', 'Thumb across front of fingers'], commonMistakes: ['Thumb placed incorrectly'] },
    { id: 'F', display: 'F', difficulty: 2, tips: ['Thumb and index finger form circle', 'Other three fingers extended up'], commonMistakes: ['Circle too large'] },
    { id: 'G', display: 'G', difficulty: 2, tips: ['Index finger and thumb parallel, pointing forward', 'Other fingers curled'], commonMistakes: ['Hand orientation wrong'] },
    { id: 'H', display: 'H', difficulty: 2, tips: ['Index and middle finger extended, parallel', 'Point sideways'], commonMistakes: ['Fingers pointing up instead of sideways'] },
    { id: 'I', display: 'I', difficulty: 1, tips: ['Pinky extended up', 'Other fingers make a fist'], commonMistakes: ['Moving the pinky while signing'] },
    { id: 'J', display: 'J', difficulty: 3, tips: ['Start with pinky up like I', 'Draw a J in the air'], commonMistakes: ['Drawing the wrong motion'] },
    { id: 'K', display: 'K', difficulty: 2, tips: ['Index and middle finger up in V', 'Thumb between them'], commonMistakes: ['Thumb placement'] },
    { id: 'L', display: 'L', difficulty: 1, tips: ['Index finger up, thumb extended sideways', 'Forms an L shape'], commonMistakes: ['Not extending thumb enough'] },
    { id: 'M', display: 'M', difficulty: 2, tips: ['Three fingers over thumb', 'Thumb under index, middle, and ring fingers'], commonMistakes: ['Wrong number of fingers over thumb'] },
    { id: 'N', display: 'N', difficulty: 2, tips: ['Two fingers over thumb', 'Thumb under index and middle fingers'], commonMistakes: ['Confusing with M'] },
    { id: 'O', display: 'O', difficulty: 1, tips: ['All fingertips touch thumb', 'Create an O shape'], commonMistakes: ['Fingers not meeting thumb'] },
    { id: 'P', display: 'P', difficulty: 3, tips: ['Like K but pointing down', 'Index and middle out, thumb between'], commonMistakes: ['Hand orientation'] },
    { id: 'Q', display: 'Q', difficulty: 3, tips: ['Like G but pointing down', 'Thumb and index pointing down'], commonMistakes: ['Confusing with G'] },
    { id: 'R', display: 'R', difficulty: 2, tips: ['Cross index and middle fingers', 'Other fingers curled'], commonMistakes: ['Fingers not crossed properly'] },
    { id: 'S', display: 'S', difficulty: 1, tips: ['Fist with thumb across front of fingers', 'Similar to E but thumb in front'], commonMistakes: ['Confusing with A'] },
    { id: 'T', display: 'T', difficulty: 2, tips: ['Thumb between index and middle finger', 'Other fingers make a fist'], commonMistakes: ['Thumb position'] },
    { id: 'U', display: 'U', difficulty: 1, tips: ['Index and middle finger up together', 'Fingers pointing up, touching'], commonMistakes: ['Fingers separated like V'] },
    { id: 'V', display: 'V', difficulty: 1, tips: ['Index and middle finger up, separated', 'Peace sign'], commonMistakes: ['Fingers touching like U'] },
    { id: 'W', display: 'W', difficulty: 1, tips: ['Index, middle, and ring fingers up, separated', 'Three fingers spread'], commonMistakes: ['Wrong fingers extended'] },
    { id: 'X', display: 'X', difficulty: 2, tips: ['Index finger bent like a hook', 'Other fingers make a fist'], commonMistakes: ['Index finger too straight'] },
    { id: 'Y', display: 'Y', difficulty: 1, tips: ['Thumb and pinky extended', 'Hang loose sign'], commonMistakes: ['Other fingers not curled'] },
    { id: 'Z', display: 'Z', difficulty: 3, tips: ['Index finger draws Z in air', 'Start with finger pointing out'], commonMistakes: ['Drawing the wrong motion'] },
];

/**
 * Achievements Data
 * Gamification achievements for user motivation
 */
const achievements = [
    {
        id: 'first_sign',
        name: 'First Steps',
        description: 'Learn your first sign',
        icon: '🌟',
        criteria: { type: 'signs_learned', value: 1 },
        tier: 'bronze',
        points: 10,
    },
    {
        id: 'alphabet_beginner',
        name: 'Alphabet Explorer',
        description: 'Learn 5 alphabet letters',
        icon: '📚',
        criteria: { type: 'signs_learned', value: 5 },
        tier: 'bronze',
        points: 25,
    },
    {
        id: 'alphabet_intermediate',
        name: 'Alphabet Apprentice',
        description: 'Learn 13 alphabet letters',
        icon: '🎓',
        criteria: { type: 'signs_learned', value: 13 },
        tier: 'silver',
        points: 50,
    },
    {
        id: 'alphabet_master',
        name: 'Alphabet Master',
        description: 'Learn all 26 alphabet letters',
        icon: '🏆',
        criteria: { type: 'signs_learned', value: 26 },
        tier: 'gold',
        points: 100,
    },
    {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day practice streak',
        icon: '🔥',
        criteria: { type: 'streak', value: 7 },
        tier: 'silver',
        points: 50,
    },
    {
        id: 'month_master',
        name: 'Month Master',
        description: 'Maintain a 30-day practice streak',
        icon: '⚡',
        criteria: { type: 'streak', value: 30 },
        tier: 'gold',
        points: 200,
    },
    {
        id: 'perfect_practice',
        name: 'Perfect Practice',
        description: 'Get 100% accuracy in 5 practice sessions',
        icon: '💯',
        criteria: { type: 'perfect_sessions', value: 5 },
        tier: 'silver',
        points: 75,
    },
    {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete 10 signs in under 5 minutes',
        icon: '⚡',
        criteria: { type: 'speed_challenge', value: 10 },
        tier: 'silver',
        points: 50,
    },
    {
        id: 'dedicated_learner',
        name: 'Dedicated Learner',
        description: 'Complete 50 practice sessions',
        icon: '📖',
        criteria: { type: 'practice_sessions', value: 50 },
        tier: 'gold',
        points: 150,
    },
];

/**
 * Seed Signs Collection
 * Creates all alphabet signs in Firestore
 */
export async function seedSigns() {
    console.log('🌱 Seeding signs collection...');

    if (!db) {
        console.error('❌ Firebase not initialized');
        return false;
    }

    try {
        let created = 0;
        let skipped = 0;

        for (const sign of alphabetSigns) {
            const signDoc = {
                id: sign.id,
                type: 'alphabet',
                display: sign.display,
                modelPath: `/models/alphabet/letter_${sign.id}.glb`,
                difficulty: sign.difficulty,
                category: 'alphabet',
                tips: sign.tips,
                commonMistakes: sign.commonMistakes,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            await setDoc(doc(db, COLLECTIONS.SIGNS, sign.id), signDoc);
            created++;
            console.log(`✓ Created sign: ${sign.id}`);
        }

        console.log(`✅ Signs seeded: ${created} created, ${skipped} skipped`);
        return true;
    } catch (error) {
        console.error('❌ Error seeding signs:', error.message);
        return false;
    }
}

/**
 * Seed Achievements Collection
 * Creates all achievement definitions in Firestore
 */
export async function seedAchievements() {
    console.log('🏆 Seeding achievements collection...');

    if (!db) {
        console.error('❌ Firebase not initialized');
        return false;
    }

    try {
        let created = 0;

        for (const achievement of achievements) {
            const achievementDoc = {
                ...achievement,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            await setDoc(doc(db, COLLECTIONS.ACHIEVEMENTS, achievement.id), achievementDoc);
            created++;
            console.log(`✓ Created achievement: ${achievement.name}`);
        }

        console.log(`✅ Achievements seeded: ${created} created`);
        return true;
    } catch (error) {
        console.error('❌ Error seeding achievements:', error.message);
        return false;
    }
}

/**
 * Seed Full Database
 * Runs all seed functions
 */
export async function seedDatabase() {
    console.log('🌱 Starting database seed...\n');

    const startTime = Date.now();

    const signsResult = await seedSigns();
    console.log('');

    const achievementsResult = await seedAchievements();
    console.log('');

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (signsResult && achievementsResult) {
        console.log(`🎉 Database seeding complete in ${duration}s!`);
        console.log('   - 26 alphabet signs');
        console.log('   - 9 achievements');
    } else {
        console.log('⚠️ Some seed operations failed. Check logs above.');
    }

    return signsResult && achievementsResult;
}

/**
 * Check if database is already seeded
 */
export async function isDatabaseSeeded() {
    if (!db) return false;

    try {
        const signsSnap = await getDocs(collection(db, COLLECTIONS.SIGNS));
        const achievementsSnap = await getDocs(collection(db, COLLECTIONS.ACHIEVEMENTS));

        return signsSnap.size > 0 && achievementsSnap.size > 0;
    } catch (error) {
        console.error('Error checking seed status:', error);
        return false;
    }
}

// Export for use in console or admin UI
export default {
    seedSigns,
    seedAchievements,
    seedDatabase,
    isDatabaseSeeded,
};
