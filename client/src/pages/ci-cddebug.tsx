import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle2, Code, Wrench } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CICDDebugResult {
  rootCause: string;
  explanation: string;
  suggestedFix: string;
  fixedYaml?: string;
  relatedIssues: string[];
}

export default function CICDDebug() {
  const [logs, setLogs] = useState("");
  const [pipelineYaml, setPipelineYaml] = useState("");
  const [result, setResult] = useState<CICDDebugResult | null>(null);

  const debugMutation = useMutation({
    mutationFn: async (data: { logs: string; pipelineYaml?: string }) => {
      const response = await fetch("/api/debug-cicd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to debug CI/CD pipeline");
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleDebug = () => {
    if (!logs.trim()) return;
    debugMutation.mutate({ 
      logs, 
      pipelineYaml: pipelineYaml.trim() || undefined 
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2 mb-2">
            <Wrench className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            CI/CD Debugging Copilot
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Debug pipeline failures with AI-powered analysis and fixes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Logs</CardTitle>
                <CardDescription>Paste your failing CI/CD pipeline logs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logs">Error Logs (Required)</Label>
                  <Textarea
                    id="logs"
                    placeholder="Error: Cannot find module 'express'&#10;npm ERR! code ELIFECYCLE&#10;npm ERR! errno 1&#10;..."
                    value={logs}
                    onChange={(e) => setLogs(e.target.value)}
                    className="font-mono text-xs md:text-sm min-h-[200px] md:min-h-[250px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pipeline Configuration (Optional)</CardTitle>
                <CardDescription>Add your YAML config for better analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="yaml">YAML Configuration</Label>
                  <Textarea
                    id="yaml"
                    placeholder="name: CI Pipeline&#10;on: [push]&#10;jobs:&#10;  build:&#10;    runs-on: ubuntu-latest&#10;    steps:&#10;      - uses: actions/checkout@v2&#10;      ..."
                    value={pipelineYaml}
                    onChange={(e) => setPipelineYaml(e.target.value)}
                    className="font-mono text-xs md:text-sm min-h-[150px] md:min-h-[200px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleDebug}
              disabled={!logs.trim() || debugMutation.isPending}
              className="w-full"
              size="lg"
            >
              {debugMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Pipeline...
                </>
              ) : (
                <>
                  <Wrench className="mr-2 h-4 w-4" />
                  Debug Pipeline
                </>
              )}
            </Button>

            {debugMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {(debugMutation.error as Error).message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-6">
            {result && (
              <>
                <Card className="border-red-500/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      Root Cause
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-sm md:text-base">{result.rootCause}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Explanation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px] md:h-[250px]">
                      <p className="text-sm whitespace-pre-wrap">{result.explanation}</p>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="border-green-500/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      Suggested Fix
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[250px] md:h-[300px]">
                      <div className="text-sm whitespace-pre-wrap">{result.suggestedFix}</div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {result.fixedYaml && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Fixed YAML Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <pre className="text-xs md:text-sm font-mono bg-muted p-4 rounded-lg overflow-x-auto">
                          {result.fixedYaml}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {result.relatedIssues.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Related Issues to Watch For</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[150px]">
                        <ul className="space-y-2">
                          {result.relatedIssues.map((issue, idx) => (
                            <li key={idx} className="flex gap-2 text-sm">
                              <Badge variant="outline" className="shrink-0">
                                {idx + 1}
                              </Badge>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!result && !debugMutation.isPending && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
                  <Wrench className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-sm md:text-base px-4">
                    Paste your pipeline logs and click "Debug Pipeline" to get AI-powered insights
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
