// backend/src/server.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 1. INITIAL STATE FACTORY
const createInitialState = () => ({
  maxPlayers: null,
  turn: null,
  diceValue: 0,
  diceRolled: false,
  activeColors: [],
  players: {
    RED: {
      tokens: [
        { id: "R1", position: -1 },
        { id: "R2", position: -1 },
        { id: "R3", position: -1 },
        { id: "R4", position: -1 },
      ],
    },
    BLUE: {
      tokens: [
        { id: "B1", position: -1 },
        { id: "B2", position: -1 },
        { id: "B3", position: -1 },
        { id: "B4", position: -1 },
      ],
    },
    YELLOW: {
      tokens: [
        { id: "Y1", position: -1 },
        { id: "Y2", position: -1 },
        { id: "Y3", position: -1 },
        { id: "Y4", position: -1 },
      ],
    },
    GREEN: {
      tokens: [
        { id: "G1", position: -1 },
        { id: "G2", position: -1 },
        { id: "G3", position: -1 },
        { id: "G4", position: -1 },
      ],
    },
  },
});

let gameState = createInitialState();

// Helper: Pass the turn to the next player
const passTurn = (currentColor) => {
  const colors = gameState.activeColors;
  const currentIndex = colors.indexOf(currentColor);
  gameState.turn = colors[(currentIndex + 1) % colors.length];
  gameState.diceRolled = false;
  gameState.diceValue = 0;
};

// Helper: Execute a token movement
const executeMove = (playerColor, token) => {
  // --------------------------------------------------------
  // 1. MOVE OUT OF BASE (-1) TO START POSITION (1)
  // --------------------------------------------------------
  if (token.position === -1) {
    if (gameState.diceValue === 6) {
      // FIX: Changed from 0 to 1 to line up perfectly with your star grid coordinates
      token.position = 1;
      gameState.diceRolled = false; // Bonus turn for rolling a 6
      gameState.diceValue = 0;
      return;
    } else {
      return; // Can't move out without a 6
    }
  }

  // --------------------------------------------------------
  // 2. NORMAL TRACK MOVEMENT
  // --------------------------------------------------------
  let newPosition = token.position + gameState.diceValue;

  // Max track position before goal is 57
  if (newPosition > 57) {
    passTurn(playerColor);
    return;
  }

  token.position = newPosition;

  // --------------------------------------------------------
  // 3. COLLISION & KILL DETECTION (Grid Synced)
  // --------------------------------------------------------
  // Only check for kills if the token is on the shared outer track (positions 1 to 51)
  if (token.position >= 1 && token.position <= 51) {
    // Helper function to find the absolute board cell index (0 to 51)
    const getGlobalIndex = (color, relativePos) => {
      const offsets = { RED: 0, BLUE: 13, GREEN: 26, YELLOW: 39 };
      return (relativePos + offsets[color]) % 52;
    };

    const myGlobalIdx = getGlobalIndex(playerColor, token.position);

    // Accurate Safe Zone indices calculated from your custom board layout drawing
    const safeSquares = [1, 9, 14, 22, 27, 35, 40, 47];
    let killedEnemy = false;

    // Trigger hit detection only if we are NOT resting on a safe star zone
    if (!safeSquares.includes(myGlobalIdx)) {
      Object.keys(gameState.players).forEach((enemyColor) => {
        if (enemyColor !== playerColor) {
          gameState.players[enemyColor].tokens.forEach((enemyToken) => {
            // Check enemies currently moving on the shared track
            if (enemyToken.position >= 1 && enemyToken.position <= 51) {
              const enemyGlobalIdx = getGlobalIndex(
                enemyColor,
                enemyToken.position,
              );

              // If absolute coordinates occupy the same cell -> send them back to base (-1)
              if (myGlobalIdx === enemyGlobalIdx) {
                console.log(
                  `⚔️ KILL! ${playerColor} knocked out ${enemyColor}'s token at cell ${myGlobalIdx}!`,
                );
                enemyToken.position = -1;
                killedEnemy = true;
              }
            }
          });
        }
      });
    }

    // Classic Ludo rule: Get an extra turn if you crush an opponent
    if (killedEnemy) {
      gameState.diceRolled = false;
      gameState.diceValue = 0;
      return;
    }
  }

  // --------------------------------------------------------
  // 4. TURN ROTATION ENGINE
  // --------------------------------------------------------
  // Bonus turn awarded for rolling a 6 OR successfully reaching the home goal (57)
  if (gameState.diceValue === 6 || token.position === 57) {
    gameState.diceRolled = false;
    gameState.diceValue = 0;
  } else {
    passTurn(playerColor);
  }
};
// 2. THE AUTOMATION ENGINE (The Brain)
const runAutomationCheck = (io, playerColor) => {
  const playerTokens = gameState.players[playerColor].tokens;

  // Filter out which tokens are legally allowed to move right now
  const validMoves = playerTokens.filter((token) => {
    if (token.position === -1) {
      return gameState.diceValue === 6; // Needs a 6 to leave base
    }
    return token.position + gameState.diceValue <= 57; // Cannot overshoot the finish line
  });

  // SITUATION A: No moves possible -> Auto Skip
  if (validMoves.length === 0) {
    console.log(`⏩ No moves for ${playerColor}. Auto-skipping in 1.2s...`);
    setTimeout(() => {
      if (gameState.turn === playerColor && gameState.diceRolled) {
        passTurn(playerColor);
        io.emit("gameStateUpdate", gameState);
      }
    }, 1200);
  }

  // SITUATION B: Exactly 1 move possible -> Auto Move
  else if (validMoves.length === 1) {
    console.log(
      `🤖 Only 1 valid move for ${playerColor}. Auto-moving in 1.2s...`,
    );
    setTimeout(() => {
      if (gameState.turn === playerColor && gameState.diceRolled) {
        executeMove(playerColor, validMoves[0]);
        io.emit("gameStateUpdate", gameState);
      }
    }, 1200);
  }

  // SITUATION C: Multiple options -> Wait for user to click
  else {
    console.log(
      `⏳ ${playerColor} has ${validMoves.length} options. Waiting for player click...`,
    );
  }
};

