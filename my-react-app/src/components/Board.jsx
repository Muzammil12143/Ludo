import React from "react";

const COLORS = {
  blue: "#0081F0",
  green: "#39B200",
  red: "#F7000B",
  yellow: "#FFC400",
  grey: "#C4C4C4",
};

// --- SVG Icons ---
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-3/5 h-3/5 drop-shadow-sm">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ChevronIcon = ({ color, rotation }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-3/5 h-3/5 ${rotation}`}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// --- 100% ACCURATE GRID MAPPER FOR TRACK AND HOME CELLS ---
const globalTrackMap = {
  0: ["bottom", 15],
  1: ["bottom", 12],
  2: ["bottom", 9],
  3: ["bottom", 6],
  4: ["bottom", 3],
  5: ["bottom", 0],
  6: ["left", 17],
  7: ["left", 16],
  8: ["left", 15],
  9: ["left", 14],
  10: ["left", 13],
  11: ["left", 12],
  12: ["left", 6],
  13: ["left", 0],
  14: ["left", 1],
  15: ["left", 2],
  16: ["left", 3],
  17: ["left", 4],
  18: ["left", 5],
  19: ["top", 15],
  20: ["top", 12],
  21: ["top", 9],
  22: ["top", 6],
  23: ["top", 3],
  24: ["top", 0],
  25: ["top", 1],
  26: ["top", 2],
  27: ["top", 5],
  28: ["top", 8],
  29: ["top", 11],
  30: ["top", 14],
  31: ["top", 17],
  32: ["right", 0],
  33: ["right", 1],
  34: ["right", 2],
  35: ["right", 3],
  36: ["right", 4],
  37: ["right", 5],
  38: ["right", 11],
  39: ["right", 17],
  40: ["right", 16],
  41: ["right", 15],
  42: ["right", 14],
  43: ["right", 13],
  44: ["right", 12],
  45: ["bottom", 2],
  46: ["bottom", 5],
  47: ["bottom", 8],
  48: ["bottom", 11],
  49: ["bottom", 14],
  50: ["bottom", 17],
  51: ["bottom", 16],
};

const homePathMap = {
  RED: {
    0: ["bottom", 13],
    1: ["bottom", 10],
    2: ["bottom", 7],
    3: ["bottom", 4],
    4: ["bottom", 1],
  },
  BLUE: {
    0: ["left", 7],
    1: ["left", 8],
    2: ["left", 9],
    3: ["left", 10],
    4: ["left", 11],
  },
  GREEN: {
    0: ["top", 4],
    1: ["top", 7],
    2: ["top", 10],
    3: ["top", 13],
    4: ["top", 16],
  },
  YELLOW: {
    0: ["right", 10],
    1: ["right", 9],
    2: ["right", 8],
    3: ["right", 7],
    4: ["right", 6],
  },
};

