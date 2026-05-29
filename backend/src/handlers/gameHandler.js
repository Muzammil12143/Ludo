// backend/src/handlers/gameHandler.js

const gameEngine = require("../game/gameEngine");

const registerGameEvents = (io, socket, gameState) => {
  // 1. Handle Dice Rolls
  socket.on("rollDice", ({ playerColor }) => {
    console.log(`🎲 ${playerColor} is rolling the dice...`);

    const result = gameEngine.rollDice(gameState, playerColor);

    if (result.success) {
      // Valid roll: Broadcast the updated board to ALL connected players
      io.emit("gameStateUpdate", result.state);
    } else {
      // Invalid roll (not their turn, already rolled): Warn ONLY this player
      socket.emit("moveRejected", result.message);
    }
  });

  // 2. Handle Token Moves
  socket.on("moveToken", ({ playerColor, tokenId }) => {
    console.log(`♟️ ${playerColor} wants to move token ${tokenId}...`);

    const result = gameEngine.moveToken(gameState, playerColor, tokenId);

    if (result.success) {
      // Valid move: Broadcast the new board state to ALL players
      io.emit("gameStateUpdate", result.state);
    } else {
      // INVALID MOVE (e.g., They haven't killed anyone yet!): Warn ONLY this player
      socket.emit("moveRejected", result.message);
    }
  });

  // 3. Handle Game Reset (Great for testing/debugging)
  socket.on("resetGame", () => {
    console.log("🔄 Game resetting...");

    // Create a fresh state and overwrite the existing one
    const newState = gameEngine.createInitialGameState();
    Object.assign(gameState, newState);

    // Send the fresh board to everyone
    io.emit("gameStateUpdate", gameState);
  });
};

module.exports = { registerGameEvents };
