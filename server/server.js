const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { addSSHJob } = require("./queue/redisQueue");
const { setIO } = require("./utils/sessionManager");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

setIO(io);

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // New SSH session
  socket.on("ssh-connect", ({ sessionId, cols, rows, term }) => {
    addSSHJob({ socketId: socket.id, sessionId, cols, rows, term });
  });

  // Handle user input
  socket.on("ssh-input", ({ sessionId, input }) => {
    io.to(sessionId).emit("ssh-input-forward", { input });
  });

  // Handle resize
  socket.on("ssh-resize", ({ sessionId, cols, rows }) => {
    io.to(sessionId).emit("ssh-resize-forward", { cols, rows });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Backend running on ${PORT}`));
