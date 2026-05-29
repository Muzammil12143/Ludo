// frontend/src/context/SocketContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// 1. Create the Context
const SocketContext = createContext();

// Use Vite's environment variable or fallback to localhost
const SOCKET_URL =
  import.meta.env.VITE_BACKEND_URL || "https://ludo-backend-djsy.onrender.com";

// 2. Create the Provider Component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize the socket connection
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // --- SOCKET EVENT LISTENERS ---

    newSocket.on("connect", () => {
      console.log("🟢 Connected to Ludo server:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("🔴 Disconnected from Ludo server");
      setIsConnected(false);
    });

    // The most important event: Updating the board!
    newSocket.on("gameStateUpdate", (newState) => {
      setGameState(newState);
    });

    // Handle our custom house-rule rejections
    newSocket.on("moveRejected", (message) => {
      // For a production app, you'd use a nice Toast notification (like react-toastify).
      // For now, an alert makes sure you see the rule enforcement in action.
      alert(`⚠️ ${message}`);
    });

    // Cleanup the connection when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // 3. Provide the state to the rest of the app
  return (
    <SocketContext.Provider value={{ socket, gameState, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

// 4. Create a custom hook for easy importing
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
