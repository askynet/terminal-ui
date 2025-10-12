"use client";

import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { v4 as uuidv4 } from "uuid";
import { getSocket } from "@/config/socket";
import { User } from "@/types";
import { useAppContext } from "@/layout/AppWrapper";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Button } from "primereact/button";
import { Message } from "primereact/message";

const TerminalWindow = ({ id, isActive, user }: { id: string; isActive: boolean, user?: User }) => {
  const { theme } = useAppContext();
  const terminalRef = useRef<HTMLDivElement>(null);
  const termInstance = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const sessionIdRef = useRef<string>(uuidv4());
  const hasSocketConnectedRef = useRef(false);
  const hasSSHConnectedRef = useRef(false);
  const socket = useRef(getSocket());
  const { passwordToken } = useSelector((state: RootState) => state.auth);

  // Send resize event to backend
  const emitMessage = (eventName: string, payload = {}) => {
    socket.current.emit(eventName, {
      sessionId: sessionIdRef.current,
      sshToken: passwordToken,
      ...payload
    });
  }
  const sendResize = (cols: number, rows: number) => {
    emitMessage("ssh-resize", {
      cols,
      rows,
    });
  };

  const handleReconnect = () => {
    console.log('re-connect');
    if (!hasSocketConnectedRef?.current && !hasSSHConnectedRef?.current && termInstance?.current) {
      hasSocketConnectedRef.current = true;
      emitMessage("ssh-connect", {
        cols: termInstance.current.cols,
        rows: termInstance.current.rows,
        term: "xterm-color",
      });
    }
  }

  useEffect(() => {
    if (!termInstance.current && terminalRef.current) {
      const term = new Terminal({
        theme: { background: theme === 'light' ? '#f9fafb' : "#111827", foreground: "#00e08f" },
        fontSize: 15,
        allowProposedApi: true,
        cursorBlink: true,
      });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      term.open(terminalRef.current);
      fitAddon.fit();

      term.focus();

      term.writeln("Connecting to SSH server...");

      termInstance.current = term;
      fitAddonRef.current = fitAddon;

      handleReconnect();

      socket.current.on("connect_error", (err) => {
        console.log("WebSocket connection failed:", err.message);
        hasSocketConnectedRef.current = false;
      });

      socket.current.on("ssh-ready", ({ sessionId }) => {
        if (sessionId === sessionIdRef.current) {
          hasSSHConnectedRef.current = true;
          term.writeln("Connection established.\r\n");
        }
      });

      socket.current.on("ssh-data", ({ sessionId, data }) => {
        if (sessionId === sessionIdRef.current) {
          term.write(data);
        }
      });

      socket.current.on("ssh-error", ({ sessionId, error }) => {
        if (sessionId === sessionIdRef.current) {
          term.writeln(`\r\n[ERROR] ${error}\r\n`);
        }
      });

      socket.current.on("ssh-timeout", ({ sessionId }) => {
        if (sessionId === sessionIdRef.current) {
          term.writeln("\r\n[Session timed out due to inactivity]\r\n");
          term.dispose();
          termInstance.current = null;
          hasSSHConnectedRef.current = false;
        }
      });

      socket.current.on("ssh-close", ({ sessionId }) => {
        if (sessionId === sessionIdRef.current) {
          term.writeln("\r\n[Connection closed]\r\n");
          term.dispose();
          termInstance.current = null;
          hasSSHConnectedRef.current = false;
        }
      });

      // Handle terminal input
      term.onData((data) => {
        emitMessage("ssh-input", {
          input: data,
        });
      });

      // Handle window resize to fit and notify backend
      const handleResize = () => {
        if (!termInstance.current || !fitAddonRef.current) return;
        fitAddonRef.current.fit();
        const cols = termInstance.current.cols;
        const rows = termInstance.current.rows;
        sendResize(cols, rows);
      };
      window.addEventListener("resize", handleResize);

      // Initial resize notification
      sendResize(term.cols, term.rows);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (termInstance.current) {
          termInstance.current.dispose();
          termInstance.current = null;
        }
      };
    }
  }, []);

  useEffect(() => {
    if (termInstance && termInstance.current && termInstance.current.options) {
      termInstance.current.options.theme = { background: theme === 'light' ? '#f9fafb' : "#111827", foreground: "#00e08f" };
    }
  }, [theme])

  // Refocus terminal when active
  useEffect(() => {
    if (isActive && termInstance.current) {
      termInstance.current.focus();
    }
  }, [isActive]);

  // Simple reconnect logic if socket disconnects
  useEffect(() => {
    const s = socket.current;
    s.on("disconnect", () => {
      console.log('socker disonnect')
      if (termInstance.current) {
        termInstance.current.writeln("\r\n[Disconnected from server, trying to reconnect...]\r\n");
        hasSocketConnectedRef.current = false;
        hasSSHConnectedRef.current = false;
      }
    });

    s.on("connect", () => {
      handleReconnect();
    });

    return () => {
      s.off("disconnect");
      s.off("connect");
    };
  }, []);

  return <div style={{ visibility: isActive ? 'visible' : 'hidden', height: isActive ? '100vh' : 0, padding: isActive ? 10 : 0 }}>
    <div key={`terminal${id}`} ref={terminalRef} style={{ height: "90vh" }} />
    {
      !hasSocketConnectedRef.current && <div className="card flex justify-content-center" style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: '1rem'
      }}>
        <Message severity="error" text="Server disconnected" />
      </div>
    }
    {
      hasSocketConnectedRef.current && !hasSSHConnectedRef.current && <Button
        onClick={() => handleReconnect()}
        label="Re-connect"
        severity="danger"
        rounded
        icon="pi pi-plus"
        className="floating-btn"
        style={{
          background: 'red',
          color: '#fff',
          position: 'fixed',
          bottom: '2rem',
          right: '2rem'
        }} />
    }
  </div>;
};

export default React.memo(TerminalWindow);