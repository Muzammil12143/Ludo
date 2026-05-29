// frontend/src/App.jsx

import React, { useState } from "react";
import { useSocket } from "./context/SocketContext";
import Board from "./components/Board";

function App() {
  const { socket, gameState, isConnected } = useSocket();
  const [myColor, setMyColor] = useState(null);

  // 1. CONNECTION WAITING STATE
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <h1 className="text-2xl font-bold text-slate-500 animate-pulse">
          🔌 Connecting to Ludo Server...
        </h1>
      </div>
    );
  }

  // 2. HOME STAGE: Choose Player Count (If server hasn't been set up yet)
  if (!gameState || !gameState.maxPlayers) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 gap-8 p-4 text-center">
        <div>
          <h1 className="text-7xl font-black text-slate-800 tracking-tighter mb-2">
            LUDO
          </h1>
          <p className="text-xl font-medium text-slate-500">
            Real-time Custom Match Setup
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full flex flex-col gap-4 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-700">
            Select Number of Players:
          </h2>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                onClick={() => socket.emit("setupGame", { playerCount: count })}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-2xl py-4 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5"
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. SEAT SELECTION STAGE: Pick an allocated color slot
  if (!myColor) {
    const colorClasses = {
      RED: "bg-red-500 hover:bg-red-600",
      BLUE: "bg-blue-500 hover:bg-blue-600",
      YELLOW: "bg-yellow-400 hover:bg-yellow-500 text-slate-900",
      GREEN: "bg-green-500 hover:bg-green-600",
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 gap-6 p-4 text-center">
        <div>
          <h1 className="text-5xl font-black text-slate-800 tracking-tight">
            Game Lobby
          </h1>
          <p className="text-md font-bold text-indigo-600 uppercase tracking-widest mt-1">
            Mode: {gameState.maxPlayers} Players Active
          </p>
        </div>

        <h2 className="text-lg font-bold text-slate-600 mt-4">
          Pick your seat assignment color:
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
          {gameState.activeColors.map((color) => (
            <button
              key={color}
              onClick={() => setMyColor(color)}
              className={`
                py-6 px-8 rounded-2xl shadow-md text-white font-black text-xl 
                transition-all transform hover:scale-[1.02] hover:shadow-lg
                ${colorClasses[color]}
              `}
            >
              Play as {color}
            </button>
          ))}
        </div>

        <button
          onClick={() => socket.emit("resetGame")}
          className="mt-6 text-sm font-semibold text-slate-400 hover:text-slate-600 underline transition-colors"
        >
          Change Player Count
        </button>
      </div>
    );
  }

  // 4. THE LIVE ACTIVE GAMEPLAY
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 relative">
      {/* Top Header Indicators */}
      <div className="absolute top-4 left-4 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Live Match ({gameState.maxPlayers}P)
          </span>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          Playing as:{" "}
          <strong style={{ color: myColor.toLowerCase() }}>{myColor}</strong>
        </span>
      </div>

      {/* Leave/Reset configuration option */}
      <button
        onClick={() => {
          setMyColor(null);
          socket.emit("resetGame");
        }}
        className="absolute top-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors shadow-md"
      >
        ⚙️ Exit Setup
      </button>

      {/* Game Board Surface */}
      <Board gameState={gameState} myColor={myColor} socket={socket} />
    </div>
  );
}

export default App;
