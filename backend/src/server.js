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

// 1. INITIAL STATE FACTORY (Now initializes kill trackers per player color)
const createInitialState = () => ({
  maxPlayers: null,
  turn: null,
  diceValue: 0,
  diceRolled: false,
  activeColors: [],
  players: {
    RED: {
      hasKilled: false, // 🎯 Track rule requirement
      tokens: [
        { id: "R1", position: -1 },
        { id: "R2", position: -1 },
        { id: "R3", position: -1 },
        { id: "R4", position: -1 },
      ],
    },
    BLUE: {
      hasKilled: false, // 🎯 Track rule requirement
      tokens: [
        { id: "B1", position: -1 },
        { id: "B2", position: -1 },
        { id: "B3", position: -1 },
        { id: "B4", position: -1 },
      ],
    },
    YELLOW: {
      hasKilled: false, // 🎯 Track rule requirement
      tokens: [
        { id: "Y1", position: -1 },
        { id: "Y2", position: -1 },
        { id: "Y3", position: -1 },
        { id: "Y4", position: -1 },
      ],
    },
    GREEN: {
      hasKilled: false, // 🎯 Track rule requirement
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

// Helper: Master Rule Validation Engine
const isMoveValid = (playerColor, token, diceValue) => {
  // If token is in base, it strictly requires a 6 to deploy
  if (token.position === -1) {
    return diceValue === 6;
  }

  const newPosition = token.position + diceValue;

  // RULE 1 FIX: Exact Roll to enter the House Goal (Cannot overshoot position 57)
  if (newPosition > 57) {
    return false;
  }

  // RULE 2 FIX: Enforce "Kill Wall" before entering Home Stretch Safe Zone (Positions 52-57)
  if (token.position <= 51 && newPosition >= 52) {
    const hasMadeKill = gameState.players[playerColor].hasKilled;
    if (!hasMadeKill) {
      return false; // Blocks the move entirely if no opponent was crushed yet
    }
  }

  return true;
};

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
      token.position = 1;
      gameState.diceRolled = false; // Bonus turn for rolling a 6
      gameState.diceValue = 0;
      return;
    } else {
      return;
    }
  }

  // Double check rules safety wrap
  if (!isMoveValid(playerColor, token, gameState.diceValue)) {
    passTurn(playerColor);
    return;
  }

  // --------------------------------------------------------
  // 2. RUNNING MOVEMENT
  // --------------------------------------------------------
  token.position += gameState.diceValue;

  // --------------------------------------------------------
  // 3. COLLISION & KILL DETECTION (Grid Synced)
  // --------------------------------------------------------
  if (token.position >= 1 && token.position <= 51) {
    const getGlobalIndex = (color, relativePos) => {
      const offsets = { RED: 0, BLUE: 13, GREEN: 26, YELLOW: 39 };
      return (relativePos + offsets[color]) % 52;
    };

    const myGlobalIdx = getGlobalIndex(playerColor, token.position);
    const safeSquares = [1, 9, 14, 22, 27, 35, 40, 47];
    let killedEnemy = false;

    if (!safeSquares.includes(myGlobalIdx)) {
      Object.keys(gameState.players).forEach((enemyColor) => {
        if (enemyColor !== playerColor) {
          gameState.players[enemyColor].tokens.forEach((enemyToken) => {
            if (enemyToken.position >= 1 && enemyToken.position <= 51) {
              const enemyGlobalIdx = getGlobalIndex(
                enemyColor,
                enemyToken.position,
              );

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

    // Flip the flag on successful attack to unlock the player's safe zone access
    if (killedEnemy) {
      gameState.players[playerColor].hasKilled = true;
      gameState.diceRolled = false;
      gameState.diceValue = 0;
      return;
    }
  }

  // --------------------------------------------------------
  // 4. TURN ROTATION ENGINE
  // --------------------------------------------------------
  if (gameState.diceValue === 6 || token.position === 57) {
    gameState.diceRolled = false;
    gameState.diceValue = 0;
  } else {
    passTurn(playerColor);
  }
};

// 2. THE AUTOMATION ENGINE
const runAutomationCheck = (io, playerColor) => {
  const playerTokens = gameState.players[playerColor].tokens;

  // Sync auto-moves seamlessly with the master rules engine
  const validMoves = playerTokens.filter((token) =>
    isMoveValid(playerColor, token, gameState.diceValue),
  );

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
const handleConnection = (io, socket) => {
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

  socket.on("rollDice", ({ playerColor }) => {
    if (gameState.turn === playerColor && !gameState.diceRolled) {
      gameState.diceValue = Math.floor(Math.random() * 6) + 1;
      gameState.diceRolled = true;

      console.log(`🎲 ${playerColor} rolled a ${gameState.diceValue}`);
      io.emit("gameStateUpdate", gameState);
      runAutomationCheck(io, playerColor);
    }
  });

  // Manual Token Move (Cleaned up variable ordering crash completely)
  socket.on("moveToken", ({ playerColor, tokenId }) => {
    if (gameState.turn === playerColor && gameState.diceRolled) {
      const playerTokens = gameState.players[playerColor].tokens;
      const token = playerTokens.find((t) => t.id === tokenId);

      if (token) {
        // Enforce centralized validation rules check
        if (isMoveValid(playerColor, token, gameState.diceValue)) {
          executeMove(playerColor, token);
          io.emit("gameStateUpdate", gameState);
        } else {
          socket.emit(
            "moveRejected",
            "Action blocked: Rule violation or roll overshot safe zone boundary.",
          );
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
  handleConnection(io, socket);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Ludo Server running on port ${PORT}`);
});
