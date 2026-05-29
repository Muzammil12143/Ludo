// frontend/src/components/Dice.jsx

import React from "react";

const Dice = ({ turn, myColor, diceValue, diceRolled, onRoll }) => {
  const isMyTurn = turn === myColor;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-md border border-slate-200">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
        Current Turn:{" "}
        <span className={`text-${turn.toLowerCase()}-600`}>{turn}</span>
      </h3>

      <button
        onClick={onRoll}
        disabled={!isMyTurn || diceRolled}
        className={`
          w-20 h-20 flex items-center justify-center text-4xl font-black rounded-2xl shadow-inner transition-all
          ${
            isMyTurn && !diceRolled
              ? "bg-indigo-600 text-white hover:bg-indigo-500 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }
        `}
      >
        {diceValue > 0 ? diceValue : "🎲"}
      </button>

      {isMyTurn && diceRolled && (
        <p className="text-xs text-green-600 font-bold mt-3 animate-pulse">
          Select a token to move!
        </p>
      )}
    </div>
  );
};

export default Dice;
