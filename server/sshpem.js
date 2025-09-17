const express = require('express');
const { Server } = require('socket.io');
const { createServer } = require('http');
const { Client } = require('ssh2');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*' },
});

const sessions = new Map();

const PRIVATE_KEY_PATH = path.join(__dirname, process.env.SSH_KEY);
const PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('ssh-connect', ({
        sessionId,
        host = process.env.SSH_HOST,
        port = 22,
        username = process.env.SSH_USER,
        cols = 80,
        rows = 24,
        term = 'xterm-256color'
    }) => {
        const conn = new Client();
        let timeout;

        conn
            .on('ready', () => {
                sessions.set(sessionId, conn);
                socket.emit('ssh-ready', { sessionId });

                // Allocate a PTY with cols, rows and term type
                conn.shell({
                    term,
                    cols,
                    rows,
                    // can add more options here like width, height, etc.
                }, (err, stream) => {
                    if (err) return socket.emit('ssh-error', { sessionId, error: err.message });

                    conn._shellStream = stream;

                    // Reset timeout on any data from stream
                    const resetTimeout = () => {
                        if (timeout) clearTimeout(timeout);
                        timeout = setTimeout(() => {
                            stream.end();
                            conn.end();
                            socket.emit('ssh-timeout', { sessionId });
                        }, 1000 * 60 * 5); // 15 min timeout
                    };

                    resetTimeout();

                    stream.on('data', (data) => {
                        resetTimeout();
                        socket.emit('ssh-data', { sessionId, data: data.toString('utf8') });
                    });

                    stream.on('close', () => {
                        clearTimeout(timeout);
                        conn.end();
                        socket.emit('ssh-close', { sessionId });
                    });

                    socket.on('ssh-input', ({ sessionId: sid, input }) => {
                        if (sid === sessionId) {
                            resetTimeout();
                            stream.write(input);
                        }
                    });

                    // Optionally handle terminal resize from client
                    socket.on('ssh-resize', ({ sessionId: sid, cols: newCols, rows: newRows }) => {
                        if (sid === sessionId) {
                            stream.setWindow(newRows, newCols, 0, 0);
                        }
                    });
                });
            })
            .on('error', (err) => {
                socket.emit('ssh-error', { sessionId, error: err.message });
            })
            .connect({
                host,
                port,
                username,
                privateKey: PRIVATE_KEY
            });
    });

    socket.on('ssh-resize', ({ sessionId: sid, cols, rows }) => {
        const conn = sessions.get(sid);
        if (!conn) return;

        const stream = conn._shellStream;

        if (stream) {
            stream.setWindow(rows, cols, 0, 0);
        }
    });

    socket.on('ssh-disconnect', ({ sessionId }) => {
        const conn = sessions.get(sessionId);
        if (conn) {
            conn.end();
            sessions.delete(sessionId);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`);
    });
});

httpServer.listen(3001, () => {
    console.log('SSH server running on port 3001');
});