// frontend/src/components/Token.jsx

import React from "react";
import { motion } from "framer-motion";
import { getGridPosition } from "../utils/gridMapping"; // Adjust path if needed

const Token = ({ color, localPosition, tokenIndex, onClick, isPlayable }) => {
  // Get exactly which column and row this token belongs in
  const { x, y } = getGridPosition(color, localPosition, tokenIndex);

  const colorStyles = {
    RED: "bg-red-600 border-red-900",
    BLUE: "bg-blue-600 border-blue-900",
    YELLOW: "bg-yellow-400 border-yellow-600",
    GREEN: "bg-green-600 border-green-900",
  };

  // If multiple tokens are on the same space, offset them slightly so they don't hide each other
  const overlapOffset = localPosition !== -1 ? `${tokenIndex * 4}px` : "0px";

  return (
    <motion.div
      layout
      onClick={onClick}
      className={`
        relative w-[60%] h-[60%] sm:w-[70%] sm:h-[70%] rounded-full shadow-lg border-2 z-10
        ${colorStyles[color]}
        ${isPlayable ? "cursor-pointer hover:scale-110 hover:shadow-xl ring-2 ring-white animate-pulse" : "cursor-default"}
      `}
      style={{
        gridColumnStart: x,
        gridRowStart: y,
        placeSelf: "center", // Centers it perfectly inside its grid cell
        marginLeft: overlapOffset,
        marginTop: overlapOffset,
      }}
      // Framer Motion spring physics for smooth, bouncy movement
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    />
  );
};

export default Token;
