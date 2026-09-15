import { io, Socket } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

// Create one persistent Socket.IO connection
export const socket: Socket = io(SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,


  
});

socket.on("connect", () => {
  console.log("✅ Connected to Render:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection failed:", error.message);
});
