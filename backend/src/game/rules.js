// backend/src/game/rules.js

/**
 * Standard Ludo Safe Zones (Star marks) - Absolute board positions
 * Tokens on these squares cannot be captured by opponents.
 */
const SAFE_ZONES = [0, 8, 13, 21, 26, 34, 39, 47];

/**
 * RULE 1: Leaving the Base
 * A player must roll a 6 to move a token out of the base (-1).
 */
const canLeaveBase = (currentPosition, diceRoll) => {
  if (currentPosition === -1) {
    return diceRoll === 6;
  }
  return true; // Token is already out of the base
};

/**
 * RULE 2: THE CUSTOM HOUSE-ENTRY RULE
 * A player CANNOT enter the home stretch (positions 52-57) unless they have
 * captured at least one opponent's token.
 */
const canEnterHouse = (projectedPosition, hasKilled) => {
  if (projectedPosition >= 52) {
    return hasKilled === true;
  }
  return true; // Not trying to enter the house yet, move is valid
};

/**
 * RULE 3: Exact Roll for the Center
 * A player must roll the exact number to land on the center square (57).
 * They cannot bounce off or overshoot it.
 */
const isValidCenterMove = (projectedPosition) => {
  return projectedPosition <= 57;
};

/**
 * RULE 4: Safe Zone Check
 * Checks if a specific absolute position is protected.
 */
const isSafeZone = (absolutePosition) => {
  return SAFE_ZONES.includes(absolutePosition);
};

module.exports = {
  canLeaveBase,
  canEnterHouse,
  isValidCenterMove,
  isSafeZone,
  SAFE_ZONES,
};
