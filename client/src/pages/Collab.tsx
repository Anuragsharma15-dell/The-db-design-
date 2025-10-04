import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CollaborationMessage {
  type: "join" | "leave" | "cursor" | "update" | "heartbeat" 
        | "user-joined" | "user-left" | "joined" | "cursor-update" | "schema-update";
  projectId?: string;
  userId?: string;
  username?: string;
  data?: any;
  sessionId?: string;
  activeUsers?: { userId: string; username: string }[];
  user?: { userId: string; username: string };
  cursor?: any;
  changes?: any;
}

interface User {
  userId: string;
  username: string;
}

export default function CollaborationPage() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [schema, setSchema] = useState<string>(""); // shared schema text
  const [username, setUsername] = useState<string>("guest-" + Math.floor(Math.random() * 1000));
  const [projectId] = useState<string>("demo-project"); // static project for now
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3000/ws/collaborate`);
    setSocket(ws);

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({
        type: "join",
        projectId,
        userId: crypto.randomUUID(),
        username,
      }));
    };

    ws.onmessage = (event) => {
      const message: CollaborationMessage = JSON.parse(event.data);
      handleMessage(message);
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("Disconnected from collaboration server");
    };

    return () => {
      ws.close();
    };
  }, [projectId, username]);

  // keep heartbeats alive
  useEffect(() => {
    if (!socket) return;
    const interval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: "heartbeat",
          projectId,
          userId: username,
          data: { cursor: textareaRef.current?.selectionStart ?? 0 }
        }));
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [socket]);

  const handleMessage = (msg: CollaborationMessage) => {
    switch (msg.type) {
      case "joined":
        setActiveUsers(msg.activeUsers || []);
        break;
      case "user-joined":
        setActiveUsers(msg.activeUsers || []);
        break;
      case "user-left":
        setActiveUsers(prev => prev.filter(u => u.userId !== msg.user?.userId));
        break;
      case "schema-update":
        setSchema(msg.changes || "");
        break;
    }
  };

  const handleSchemaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setSchema(newText);

    socket?.send(JSON.stringify({
      type: "update",
      projectId,
      userId: username,
      username,
      data: newText,
    }));
  };

  return (
    <div className="p-6 grid grid-cols-3 gap-6">
      <Card className="p-4 col-span-2">
        <h2 className="text-xl font-bold mb-2">Collaborative Schema Editor</h2>
        <Textarea
          ref={textareaRef}
          value={schema}
          onChange={handleSchemaChange}
          placeholder="Start editing the schema..."
          className="w-full h-[400px]"
        />
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-bold mb-2">Active Users</h2>
        <ScrollArea className="h-[400px]">
          <ul>
            {activeUsers.map((u) => (
              <li key={u.userId} className="p-2 border-b">{u.username}</li>
            ))}
          </ul>
        </ScrollArea>
        <div className="mt-4">
          {connected ? (
            <Button variant="secondary" onClick={() => socket?.close()}>
              Disconnect
            </Button>
          ) : (
            <Button disabled>Connecting...</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
