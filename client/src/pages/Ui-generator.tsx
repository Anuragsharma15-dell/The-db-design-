import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "code"; // extra type for code messages
}

export default function UiGeneratorChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! Paste your database schema here, and I'll generate UI component code (React + Tailwind) for it. For example: profile pages, forms, and dashboards.",
      type: "text",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, type: "text" },
    ]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ui-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get response");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response, type: "code" },
      ]);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to get response from UI generator chatbot",
        variant: "destructive",
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I encountered an error. Please check your API configuration.",
          type: "text",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          UI Generator Chatbot
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate React + Tailwind UI components automatically from your
          database schema.
        </p>
      </div>

      <Card className="flex flex-col h-[calc(100%-8rem)]">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}

                {message.type === "code" ? (
                  <pre className="bg-black text-green-400 rounded-lg px-4 py-4 text-sm overflow-x-auto overflow-y-auto max-w-full w-full max-h-[500px] whitespace-pre-wrap shadow-md border border-gray-700">
                    <code className="block">{message.content}</code>
                  </pre>
                ) : (
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                )}

                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                  <Bot className="h-4 w-4 text-primary-foreground animate-pulse" />
                </div>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <p className="text-muted-foreground">Generating UI code...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Paste your database schema here... (Press Enter to send, Shift+Enter for new line)"
              className="min-h-[100px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
