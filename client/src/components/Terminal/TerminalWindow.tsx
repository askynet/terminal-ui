"use client";

import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { v4 as uuidv4 } from "uuid";
import { getSocket } from "@/config/socket";
import { useAppContext } from "@/layout/AppWrapper";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Button } from "primereact/button";
import { xTermDarkTheme, xTermLightTheme } from "./xterm-theme";
import { io, Socket } from "socket.io-client";

const TerminalWindow = ({ id, isActive }: { id: string; isActive: boolean }) => {
  const { theme } = useAppContext();
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const termInstance = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const sessionIdRef = useRef<string>(uuidv4());
  const socketRef = useRef<Socket | null>(null);
  const { passwordToken } = useSelector((state: RootState) => state.auth);

  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isSSHConnected, setIsSSHConnected] = useState(false);

  const emitMessage = (eventName: string, payload = {}) => {
    socketRef?.current?.emit(eventName, {
      sessionId: sessionIdRef.current,
      sshToken: passwordToken,
      ...payload,
    });
  };

  const sendResize = (cols: number, rows: number) => {
    emitMessage("ssh-resize", { cols, rows });
  };

  const connectSSH = () => {
    if (!termInstance.current) return;

    emitMessage("ssh-disconnect", { sessionId: sessionIdRef.current });

    // Delay a bit before reconnecting
    setTimeout(() => {
      console.log('sessionIdRef.current', sessionIdRef.current, socketRef?.current?.id)
      emitMessage("ssh-connect", {
        cols: termInstance.current?.cols,
        rows: termInstance.current?.rows,
        term: "xterm-color",
      });
    }, 200);
  };

  useEffect(() => {
    // Initialize terminal
    const term = new Terminal({
      fontSize: 15,
      allowProposedApi: true,
      cursorBlink: true,
      cursorStyle: "bar",
      theme: theme === "light" ? xTermLightTheme : xTermDarkTheme,
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current!);
    fitAddon.fit();
    term.focus();
    term.writeln("Connecting to SSH server...");

    termInstance.current = term;
    fitAddonRef.current = fitAddon;

    // Terminal input
    term.onData((data) => emitMessage("ssh-input", { input: data }));

    // Resize handler
    const handleResize = () => {
      fitAddon.fit();
      sendResize(term.cols, term.rows);
    };
    window.addEventListener("resize", handleResize);

    // Trigger SSH connect even if socket already connected
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "", {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      forceNew: true
    });

    socketRef.current = socket;

    // Socket events
    socket.on("connect", () => {
      console.log("[Socket] connected");
      setIsSocketConnected(true);
      if (!isSSHConnected) {
        connectSSH();
      }
    });

    socket.on("disconnect", () => {
      console.log("[Socket] disconnected");
      setIsSocketConnected(false);
      setIsSSHConnected(false);
      term.writeln("\r\n[Disconnected from server. Trying to reconnect...]\r\n");
    });

    socket.on("connect_error", (err) => {
      console.log("WebSocket connection failed:", err.message);
      setIsSocketConnected(false);
    });

    socket.on("ssh-ready", ({ sessionId }) => {
      if (sessionId === sessionIdRef.current) {
        setIsSSHConnected(true);
        term.writeln("Connection established.\r\n");
      }
    });

    socket.on("ssh-data", ({ sessionId, data }) => {
      if (sessionId === sessionIdRef.current) term.write(data);
    });

    socket.on("ssh-error", ({ sessionId, error }) => {
      if (sessionId === sessionIdRef.current) term.writeln(`\r\n[ERROR] ${error}\r\n`);
    });

    socket.on("ssh-timeout", ({ sessionId }) => {
      if (sessionId === sessionIdRef.current) {
        term.writeln("\r\n[Session timed out]\r\n");
        setIsSSHConnected(false);
        term.dispose();
      }
    });

    socket.on("ssh-close", ({ sessionId }) => {
      if (sessionId === sessionIdRef.current) {
        term.writeln("\r\n[Connection closed]\r\n");
        setIsSSHConnected(false);
        term.dispose();
      }
    });

    sendResize(term.cols, term.rows);

    return () => {
      console.log('tab unmount', id);
      emitMessage("ssh-disconnect", { sessionId: sessionIdRef.current });
      window.removeEventListener("resize", handleResize);
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("ssh-ready");
      socket.off("ssh-data");
      socket.off("ssh-error");
      socket.off("ssh-timeout");
      socket.off("ssh-close");
      term.dispose();
    };
  }, []);

  useEffect(() => {
    if (termInstance.current) {
      termInstance.current.options.theme =
        theme === "light" ? xTermLightTheme : xTermDarkTheme;
    }
  }, [theme]);

  useEffect(() => {
    if (isActive && termInstance.current) {
      termInstance.current.focus();
    }
  }, [isActive]);

  return (
    <div
      style={{
        visibility: isActive ? "visible" : "hidden",
        height: isActive ? "100vh" : 0,
        padding: isActive ? 10 : 0,
      }}
    >
      <div key={`terminal${id}`} ref={terminalRef} style={{ height: "90vh" }} />

      {isSocketConnected && !isSSHConnected && (
        <Button
          onClick={() => connectSSH()}
          label="Re-connect"
          severity="danger"
          rounded
          icon="pi pi-refresh"
          className="floating-btn"
          style={{
            background: "red",
            color: "#fff",
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
          }}
        />
      )}
    </div>
  );
};

export default React.memo(TerminalWindow);