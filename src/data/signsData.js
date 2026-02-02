/**
 * Signs Data
 * Comprehensive data for all 26 ASL alphabet letters
 */

// ============================================
// ALPHABET SIGNS DATA
// ============================================

export const alphabetSigns = [
    {
        id: 'A',
        letter: 'A',
        display: 'A',
        modelPath: '/models/alphabet/letter_A.glb',
        difficulty: 1,
        category: 'alphabet',
        tips: [
            'Make a fist with your thumb resting on the side',
            'Keep your thumb parallel to your fingers, not tucked in',
            'Your knuckles should face forward',
            'Keep your wrist straight and relaxed'
        ],
        commonMistakes: [
            'Tucking the thumb inside the fist',
            'Pointing the thumb upward like a thumbs-up',
            'Having loose or relaxed fingers'
        ],
        description: 'The letter A is signed by making a fist with your thumb resting alongside your fingers. Keep your fist tight and your thumb visible on the side.'
    },
    {
        id: 'B',
        letter: 'B',
        display: 'B',
        modelPath: '/models/alphabet/letter_B.glb',
        difficulty: 1,
        category: 'alphabet',
        tips: [
            'Hold all four fingers straight up and together',
            'Tuck your thumb across your palm',
            'Keep your fingers pressed firmly together',
            'Your palm should face forward'
        ],
        commonMistakes: [
            'Spreading the fingers apart',
            'Leaving the thumb sticking out',
            'Bending the fingers at the knuckles'
        ],
        description: 'The letter B is signed by holding all four fingers straight up with your thumb tucked across your palm. Keep fingers together and palm facing forward.'
    },
    {
        id: 'C',
        letter: 'C',
        display: 'C',
        modelPath: '/models/alphabet/letter_C.glb',
        difficulty: 1,
        category: 'alphabet',
        tips: [
            'Curve your hand to form a C shape',
            'Your thumb and fingers should not touch',
            'Keep the curve smooth and natural',
            'Orient your hand so the opening faces right'
        ],
        commonMistakes: [
            'Making the curve too tight or too wide',
            'Letting fingers and thumb touch',
            'Keeping fingers straight instead of curved'
        ],
        description: 'The letter C is signed by curving your hand into a C shape. Your thumb and fingers curve toward each other but do not touch.'
    },
    {
        id: 'D',
        letter: 'D',
        display: 'D',
        modelPath: '/models/alphabet/letter_D.glb',
        difficulty: 1,
        category: 'alphabet',
        tips: [
            'Point your index finger straight up',
            'Touch your thumb to your middle, ring, and pinky fingers',
            'The touching fingers form a circle with thumb',
            'Keep your index finger fully extended'
        ],
        commonMistakes: [
            'Bending the index finger',
            'Not touching thumb to the other fingers',
            'Extending multiple fingers'
        ],
        description: 'The letter D is signed by pointing your index finger up while your thumb touches your other three fingers, forming a circle shape.'
    },
    {
        id: 'E',
        letter: 'E',
        display: 'E',
        modelPath: '/models/alphabet/letter_E.glb',
        difficulty: 1,
        category: 'alphabet',
        tips: [
            'Curl all four fingers down toward your palm',
            'Rest your thumb across the curled fingers',
            'Keep your fingers together, not spread',
            'The fingertips should touch or nearly touch your palm'
        ],
        commonMistakes: [
            'Keeping fingers too straight',
            'Spreading fingers apart',
            'Thumb pointing outward instead of resting on fingers'
        ],
        description: 'The letter E is signed by curling all four fingers toward your palm with your thumb resting across them.'
    },
    {
        id: 'F',
        letter: 'F',
        display: 'F',
        modelPath: '/models/alphabet/letter_F.glb',
        difficulty: 1,
        category: 'alphabet',
        tips: [
            'Touch your thumb and index finger to form a circle',
            'Extend your middle, ring, and pinky fingers straight up',
            'Keep the three extended fingers together',
            'The circle should be clearly formed'
        ],
        commonMistakes: [
            'Spreading the three extended fingers',
            'Not completing the circle with thumb and index',
            'Bending the extended fingers'
        ],
        description: 'The letter F is signed by touching your thumb and index finger in a circle while extending the other three fingers upward.'
    },
    {
        id: 'G',
        letter: 'G',
        display: 'G',
        modelPath: '/models/alphabet/letter_G.glb',
        difficulty: 2,
        category: 'alphabet',
        tips: [
            'Point your index finger and thumb sideways',
            'Hold them parallel to each other',
            'Curl the other three fingers into your palm',
            'Your hand should be horizontal, not vertical'
        ],
        commonMistakes: [
            'Pointing fingers up instead of sideways',
            'Spreading thumb too far from index finger',
            'Extending other fingers'
        ],
        description: 'The letter G is signed by pointing your index finger and thumb horizontally to the side, parallel to each other.'
    },
    {
        id: 'H',
        letter: 'H',
        display: 'H',
        modelPath: '/models/alphabet/letter_H.glb',
        difficulty: 2,
        category: 'alphabet',
        tips: [
            'Extend your index and middle fingers horizontally',
            'Keep these two fingers together',
            'Tuck your thumb, ring, and pinky fingers in',
            'Your hand should be positioned sideways'
        ],
        commonMistakes: [
            'Pointing fingers up instead of sideways',
            'Spreading the two extended fingers',
            'Leaving thumb extended'
        ],
        description: 'The letter H is signed by extending your index and middle fingers horizontally to the side, pressed together.'
    },
    {
        id: 'I',
        letter: 'I',
        display: 'I',
        modelPath: '/models/alphabet/letter_I.glb',
        difficulty: 2,
        category: 'alphabet',
        tips: [
            'Extend only your pinky finger straight up',
            'Curl all other fingers into your palm',
            'Rest your thumb across the curled fingers',
            'Keep your pinky fully straight'
        ],
        commonMistakes: [
            'Accidentally extending other fingers',
            'Bending the pinky finger',
            'Thumb sticking out to the side'
        ],
        description: 'The letter I is signed by extending only your pinky finger straight up while all other fingers are curled into your palm.'
    },
    {
        id: 'J',
        letter: 'J',
        display: 'J',
        modelPath: '/models/alphabet/letter_J.glb',
        difficulty: 2,
        category: 'alphabet',
        tips: [
            'Start with the I handshape (pinky extended)',
            'Draw a J in the air with your pinky',
            'The motion goes down, curves, and hooks up',
            'Keep the movement smooth and clear'
        ],
        commonMistakes: [
            'Drawing the J backward',
            'Moving the wrong fingers',
            'Making the motion too small'
        ],
        description: 'The letter J is signed by starting with the I handshape and drawing the letter J in the air with your pinky finger.'
    },
    {
        id: 'K',
        letter: 'K',
        display: 'K',
        modelPath: '/models/alphabet/letter_K.glb',
        difficulty: 2,
        category: 'alphabet',
        tips: [
            'Extend your index and middle fingers in a V shape',
            'Place your thumb between them, touching the middle finger',
            'Curl your ring and pinky fingers in',
            'The V should point upward'
        ],
        commonMistakes: [
            'Keeping the V closed like a peace sign',
            'Thumb not positioned between the fingers',
            'Ring and pinky fingers extending'
        ],
        description: 'The letter K is signed with index and middle fingers extended in a V, with your thumb placed between them against the middle finger.'
    },
    {
        id: 'L',
        letter: 'L',
        display: 'L',
        modelPath: '/models/alphabet/letter_L.glb',
        difficulty: 2,
        category: 'alphabet',
        tips: [
            'Extend your index finger and thumb to form an L',
            'Keep the L shape at a 90-degree angle',
            'Curl your other three fingers in',
            'Palm should face outward'
        ],
        commonMistakes: [
            'Making the angle too wide or narrow',
            'Extending other fingers',
            'Pointing the L in wrong direction'
        ],
        description: 'The letter L is signed by extending your thumb and index finger at a 90-degree angle to form an L shape.'
    },
    {
        id: 'M',
        letter: 'M',
        display: 'M',
        modelPath: '/models/alphabet/letter_M.glb',
        difficulty: 2,
        category: 'alphabet',
        tips: [
            'Tuck your thumb under your first three fingers',
            'Rest the three fingers over your thumb',
            'Keep your pinky finger tucked in separately',
            'Your thumb should peek out between ring and pinky'
        ],
        commonMistakes: [
            'Having thumb visible between wrong fingers',
            'Extending the pinky',
            'Not tucking fingers down enough'
        ],
        description: 'The letter M is signed by tucking your thumb under your first three fingers (index, middle, ring), with the thumb peeking out.'
    },
    {
        id: 'N',
        letter: 'N',
        display: 'N',
        modelPath: '/models/alphabet/letter_N.glb',
        difficulty: 2,
        category: 'alphabet',
        tips: [
            'Tuck your thumb under your first two fingers',
            'Rest index and middle fingers over thumb',
            'Keep ring and pinky fingers curled in',
            'Thumb peeks out between middle and ring fingers'
        ],
        commonMistakes: [
            'Using too many fingers over the thumb',
            'Thumb visible in wrong position',
            'Fingers not tucked tightly'
        ],
        description: 'The letter N is signed by tucking your thumb under your first two fingers (index, middle), with the thumb peeking between middle and ring.'
    },
    {
        id: 'O',
        letter: 'O',
        display: 'O',
        modelPath: '/models/alphabet/letter_O.glb',
        difficulty: 2,
        category: 'alphabet',
        tips: [
            'Curve all fingers and thumb to form an O shape',
            'Fingertips should touch your thumb',
            'Keep the circle round and even',
            'Your hand forms a complete circle'
        ],
        commonMistakes: [
            'Making the O too flat or oval',
            'Fingers not touching the thumb',
            'Some fingers extended instead of curved'
        ],
        description: 'The letter O is signed by curving all fingers to meet your thumb, forming a complete O or circle shape.'
    },
    {
        id: 'P',
        letter: 'P',
        display: 'P',
        modelPath: '/models/alphabet/letter_P.glb',
        difficulty: 2,
        category: 'alphabet',
        tips: [
            'Make the K handshape but point it downward',
            'Index and middle fingers in a V, pointing down',
            'Thumb between the two fingers',
            'Your hand angles down toward the floor'
        ],
        commonMistakes: [
            'Pointing the shape upward like K',
            'Thumb not positioned correctly',
            'Angle not steep enough'
        ],
        description: 'The letter P is signed like K but pointed downward. Index and middle fingers form a V pointing down with thumb between them.'
    },
    {
        id: 'Q',
        letter: 'Q',
        display: 'Q',
        modelPath: '/models/alphabet/letter_Q.glb',
        difficulty: 3,
        category: 'alphabet',
        tips: [
            'Make the G handshape but point it downward',
            'Index finger and thumb point down together',
            'Other fingers curled into palm',
            'The hand faces the floor'
        ],
        commonMistakes: [
            'Pointing horizontally like G',
            'Extending additional fingers',
            'Thumb and index too far apart'
        ],
        description: 'The letter Q is signed like G but pointed downward. Your index finger and thumb point toward the floor.'
    },
    {
        id: 'R',
        letter: 'R',
        display: 'R',
        modelPath: '/models/alphabet/letter_R.glb',
        difficulty: 3,
        category: 'alphabet',
        tips: [
            'Cross your middle finger over your index finger',
            'Extend both fingers upward while crossed',
            'Curl your other fingers and thumb in',
            'The cross represents the R shape'
        ],
        commonMistakes: [
            'Index over middle instead of middle over index',
            'Not crossing the fingers enough',
            'Other fingers extending'
        ],
        description: 'The letter R is signed by crossing your middle finger over your index finger and extending them both upward.'
    },
    {
        id: 'S',
        letter: 'S',
        display: 'S',
        modelPath: '/models/alphabet/letter_S.glb',
        difficulty: 3,
        category: 'alphabet',
        tips: [
            'Make a fist with your thumb across your fingers',
            'Thumb rests on the outside of your curled fingers',
            'Keep the fist tight and compact',
            'Knuckles face forward'
        ],
        commonMistakes: [
            'Thumb tucked inside (that would be T)',
            'Thumb on the side (that would be A)',
            'Loose fist grip'
        ],
        description: 'The letter S is signed by making a fist with your thumb wrapped across the front of your curled fingers.'
    },
    {
        id: 'T',
        letter: 'T',
        display: 'T',
        modelPath: '/models/alphabet/letter_T.glb',
        difficulty: 3,
        category: 'alphabet',
        tips: [
            'Make a fist with your thumb tucked between index and middle fingers',
            'The thumb tip should peek out between the two fingers',
            'Keep the fist tight',
            'Other fingers fully curled'
        ],
        commonMistakes: [
            'Thumb fully hidden inside fist',
            'Thumb between wrong fingers',
            'Fist too loose'
        ],
        description: 'The letter T is signed by making a fist with your thumb tucked between your index and middle fingers, peeking out.'
    },
    {
        id: 'U',
        letter: 'U',
        display: 'U',
        modelPath: '/models/alphabet/letter_U.glb',
        difficulty: 3,
        category: 'alphabet',
        tips: [
            'Extend your index and middle fingers straight up, together',
            'Keep these fingers pressed tightly together',
            'Tuck your thumb and other fingers in',
            'The two fingers represent the U shape'
        ],
        commonMistakes: [
            'Spreading the two fingers apart (that is V)',
            'Bending the extended fingers',
            'Thumb extending outward'
        ],
        description: 'The letter U is signed by extending your index and middle fingers straight up, pressed tightly together.'
    },
    {
        id: 'V',
        letter: 'V',
        display: 'V',
        modelPath: '/models/alphabet/letter_V.glb',
        difficulty: 3,
        category: 'alphabet',
        tips: [
            'Extend your index and middle fingers in a V shape',
            'Spread these fingers apart clearly',
            'Curl your thumb and other fingers in',
            'Your palm should face outward'
        ],
        commonMistakes: [
            'Fingers too close together (that is U)',
            'Extending additional fingers',
            'Bending the V fingers'
        ],
        description: 'The letter V is signed by extending your index and middle fingers spread apart in a V shape. Also the peace sign.'
    },
    {
        id: 'W',
        letter: 'W',
        display: 'W',
        modelPath: '/models/alphabet/letter_W.glb',
        difficulty: 3,
        category: 'alphabet',
        tips: [
            'Extend your index, middle, and ring fingers spread apart',
            'These three fingers form a W shape',
            'Tuck your thumb and pinky into your palm',
            'Keep the three fingers evenly spread'
        ],
        commonMistakes: [
            'Not spreading the fingers enough',
            'Including the pinky finger',
            'Fingers not evenly spaced'
        ],
        description: 'The letter W is signed by extending and spreading your index, middle, and ring fingers to form a W shape.'
    },
    {
        id: 'X',
        letter: 'X',
        display: 'X',
        modelPath: '/models/alphabet/letter_X.glb',
        difficulty: 3,
        category: 'alphabet',
        tips: [
            'Extend your index finger and bend it into a hook',
            'Curl all other fingers and thumb into your palm',
            'The hook represents the X shape',
            'Keep the hook tight, like a claw'
        ],
        commonMistakes: [
            'Keeping index finger straight',
            'Extending other fingers',
            'Hook not curved enough'
        ],
        description: 'The letter X is signed by making a hook with your index finger while all other fingers are curled into your palm.'
    },
    {
        id: 'Y',
        letter: 'Y',
        display: 'Y',
        modelPath: '/models/alphabet/letter_Y.glb',
        difficulty: 3,
        category: 'alphabet',
        tips: [
            'Extend your thumb and pinky finger outward',
            'Curl your middle three fingers into your palm',
            'The shape resembles the letter Y',
            'Keep thumb and pinky fully extended'
        ],
        commonMistakes: [
            'Extending additional fingers',
            'Thumb or pinky not fully extended',
            'Hand positioned incorrectly'
        ],
        description: 'The letter Y is signed by extending your thumb and pinky finger while curling the other three fingers in. Also the "hang loose" sign.'
    },
    {
        id: 'Z',
        letter: 'Z',
        display: 'Z',
        modelPath: '/models/alphabet/letter_Z.glb',
        difficulty: 3,
        category: 'alphabet',
        tips: [
            'Extend your index finger',
            'Draw a Z shape in the air',
            'Start from top left, go right, diagonal down, then right again',
            'Keep the motion crisp and clear'
        ],
        commonMistakes: [
            'Drawing the Z backward',
            'Using the wrong finger',
            'Motion too small or unclear'
        ],
        description: 'The letter Z is signed by extending your index finger and drawing the letter Z in the air.'
    }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get sign data for a specific letter
 * @param {string} letter - Single letter (A-Z)
 * @returns {Object|null} Sign data object or null
 */
export function getSignByLetter(letter) {
    if (!letter) return null;
    const upperLetter = letter.toUpperCase();
    return alphabetSigns.find(sign => sign.letter === upperLetter) || null;
}

/**
 * Get signs by difficulty level
 * @param {number} level - Difficulty level (1, 2, or 3)
 * @returns {Array} Array of sign objects
 */
export function getSignsByDifficulty(level) {
    return alphabetSigns.filter(sign => sign.difficulty === level);
}

/**
 * Get all signs
 * @returns {Array} Array of all sign objects
 */
export function getAllSigns() {
    return [...alphabetSigns];
}

/**
 * Get signs by category
 * @param {string} category - Category name
 * @returns {Array} Array of sign objects
 */
export function getSignsByCategory(category) {
    return alphabetSigns.filter(sign => sign.category === category);
}

/**
 * Get difficulty label
 * @param {number} difficulty - Difficulty level
 * @returns {string} Difficulty label
 */
export function getDifficultyLabel(difficulty) {
    switch (difficulty) {
        case 1: return 'Easy';
        case 2: return 'Medium';
        case 3: return 'Hard';
        default: return 'Unknown';
    }
}

/**
 * Get difficulty color classes
 * @param {number} difficulty - Difficulty level
 * @returns {string} Tailwind color classes
 */
export function getDifficultyColor(difficulty) {
    switch (difficulty) {
        case 1: return 'bg-success/10 text-success border-success/20';
        case 2: return 'bg-warning/10 text-warning border-warning/20';
        case 3: return 'bg-error/10 text-error border-error/20';
        default: return 'bg-dark-700 text-dark-400';
    }
}

export default alphabetSigns;
