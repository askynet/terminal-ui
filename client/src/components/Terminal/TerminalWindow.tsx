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

const TerminalWindow = ({ id, isActive }: { id: string; isActive: boolean }) => {
  const { theme } = useAppContext();
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const termInstance = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const sessionIdRef = useRef<string>(uuidv4());
  const socket = useRef(getSocket());
  const { passwordToken } = useSelector((state: RootState) => state.auth);

  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isSSHConnected, setIsSSHConnected] = useState(false);

  const emitMessage = (eventName: string, payload = {}) => {
    socket.current.emit(eventName, {
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

    const s = socket.current;

    // Trigger SSH connect even if socket already connected
    if (s.connected) {
      connectSSH();
    } else {
      s.once("connect", () => {
        setIsSocketConnected(true);
        connectSSH();
      });
    }

    // Socket events
    s.on("connect", () => {
      console.log("[Socket] connected");
      setIsSocketConnected(true);
    });

    s.on("disconnect", () => {
      console.log("[Socket] disconnected");
      setIsSocketConnected(false);
      setIsSSHConnected(false);
      term.writeln("\r\n[Disconnected from server. Trying to reconnect...]\r\n");
    });

    s.on("connect_error", (err) => {
      console.log("WebSocket connection failed:", err.message);
      setIsSocketConnected(false);
    });

    s.on("ssh-ready", ({ sessionId }) => {
      if (sessionId === sessionIdRef.current) {
        setIsSSHConnected(true);
        term.writeln("Connection established.\r\n");
      }
    });

    s.on("ssh-data", ({ sessionId, data }) => {
      if (sessionId === sessionIdRef.current) term.write(data);
    });

    s.on("ssh-error", ({ sessionId, error }) => {
      if (sessionId === sessionIdRef.current) term.writeln(`\r\n[ERROR] ${error}\r\n`);
    });

    s.on("ssh-timeout", ({ sessionId }) => {
      if (sessionId === sessionIdRef.current) {
        term.writeln("\r\n[Session timed out]\r\n");
        setIsSSHConnected(false);
        term.dispose();
      }
    });

    s.on("ssh-close", ({ sessionId }) => {
      if (sessionId === sessionIdRef.current) {
        term.writeln("\r\n[Connection closed]\r\n");
        setIsSSHConnected(false);
        term.dispose();
      }
    });

    sendResize(term.cols, term.rows);

    return () => {
      console.log('tab unmount', id);
      window.removeEventListener("resize", handleResize);
      s.off("connect");
      s.off("disconnect");
      s.off("connect_error");
      s.off("ssh-ready");
      s.off("ssh-data");
      s.off("ssh-error");
      s.off("ssh-timeout");
      s.off("ssh-close");
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