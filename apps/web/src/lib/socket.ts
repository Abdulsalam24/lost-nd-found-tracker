import { io, Socket } from "socket.io-client";
import { getToken } from "./api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;

  socket = io(`${API_URL}/chat`, {
    auth: { token: getToken() },
    autoConnect: false,
  });

  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.auth = { token: getToken() };
    s.connect();
  }
  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
