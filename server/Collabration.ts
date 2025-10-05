import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { db } from "./db";
import { collaborationSessions } from "@shared/schema";
import { eq, and } from "drizzle-orm";

interface CollaborationMessage {
  type: "join" | "leave" | "cursor" | "update" | "heartbeat";
  projectId: string;
  userId: string;
  username: string;
  data?: any;
}

interface ConnectedClient {
  ws: WebSocket;
  projectId: string;
  userId: string;
  username: string;
  sessionId: string;
}

export class CollaborationService {
  private wss: WebSocketServer;
  private clients: Map<WebSocket, ConnectedClient> = new Map();
  private projectRooms: Map<string, Set<WebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: "/ws/collaborate"
    });

    this.wss.on("connection", this.handleConnection.bind(this));
    
    setInterval(() => this.cleanupInactiveSessions(), 30000);
  }

  private handleConnection(ws: WebSocket) {
    console.log("New WebSocket connection");

    ws.on("message", async (data: string) => {
      try {
        const message: CollaborationMessage = JSON.parse(data.toString());
        await this.handleMessage(ws, message);
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      this.handleDisconnection(ws);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      this.handleDisconnection(ws);
    });
  }

  private async handleMessage(ws: WebSocket, message: CollaborationMessage) {
    switch (message.type) {
      case "join":
        await this.handleJoin(ws, message);
        break;
      case "leave":
        await this.handleLeave(ws, message);
        break;
      case "cursor":
        this.handleCursorUpdate(ws, message);
        break;
      case "update":
        this.handleSchemaUpdate(ws, message);
        break;
      case "heartbeat":
        await this.handleHeartbeat(ws, message);
        break;
    }
  }

  private async handleJoin(ws: WebSocket, message: CollaborationMessage) {
    const { projectId, userId, username } = message;

    const [session] = await db.insert(collaborationSessions).values({
      projectId,
      userId,
      username,
      isActive: true,
      lastActivity: new Date(),
    }).returning();

    const client: ConnectedClient = {
      ws,
      projectId,
      userId,
      username,
      sessionId: session.id,
    };

    this.clients.set(ws, client);

    if (!this.projectRooms.has(projectId)) {
      this.projectRooms.set(projectId, new Set());
    }
    this.projectRooms.get(projectId)!.add(ws);

    const activeSessions = await db
      .select()
      .from(collaborationSessions)
      .where(and(
        eq(collaborationSessions.projectId, projectId),
        eq(collaborationSessions.isActive, true)
      ));

    this.broadcast(projectId, {
      type: "user-joined",
      user: { userId, username },
      activeUsers: activeSessions.map(s => ({
        userId: s.userId,
        username: s.username,
      })),
    }, ws);

    ws.send(JSON.stringify({
      type: "joined",
      sessionId: session.id,
      activeUsers: activeSessions.map(s => ({
        userId: s.userId,
        username: s.username,
      })),
    }));
  }

  private async handleLeave(ws: WebSocket, message: CollaborationMessage) {
    const client = this.clients.get(ws);
    if (!client) return;

    await db
      .update(collaborationSessions)
      .set({ isActive: false })
      .where(eq(collaborationSessions.id, client.sessionId));

    this.broadcast(client.projectId, {
      type: "user-left",
      user: { userId: client.userId, username: client.username },
    }, ws);

    this.removeClient(ws);
  }

  private handleCursorUpdate(ws: WebSocket, message: CollaborationMessage) {
    const client = this.clients.get(ws);
    if (!client) return;

    this.broadcast(client.projectId, {
      type: "cursor-update",
      userId: client.userId,
      username: client.username,
      cursor: message.data,
    }, ws);
  }

  private handleSchemaUpdate(ws: WebSocket, message: CollaborationMessage) {
    const client = this.clients.get(ws);
    if (!client) return;

    this.broadcast(client.projectId, {
      type: "schema-update",
      userId: client.userId,
      username: client.username,
      changes: message.data,
    }, ws);
  }

  private async handleHeartbeat(ws: WebSocket, message: CollaborationMessage) {
    const client = this.clients.get(ws);
    if (!client) return;

    await db
      .update(collaborationSessions)
      .set({ 
        lastActivity: new Date(),
        cursorPosition: message.data?.cursor 
      })
      .where(eq(collaborationSessions.id, client.sessionId));
  }

  private handleDisconnection(ws: WebSocket) {
    const client = this.clients.get(ws);
    if (!client) return;

    db.update(collaborationSessions)
      .set({ isActive: false })
      .where(eq(collaborationSessions.id, client.sessionId))
      .then(() => {
        this.broadcast(client.projectId, {
          type: "user-left",
          user: { userId: client.userId, username: client.username },
        });
      });

    this.removeClient(ws);
  }

  private removeClient(ws: WebSocket) {
    const client = this.clients.get(ws);
    if (client) {
      const room = this.projectRooms.get(client.projectId);
      if (room) {
        room.delete(ws);
        if (room.size === 0) {
          this.projectRooms.delete(client.projectId);
        }
      }
    }
    this.clients.delete(ws);
  }

  private broadcast(projectId: string, message: any, excludeWs?: WebSocket) {
    const room = this.projectRooms.get(projectId);
    if (!room) return;

    const messageStr = JSON.stringify(message);
    room.forEach((clientWs) => {
      if (clientWs !== excludeWs && clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(messageStr);
      }
    });
  }

  private async cleanupInactiveSessions() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    await db
      .update(collaborationSessions)
      .set({ isActive: false })
      .where(and(
        eq(collaborationSessions.isActive, true),
      ));
  }
}
