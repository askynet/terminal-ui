'use client';
import { io, Socket } from "socket.io-client";
import { CONFIG } from "./config";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:3000", {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
    });
  }
  return socket;
};