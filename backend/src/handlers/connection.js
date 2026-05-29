// backend/src/handlers/gameHandler.js

const gameEngine = require("../game/gameEngine");

const registerGameEvents = (io, socket, gameState) => {
  // 1. Handle Dice Rolls
  socket.on("rollDice", ({ playerColor }) => {
    console.log(`🎲 ${playerColor} is rolling the dice...`);

    const result = gameEngine.rollDice(gameState, playerColor);

    if (result.success) {
      // Valid roll: Broadcast new state to ALL connected players
      io.emit("gameStateUpdate", result.state);
    } else {
      // Invalid (not their turn, etc.): Warn ONLY the player who clicked
      socket.emit("moveRejected", result.message);
    }
  });

  // 2. Handle Token Moves
  socket.on("moveToken", ({ playerColor, tokenId }) => {
    console.log(`♟️ ${playerColor} wants to move token ${tokenId}...`);

    const result = gameEngine.moveToken(gameState, playerColor, tokenId);

    if (result.success) {
      // Valid move: Broadcast new state to ALL connected players
      io.emit("gameStateUpdate", result.state);
    } else {
      // INVALID (Custom rule blocked them!): Warn ONLY this player
      socket.emit("moveRejected", result.message);
    }
  });

  // 3. Handle Debug/Restart
  socket.on("resetGame", () => {
    console.log("🔄 Game resetting...");
    // Reset the reference properties to start fresh
    const newState = gameEngine.createInitialGameState();
    Object.assign(gameState, newState);
    io.emit("gameStateUpdate", gameState);
  });
};

module.exports = { registerGameEvents };
