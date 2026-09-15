import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { registerSocketHandlers } from "./socket/socketHandler.js";


const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

registerSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});