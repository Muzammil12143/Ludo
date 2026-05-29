// frontend/src/hooks/useGameState.js

import { useSocket } from "../context/SocketContext";

export const useGameState = (myColor) => {
  // Pull the raw data from our Socket Context
  const { socket, gameState, isConnected } = useSocket();

  // --- 1. DERIVED STATE ---
  // We calculate these boolean flags here so our UI components stay incredibly clean.

  // Is the game engine loaded and running?
  const isGameActive = !!gameState;

  // Is it this specific player's turn?
  const isMyTurn = isGameActive && gameState.turn === myColor;

  // Can this player currently click the dice?
  const canRollDice = isMyTurn && !gameState.diceRolled;

  // Does this player need to pick a token to move?
  const mustMoveToken = isMyTurn && gameState.diceRolled;

  // The current number on the dice
  const diceValue = isGameActive ? gameState.diceValue : 0;

  // --- 2. ACTION HELPERS ---
  // These functions wrap the socket emissions so components like <Board />
  // just have to call moveToken('R1') instead of worrying about sockets.

  const rollDice = () => {
    if (canRollDice && socket) {
      socket.emit("rollDice", { playerColor: myColor });
    }
  };

  const moveToken = (tokenId) => {
    if (mustMoveToken && socket) {
      socket.emit("moveToken", { playerColor: myColor, tokenId });
    }
  };

  const resetServerGame = () => {
    if (socket) {
      socket.emit("resetGame");
    }
  };

  // --- 3. RETURN OBJECT ---
  return {
    // Raw Data
    gameState,
    isConnected,
    socket,

    // Computed Booleans
    isGameActive,
    isMyTurn,
    canRollDice,
    mustMoveToken,
    diceValue,

    // Actions
    rollDice,
    moveToken,
    resetServerGame,
  };
};
