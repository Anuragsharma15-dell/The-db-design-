import { useState } from "react";
import { VoiceAgent } from  "../components/voice-agent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Code, ServerCog } from "lucide-react";

export default function VoiceChat() {
  const [activeTab, setActiveTab] = useState("devops");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Voice Assistant</h1>
        <p className="text-muted-foreground">
          Talk to AI about DevOps, Databases, and Coding using your voice
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="devops" className="gap-2">
            <ServerCog className="h-4 w-4" />
            DevOps
          </TabsTrigger>
          <TabsTrigger value="database" className="gap-2">
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="coding" className="gap-2">
            <Code className="h-4 w-4" />
            Coding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devops" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>DevOps Voice Assistant</CardTitle>
              <CardDescription>
                Get expert help with CI/CD, containers, Kubernetes, infrastructure as code, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoiceAgent
                apiEndpoint="/api/devops-chatbot"
                title="DevOps Expert"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Voice Assistant</CardTitle>
              <CardDescription>
                Ask questions about database design, optimization, queries, and best practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoiceAgent
                apiEndpoint="/api/database-chat"
                title="Database Advisor"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coding Voice Assistant</CardTitle>
              <CardDescription>
                Get help with code generation, debugging, and generative AI topics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoiceAgent
                apiEndpoint="/api/gen-chat"
                title="Coding Assistant"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">How to use</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ol className="list-decimal list-inside space-y-1">
            <li>Click "Start Voice Chat" to begin listening</li>
            <li>Ask your question clearly</li>
            <li>The AI will respond both in text and voice</li>
            <li>Click "Stop Speaking" to interrupt the voice response</li>
            <li>Click "Stop Listening" when you're done</li>
          </ol>
          <p className="text-xs mt-4">
            Note: Voice recognition requires a modern browser with microphone permissions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
