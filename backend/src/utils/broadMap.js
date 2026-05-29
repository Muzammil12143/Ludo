// frontend/src/utils/boardMap.js

/**
 * Maps the 52 shared squares of the board to a 15x15 CSS Grid.
 * x = column (1-15), y = row (1-15)
 */
export const MAIN_TRACK = [
  { x: 2, y: 9 }, // 0: RED Start
  { x: 3, y: 9 }, // 1
  { x: 4, y: 9 }, // 2
  { x: 5, y: 9 }, // 3
  { x: 6, y: 9 }, // 4
  { x: 7, y: 10 }, // 5: Turn down into bottom arm
  { x: 7, y: 11 }, // 6
  { x: 7, y: 12 }, // 7
  { x: 7, y: 13 }, // 8: Safe Zone (Star)
  { x: 7, y: 14 }, // 9
  { x: 7, y: 15 }, // 10
  { x: 8, y: 15 }, // 11: Turn right
  { x: 9, y: 15 }, // 12
  { x: 9, y: 14 }, // 13: BLUE Start
  { x: 9, y: 13 }, // 14
  { x: 9, y: 12 }, // 15
  { x: 9, y: 11 }, // 16
  { x: 9, y: 10 }, // 17
  { x: 10, y: 9 }, // 18: Turn right into right arm
  { x: 11, y: 9 }, // 19
  { x: 12, y: 9 }, // 20
  { x: 13, y: 9 }, // 21: Safe Zone (Star)
  { x: 14, y: 9 }, // 22
  { x: 15, y: 9 }, // 23
  { x: 15, y: 8 }, // 24: Turn up
  { x: 15, y: 7 }, // 25
  { x: 14, y: 7 }, // 26: YELLOW Start
  { x: 13, y: 7 }, // 27
  { x: 12, y: 7 }, // 28
  { x: 11, y: 7 }, // 29
  { x: 10, y: 7 }, // 30
  { x: 9, y: 6 }, // 31: Turn up into top arm
  { x: 9, y: 5 }, // 32
  { x: 9, y: 4 }, // 33
  { x: 9, y: 3 }, // 34: Safe Zone (Star)
  { x: 9, y: 2 }, // 35
  { x: 9, y: 1 }, // 36
  { x: 8, y: 1 }, // 37: Turn left
  { x: 7, y: 1 }, // 38
  { x: 7, y: 2 }, // 39: GREEN Start
  { x: 7, y: 3 }, // 40
  { x: 7, y: 4 }, // 41
  { x: 7, y: 5 }, // 42
  { x: 7, y: 6 }, // 43
  { x: 6, y: 7 }, // 44: Turn left into left arm
  { x: 5, y: 7 }, // 45
  { x: 4, y: 7 }, // 46
  { x: 3, y: 7 }, // 47: Safe Zone (Star)
  { x: 2, y: 7 }, // 48
  { x: 1, y: 7 }, // 49
  { x: 1, y: 8 }, // 50: Turn down
  { x: 1, y: 9 }, // 51: Final square of outer loop
];

/**
 * Maps the specific 6 "Home Stretch" squares for each color (Positions 52-57).
 * Position 57 is the center home square.
 */
export const HOME_STRETCHES = {
  RED: [
    { x: 2, y: 8 },
    { x: 3, y: 8 },
    { x: 4, y: 8 },
    { x: 5, y: 8 },
    { x: 6, y: 8 },
    { x: 8, y: 8 },
  ],
  BLUE: [
    { x: 8, y: 14 },
    { x: 8, y: 13 },
    { x: 8, y: 12 },
    { x: 8, y: 11 },
    { x: 8, y: 10 },
    { x: 8, y: 8 },
  ],
  YELLOW: [
    { x: 14, y: 8 },
    { x: 13, y: 8 },
    { x: 12, y: 8 },
    { x: 11, y: 8 },
    { x: 10, y: 8 },
    { x: 8, y: 8 },
  ],
  GREEN: [
    { x: 8, y: 2 },
    { x: 8, y: 3 },
    { x: 8, y: 4 },
    { x: 8, y: 5 },
    { x: 8, y: 6 },
    { x: 8, y: 8 },
  ],
};

/**
 * Hardcoded grid positions for tokens sitting idle in their bases (Position -1).
 */
export const BASES = {
  RED: [
    { x: 3, y: 12 },
    { x: 4, y: 12 },
    { x: 3, y: 13 },
    { x: 4, y: 13 },
  ],
  BLUE: [
    { x: 12, y: 12 },
    { x: 13, y: 12 },
    { x: 12, y: 13 },
    { x: 13, y: 13 },
  ],
  YELLOW: [
    { x: 12, y: 3 },
    { x: 13, y: 3 },
    { x: 12, y: 4 },
    { x: 13, y: 4 },
  ],
  GREEN: [
    { x: 3, y: 3 },
    { x: 4, y: 3 },
    { x: 3, y: 4 },
    { x: 4, y: 4 },
  ],
};

/**
 * The offset required to map a player's local 0-51 path to the absolute board.
 */
const OFFSETS = { RED: 0, BLUE: 13, YELLOW: 26, GREEN: 39 };

/**
 * Core utility function to determine exactly where a token should be rendered on screen.
 * * @param {string} color - The player color ('RED', 'BLUE', etc.)
 * @param {number} localPosition - The token's backend position (-1 to 57)
 * @param {number} tokenIndex - The index (0-3) of the token (used to space them out in base)
 * @returns {Object} { x, y } coordinates for CSS Grid placement
 */
export const getGridPosition = (color, localPosition, tokenIndex) => {
  // 1. If in base
  if (localPosition === -1) {
    return BASES[color][tokenIndex];
  }

  // 2. If in home stretch (52-57)
  if (localPosition >= 52) {
    return HOME_STRETCHES[color][localPosition - 52];
  }

  // 3. Normal track
  const absolutePosition = (localPosition + OFFSETS[color]) % 52;
  return MAIN_TRACK[absolutePosition];
};
