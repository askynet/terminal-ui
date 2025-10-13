'use client';
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket || !socket.connected) {
    console.log("⚡ Initializing socket connection...");

    socket = io("http://localhost:3000", {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      forceNew: true, // 💡 ensures fresh connection on reload
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      // console.warn("⚠️ Socket disconnected:", reason);
      // Automatically reconnect
      if (reason !== "io client disconnect") {
        reconnectSocket();
      }
    });

    socket.on("connect_error", (err) => {
      // console.error("❌ Socket connection error:", err.message);
      reconnectSocket();
    });
  }

  return socket;
};

function reconnectSocket() {
  if (!socket) return;
  // console.log("🔁 Trying to reconnect...");
  if (!socket.connected) {
    setTimeout(() => {
      socket?.connect();
    }, 2000);
  }
}

export const closeSocket = () => {
  if (socket) {
    // console.log("🛑 Closing socket connection");
    socket.disconnect();
    socket = null;
  }
};
