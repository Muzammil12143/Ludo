// backend/src/game/gameEngine.js

// Standard Ludo Safe Zones (Star marks) - Absolute board positions
const SAFE_ZONES = [0, 8, 13, 21, 26, 34, 39, 47];

// Offsets to convert a player's local 0-51 path to the shared 0-51 board path
const OFFSETS = { RED: 0, BLUE: 13, YELLOW: 26, GREEN: 39 };

/**
 * Initializes a brand new game state
 */
const createInitialGameState = () => {
  return {
    turn: "RED",
    diceValue: 0,
    diceRolled: false,
    players: {
      RED: createPlayer("RED"),
      BLUE: createPlayer("BLUE"),
      YELLOW: createPlayer("YELLOW"),
      GREEN: createPlayer("GREEN"),
    },
  };
};

/**
 * Creates a player object with the custom `hasKilled` rule flag
 */
const createPlayer = (color) => ({
  hasKilled: false, // Core custom rule flag
  tokens: [
    { id: `${color[0]}1`, position: -1 }, // -1 means inside the home base
    { id: `${color[0]}2`, position: -1 },
    { id: `${color[0]}3`, position: -1 },
    { id: `${color[0]}4`, position: -1 },
  ],
});

/**
 * Handles a player rolling the dice
 */
const rollDice = (gameState, playerColor) => {
  if (gameState.turn !== playerColor) {
    return { success: false, message: "It is not your turn!" };
  }
  if (gameState.diceRolled) {
    return {
      success: false,
      message: "You already rolled the dice. Move a token.",
    };
  }

  const roll = Math.floor(Math.random() * 6) + 1;
  gameState.diceValue = roll;
  gameState.diceRolled = true;

  // Note: You can add logic here to auto-skip turn if the player rolled
  // anything other than a 6 and all their tokens are stuck in the base (-1).

  return { success: true, roll, state: gameState };
};

/**
 * Handles validating and executing a token move
 */
const moveToken = (gameState, playerColor, tokenId) => {
  if (gameState.turn !== playerColor || !gameState.diceRolled) {
    return {
      success: false,
      message: "Not your turn, or you need to roll first.",
    };
  }

  const player = gameState.players[playerColor];
  const token = player.tokens.find((t) => t.id === tokenId);
  const roll = gameState.diceValue;

  // 1. Moving out of the base
  if (token.position === -1) {
    if (roll === 6) {
      token.position = 0; // Move to starting square
      gameState.diceRolled = false; // Gets another turn for rolling a 6
      return { success: true, state: gameState };
    }
    return {
      success: false,
      message: "You need a 6 to take a token out of the base.",
    };
  }

  const projectedPosition = token.position + roll;

  // 2. ENFORCING YOUR CUSTOM RULE (House Entry Validation)
  // Local positions 52-57 are the "Home Stretch" towards the center
  if (projectedPosition >= 52) {
    if (!player.hasKilled) {
      return {
        success: false,
        message:
          "RULE: You must capture an opponent's token before entering the house!",
      };
    }
    if (projectedPosition > 57) {
      return {
        success: false,
        message: "You need the exact dice roll to enter the center space.",
      };
    }
  }

  // 3. Execute the move
  token.position = projectedPosition;

  // 4. Check for captures (kills)
  const captureHappened = checkForCaptures(gameState, playerColor, token);

  // 5. Turn switching logic
  // A player gets a bonus turn if they roll a 6 OR if they capture an opponent
  if (roll === 6 || captureHappened) {
    gameState.diceRolled = false; // Reset dice for extra turn
  } else {
    passTurn(gameState); // Pass to next player
  }

  return { success: true, state: gameState };
};

/**
 * Checks if the moved token lands on an opponent and captures them
 */
const checkForCaptures = (gameState, movingPlayerColor, movedToken) => {
  if (movedToken.position >= 52) return false; // No capturing inside the home stretch

  const absolutePos = (movedToken.position + OFFSETS[movingPlayerColor]) % 52;

  // Safe zones protect tokens from being captured
  if (SAFE_ZONES.includes(absolutePos)) return false;

  let captured = false;

  // Iterate through all other players to check for collisions
  for (const [color, opponent] of Object.entries(gameState.players)) {
    if (color === movingPlayerColor) continue;

    for (let oppToken of opponent.tokens) {
      if (oppToken.position !== -1 && oppToken.position < 52) {
        const oppAbsolutePos = (oppToken.position + OFFSETS[color]) % 52;

        // Collision detected!
        if (absolutePos === oppAbsolutePos) {
          oppToken.position = -1; // Send opponent back to base

          // UNLOCK THE HOUSE FOR THE CURRENT PLAYER
          gameState.players[movingPlayerColor].hasKilled = true;

          captured = true;
        }
      }
    }
  }
  return captured;
};

//**
//  * Passes the turn to the next player
//  *??/
const passTurn = (gameState) => {
  const turns = ["RED", "BLUE", "YELLOW", "GREEN"];
  const currentIndex = turns.indexOf(gameState.turn);

  gameState.turn = turns[(currentIndex + 1) % 4];
  gameState.diceRolled = false;
  gameState.diceValue = 0;
};

// ONLY EXPORT THESE THREE THINGS!
module.exports = {
  createInitialGameState,
  rollDice,
  moveToken,
};
