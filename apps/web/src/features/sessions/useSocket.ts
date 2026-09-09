import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const sockets = new Map<string, Socket>();

function getSocket(token: string): Socket {
  const existing = sockets.get(token);
  if (existing) return existing;
  const socket = io(API_URL, { auth: { token }, transports: ["websocket"] });
  sockets.set(token, socket);
  return socket;
}

export function useSocket(token: string | null): Socket | null {
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);
    socketRef.current = socket;
    return () => {
      if (socketRef.current === socket) socketRef.current = null;
      if (![...sockets.values()].some((candidate) => candidate === socket && candidate.connected)) {
        socket.disconnect();
        sockets.delete(token);
      }
    };
  }, [token]);
  return socketRef.current;
}

export function useSocketEvent<T>(token: string | null, event: string, handler: (payload: T) => void): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);
    const listener = (payload: T) => handlerRef.current(payload);
    socket.on(event, listener);
    return () => {
      socket.off(event, listener);
    };
  }, [event, token]);
}
