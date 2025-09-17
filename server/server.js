const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { addSSHJob } = require("./queue/redisQueue");
const { setIO } = require("./utils/sessionManager");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

setIO(io);

// Socket handlers
io.on("connection", (socket) => registerSocketHandlers(socket));

// Start Redis subscriber
subscribeOutputs();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Backend running on ${PORT}`));
