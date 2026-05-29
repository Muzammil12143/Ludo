// frontend/src/components/Cell.jsx

import React from "react";

const Cell = ({ x, y }) => {
  // Helper to determine the color of the cell based on Ludo board layout
  const getCellClasses = () => {
    // 1. Home Bases (Corners)
    if (x <= 6 && y >= 10) return "bg-red-50 border-red-200 border";
    if (x >= 10 && y >= 10) return "bg-blue-50 border-blue-200 border";
    if (x <= 6 && y <= 6) return "bg-green-50 border-green-200 border";
    if (x >= 10 && y <= 6) return "bg-yellow-50 border-yellow-200 border";

    // 2. Center Home
    if (x >= 7 && x <= 9 && y >= 7 && y <= 9)
      return "bg-slate-800 border-slate-900 border";

    // 3. Colored Home Stretches
    if (y === 8 && x >= 2 && x <= 6) return "bg-red-400 border-red-500 border";
    if (x === 8 && y >= 10 && y <= 14)
      return "bg-blue-400 border-blue-500 border";
    if (y === 8 && x >= 10 && x <= 14)
      return "bg-yellow-400 border-yellow-500 border";
    if (x === 8 && y >= 2 && y <= 6)
      return "bg-green-400 border-green-500 border";

    // 4. Starting Squares
    if (x === 2 && y === 9) return "bg-red-400 border-red-500 border";
    if (x === 9 && y === 14) return "bg-blue-400 border-blue-500 border";
    if (x === 14 && y === 7) return "bg-yellow-400 border-yellow-500 border";
    if (x === 7 && y === 2) return "bg-green-400 border-green-500 border";

    // 5. Normal track paths (White squares with borders)
    if ((x >= 7 && x <= 9) || (y >= 7 && y <= 9)) {
      return "bg-white border-slate-300 border shadow-sm";
    }

    return "bg-transparent";
  };

  // Safe zones (Stars)
  const isSafeZone =
    (x === 7 && y === 13) ||
    (x === 13 && y === 9) ||
    (x === 9 && y === 3) ||
    (x === 3 && y === 7);

  return (
    <div
      className={`w-full h-full flex items-center justify-center ${getCellClasses()}`}
      style={{ gridColumn: x, gridRow: y }}
    >
      {isSafeZone && (
        <span className="text-slate-300 text-sm sm:text-xl">★</span>
      )}
    </div>
  );
};

export default Cell;
