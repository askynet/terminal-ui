require('dotenv').config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { startSSHWorkers } = require('./src/terminal/workers/sshWorker');
const { subscribeOutputs } = require('./src/terminal/subscribers/subscribeOutputs');
const { registerSocketHandlers } = require('./src/terminal/socket/socketHandler');
const { monitorLoop } = require('./src/terminal/monitor/monitor');

global.__rootDir = __dirname;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.get('/', (req, res) => {
    return res.json({ message: 'ok' })
})
app.get('/info', (req, res) => {
    return res.json({ message: 'ok' })
})

require('./src/terminal/terminal.route')(app);

// Socket handlers
io.on("connection", (socket) => registerSocketHandlers(socket));

// Start Redis subscriber
startSSHWorkers();
subscribeOutputs();
monitorLoop();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Backend running on ${PORT}`));
