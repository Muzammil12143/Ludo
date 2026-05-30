// backend/src/ludoLogic.js

export function calculateSafeZoneMove(tokenCurrentSafeIndex, diceRoll) {
  const HOUSE_INDEX = 5;
  if (tokenCurrentSafeIndex + diceRoll === HOUSE_INDEX)
    return { valid: true, status: "GOAL", nextIndex: HOUSE_INDEX };
  if (tokenCurrentSafeIndex + diceRoll > HOUSE_INDEX)
    return {
      valid: false,
      status: "OVERSHOT",
      nextIndex: tokenCurrentSafeIndex,
    };
  return {
    valid: true,
    status: "MOVING",
    nextIndex: tokenCurrentSafeIndex + diceRoll,
  };
}
