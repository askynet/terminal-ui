"use client";

import React, { use, useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { v4 as uuidv4 } from "uuid";
import { getSocket } from "@/config/socket";
import { User } from "@/types";

const TerminalWindow = ({ id, isActive, user }: { id: string; isActive: boolean, user?: User }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termInstance = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const sessionIdRef = useRef<string>(uuidv4());
  const hasConnectedRef = useRef(false);
  const socket = useRef(getSocket());

  // Send resize event to backend
  const sendResize = (cols: number, rows: number) => {
    socket.current.emit("ssh-resize", {
      sessionId: sessionIdRef.current,
      cols,
      rows,
    });
  };

  useEffect(() => {
    if (!termInstance.current && terminalRef.current) {
      const term = new Terminal({
        theme: { background: "#1e1e1e", foreground: "#ffffff" },
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

      if (!hasConnectedRef.current) {
        hasConnectedRef.current = true;
        socket.current.emit("ssh-connect", {
          sessionId: sessionIdRef.current,
          cols: term.cols,
          rows: term.rows,
          term: "xterm-256color",
        });
      }

      socket.current.on("ssh-ready", ({ sessionId }) => {
        if (sessionId === sessionIdRef.current) {
          term.writeln("SSH Connection established.\r\n");
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
        }
      });

      socket.current.on("ssh-close", ({ sessionId }) => {
        if (sessionId === sessionIdRef.current) {
          term.writeln("\r\n[Connection closed]\r\n");
          term.dispose();
          termInstance.current = null;
        }
      });

      // Handle terminal input
      term.onData((data) => {
        socket.current.emit("ssh-input", {
          sessionId: sessionIdRef.current,
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

  // Refocus terminal when active
  useEffect(() => {
    if (isActive && termInstance.current) {
      termInstance.current.focus();
    }
  }, [isActive]);

  // Simple reconnect logic if socket disconnects
  useEffect(() => {
    const s = socket.current;

    const handleReconnect = () => {
      if (!hasConnectedRef.current && termInstance.current) {
        s.emit("ssh-connect", {
          sessionId: sessionIdRef.current,
          cols: termInstance.current.cols,
          rows: termInstance.current.rows,
          term: "xterm-256color",
        });
        hasConnectedRef.current = true;
      }
    };

    s.on("disconnect", () => {
      if (termInstance.current) {
        termInstance.current.writeln("\r\n[Disconnected from server, trying to reconnect...]\r\n");
        hasConnectedRef.current = false;
      }
    });

    s.on("connect", () => {
      handleReconnect();
      if (termInstance.current) {
        termInstance.current.writeln("\r\n[Reconnected]\r\n");
      }
    });

    return () => {
      s.off("disconnect");
      s.off("connect");
    };
  }, []);

  return <div>
    <div key={`terminal${id}`} ref={terminalRef} style={{ height: "80vh", background: "#1e1e1e" }} />
    <div style={{ height: '20vh' }}>
      {
        user && <div className="mt-5 mx-3">
          <p className="text-2xl text-black font-bold">{user.displayName} ({user.userRole})</p>
        </div>
      }
    </div>
  </div>;
};

export default React.memo(TerminalWindow);