import type { Server as HttpServer } from "node:http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";

type Role = "provider" | "client" | "admin";

type SocketUser = {
  userId: string;
  role: Role;
  adminSubrole: "super_admin" | "support" | "finance" | null;
};

let realtime: Server | null = null;

export function setupRealtime(server: HttpServer): Server {
  realtime = new Server(server, {
    cors: { origin: true, credentials: true }
  });

  realtime.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!token || !secret) return next(new Error("Authentication required"));

    try {
      const payload = jwt.verify(token, secret) as jwt.JwtPayload;
      if (typeof payload.sub !== "string" || !payload.role) return next(new Error("Invalid token"));
      socket.data.user = {
        userId: payload.sub,
        role: payload.role,
        adminSubrole: payload.adminSubrole ?? null
      } satisfies SocketUser;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  realtime.on("connection", (socket) => {
    const user = socket.data.user as SocketUser;
    socket.join(`${user.role === "client" ? "collaborator" : user.role}:${user.userId}`);
    if (user.role === "admin") socket.join("admin");
  });

  return realtime;
}

export function emitRealtime(event: string, rooms: string[], payload: Record<string, unknown>): void {
  if (!realtime) return;
  for (const room of rooms) realtime.to(room).emit(event, payload);
}

export function userRoom(role: "provider" | "client", userId: string): string {
  return `${role === "client" ? "collaborator" : role}:${userId}`;
}