// 3. SOCKET LISTENERS
const handleConnection = (io, socket, stateRef) => {
  socket.emit("gameStateUpdate", gameState);

  socket.on("setupGame", ({ playerCount }) => {
    gameState = createInitialState();
    gameState.maxPlayers = playerCount;

    if (playerCount === 2) gameState.activeColors = ["RED", "YELLOW"];
    else if (playerCount === 3)
      gameState.activeColors = ["RED", "BLUE", "YELLOW"];
    else gameState.activeColors = ["RED", "BLUE", "YELLOW", "GREEN"];

    gameState.turn = gameState.activeColors[0];
    io.emit("gameStateUpdate", gameState);
  });

  // Roll Dice Trigger
  socket.on("rollDice", ({ playerColor }) => {
    if (gameState.turn === playerColor && !gameState.diceRolled) {
      gameState.diceValue = Math.floor(Math.random() * 6) + 1;
      gameState.diceRolled = true;

      console.log(`🎲 ${playerColor} rolled a ${gameState.diceValue}`);

      // Update UI immediately so everyone sees the dice spin
      io.emit("gameStateUpdate", gameState);

      // Trigger the automation engine to see if we need to auto-move or skip
      runAutomationCheck(io, playerColor);
    }
  });

  // Manual Token Move (For when Situation C happens)
  socket.on("moveToken", ({ playerColor, tokenId }) => {
    if (gameState.turn === playerColor && gameState.diceRolled) {
      const playerTokens = gameState.players[playerColor].tokens;
      const token = playerTokens.find((t) => t.id === tokenId);

      if (token) {
        // Double check that the user didn't try to click an illegal move
        const isValidMove =
          (token.position === -1 && gameState.diceValue === 6) ||
          (token.position > -1 && token.position + gameState.diceValue <= 57);

        if (isValidMove) {
          executeMove(playerColor, token);
          io.emit("gameStateUpdate", gameState);
        }
      }
    }
  });

  socket.on("resetGame", () => {
    gameState = createInitialState();
    io.emit("gameStateUpdate", gameState);
  });
};

io.on("connection", (socket) => {
  handleConnection(io, socket, gameState);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Ludo Server running on http://localhost:${PORT}`);
});