const Board = ({ gameState, myColor, socket }) => {
  // Group all active tokens by their map coordinate cells
  const tokensByCell = {};
  if (gameState && gameState.players) {
    Object.keys(gameState.players).forEach((color) => {
      gameState.players[color].tokens.forEach((token, index) => {
        let cellKey = "";
        if (token.position === -1) {
          cellKey = `base_${color}_${index}`;
        } else if (token.position === 57) {
          cellKey = `center_${color}`;
        } else if (token.position >= 52 && token.position <= 56) {
          cellKey = `homePath_${color}_${token.position - 52}`;
        } else {
          const offsets = { RED: 0, BLUE: 13, GREEN: 26, YELLOW: 39 };
          const globalIdx = (token.position + offsets[color]) % 52;
          cellKey = `track_${globalIdx}`;
        }
        if (!tokensByCell[cellKey]) tokensByCell[cellKey] = [];
        tokensByCell[cellKey].push({ ...token, color });
      });
    });
  }

  // Render Token Component inside grids safely
  const renderTokens = (cellKey) => {
    const tokens = tokensByCell[cellKey] || [];
    if (tokens.length === 0) return null;

    return (
      <div className="absolute inset-0 flex items-center justify-center gap-0.5 p-0.5 z-10">
        {tokens.map((token) => {
          const isClickable =
            gameState.turn === myColor &&
            gameState.diceRolled &&
            token.color === myColor;

          const tokenColors = {
            RED: "bg-red-600 border-red-800 text-white",
            BLUE: "bg-blue-600 border-blue-800 text-white",
            YELLOW: "bg-yellow-500 border-yellow-700 text-slate-900",
            GREEN: "bg-green-600 border-green-800 text-white",
          };

          return (
            <button
              key={token.id}
              onClick={() =>
                isClickable &&
                socket.emit("moveToken", {
                  playerColor: myColor,
                  tokenId: token.id,
                })
              }
              disabled={!isClickable}
              className={`
                w-full h-full max-w-[28px] max-h-[28px] rounded-full border shadow-md flex items-center justify-center font-black text-[10px] sm:text-xs
                transition-all transform active:scale-90 relative
                ${tokenColors[token.color]}
                ${isClickable ? "animate-bounce cursor-pointer ring-2 ring-white scale-110 z-20" : "cursor-not-allowed"}
              `}
            >
              <div className="absolute top-0.5 left-0.5 w-1/4 h-1/4 bg-white opacity-50 rounded-full"></div>
              {token.id.slice(1)}
            </button>
          );
        })}
      </div>
    );
  };

  // Reusable Base Panel Layout
  const PlayerBase = ({ color, cornerRadius }) => (
    <div
      className={`w-[40%] p-3 sm:p-6 flex items-center justify-center border border-gray-400 ${cornerRadius}`}
      style={{ backgroundColor: COLORS[color.toLowerCase()] }}
    >
      <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center shadow-inner p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full h-full aspect-square max-w-[140px]">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-full shadow-[inset_0_-3px_5px_rgba(0,0,0,0.3)] border border-gray-200 relative flex items-center justify-center aspect-square"
              style={{ backgroundColor: COLORS[color.toLowerCase()] }}
            >
              <div className="absolute top-1 right-1 w-1/3 h-1/3 bg-white opacity-30 rounded-full"></div>
              {renderTokens(`base_${color}_${i}`)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Modular helper to generate dynamic cell content
  const generateTrackCells = (armName, count, configFunc) => {
    return Array.from({ length: count }).map((_, i) => {
      const cellProps = configFunc(i);

      // Calculate dynamic automation key binding
      const trackEntry = Object.entries(globalTrackMap).find(
        ([_, [arm, cIdx]]) => arm === armName && cIdx === i,
      );
      const homeEntry = Object.entries(
        homePathMap[armName.toUpperCase()] || {},
      ).find(([_, [arm, cIdx]]) => arm === armName && cIdx === i);

      let cellKey = "";
      if (trackEntry) cellKey = `track_${trackEntry[0]}`;
      if (homeEntry)
        cellKey = `homePath_${armName.toUpperCase()}_${homeEntry[0]}`;

      return (
        <div
          key={i}
          className="flex items-center justify-center relative border-[0.5px] border-gray-300 bg-white"
          style={{
            backgroundColor: cellProps.bg !== "white" ? cellProps.bg : "white",
          }}
        >
          {cellProps.content}
          {renderTokens(cellKey)}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full">
      {/* OUTER BOARD HOUSING AS SEEN IN lodu.png */}
      <div className="w-full max-w-[540px] aspect-square bg-gray-400 border-[8px] sm:border-[12px] border-white shadow-2xl rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden flex flex-col select-none">
        {/* ================= TOP ARM LAYER ================= */}
        <div className="flex w-full h-[40%]">
          <PlayerBase color="BLUE" cornerRadius="rounded-tl-xl" />

          <div className="w-[20%] grid grid-cols-3 grid-rows-6 bg-gray-400">
            {generateTrackCells("top", 18, (i) => {
              if (i === 1)
                return {
                  content: (
                    <ChevronIcon color={COLORS.green} rotation="rotate-90" />
                  ),
                  bg: "white",
                };
              if ([4, 7, 10, 13, 16].includes(i)) return { bg: COLORS.green };
              if (i === 5) return { bg: COLORS.green, content: <StarIcon /> };
              if (i === 6) return { bg: COLORS.grey, content: <StarIcon /> };
              return { bg: "white" };
            })}
          </div>

          <PlayerBase color="GREEN" cornerRadius="rounded-tr-xl" />
        </div>

        {/* ================= MIDDLE HORIZONTAL LAYER ================= */}
        <div className="flex w-full h-[20%]">
          {/* Left Track (Blue) */}
          <div className="w-[40%] grid grid-cols-6 grid-rows-3 bg-gray-400">
            {generateTrackCells("left", 18, (i) => {
              if (i === 1) return { bg: COLORS.blue, content: <StarIcon /> };
              if (i === 6)
                return {
                  content: (
                    <ChevronIcon color={COLORS.blue} rotation="rotate-0" />
                  ),
                  bg: "white",
                };
              if ([7, 8, 9, 10, 11].includes(i)) return { bg: COLORS.blue };
              if (i === 14) return { bg: COLORS.grey, content: <StarIcon /> };
              return { bg: "white" };
            })}
          </div>

          {/* Center Home Cross (Clip-path technique maps tokens dynamically inside vectors) */}
          <div className="w-[20%] relative overflow-hidden bg-white">
            <div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 50%)",
                backgroundColor: COLORS.green,
              }}
            >
              {renderTokens("center_GREEN")}
            </div>
            <div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(100% 0, 100% 100%, 50% 50%)",
                backgroundColor: COLORS.yellow,
              }}
            >
              {renderTokens("center_YELLOW")}
            </div>
            <div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(0 100%, 100% 100%, 50% 50%)",
                backgroundColor: COLORS.red,
              }}
            >
              {renderTokens("center_RED")}
            </div>
            <div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(0 0, 0 100%, 50% 50%)",
                backgroundColor: COLORS.blue,
              }}
            >
              {renderTokens("center_BLUE")}
            </div>
          </div>

          {/* Right Track (Yellow) */}
          <div className="w-[40%] grid grid-cols-6 grid-rows-3 bg-gray-400">
            {generateTrackCells("right", 18, (i) => {
              if (i === 4) return { bg: COLORS.grey, content: <StarIcon /> };
              if ([6, 7, 8, 9, 10].includes(i)) return { bg: COLORS.yellow };
              if (i === 11)
                return {
                  content: (
                    <ChevronIcon color={COLORS.yellow} rotation="rotate-180" />
                  ),
                  bg: "white",
                };
              if (i === 16) return { bg: COLORS.yellow, content: <StarIcon /> };
              return { bg: "white" };
            })}
          </div>
        </div>

        {/* ================= BOTTOM ARM LAYER ================= */}
        <div className="flex w-full h-[40%]">
          <PlayerBase color="RED" cornerRadius="rounded-bl-xl" />

          <div className="w-[20%] grid grid-cols-3 grid-rows-6 bg-gray-400">
            {generateTrackCells("bottom", 18, (i) => {
              if ([1, 4, 7, 10, 13].includes(i)) return { bg: COLORS.red };
              if (i === 8) return { bg: COLORS.grey, content: <StarIcon /> };
              if (i === 12) return { bg: COLORS.red, content: <StarIcon /> };
              if (i === 16)
                return {
                  content: (
                    <ChevronIcon color={COLORS.red} rotation="-rotate-90" />
                  ),
                  bg: "white",
                };
              return { bg: "white" };
            })}
          </div>

          <PlayerBase color="YELLOW" cornerRadius="rounded-br-xl" />
        </div>
      </div>

      {/* ================= BOTTOM CONTROLLER PANEL (THE DICE & PLAYER TURN BOARD) ================= */}
      <div className="w-full max-w-[540px] bg-white rounded-2xl shadow-xl p-4 border border-slate-200 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Current Turn
          </span>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: COLORS[gameState.turn.toLowerCase()] }}
            ></span>
            <span className="font-black text-slate-800 text-lg">
              {gameState.turn === myColor
                ? "YOUR TURN"
                : `${gameState.turn}'s Turn`}
            </span>
          </div>
        </div>

        {/* DICE ACTION SURFACE */}
        <div className="flex items-center gap-4">
          {gameState.diceValue > 0 && (
            <div className="w-12 h-12 bg-slate-100 rounded-xl border-2 border-slate-300 flex items-center justify-center font-black text-2xl text-slate-700 shadow-md animate-fade-in animate-none">
              {gameState.diceValue}
            </div>
          )}

          <button
            disabled={gameState.turn !== myColor || gameState.diceRolled}
            onClick={() => socket.emit("rollDice", { playerColor: myColor })}
            className={`
              px-6 py-3 rounded-xl text-white font-black tracking-wide shadow-md transition-all transform active:scale-95
              ${
                gameState.turn === myColor && !gameState.diceRolled
                  ? "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 cursor-pointer ring-4 ring-indigo-100 animate-pulse"
                  : "bg-slate-300 cursor-not-allowed opacity-60"
              }
            `}
          >
            ROLL DICE
          </button>
        </div>
      </div>
    </div>
  );
};

export default Board;
