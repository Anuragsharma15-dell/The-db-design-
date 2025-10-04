import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle2, Clock, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MigrationAnalysis {
  analysis: string;
  saferRewrite: string;
  warnings: string[];
  estimatedLockTime: string;
  recommendations: string[];
}

export default function MigrationSafety() {
  const [migration, setMigration] = useState("");
  const [databaseType, setDatabaseType] = useState("postgresql");
  const [result, setResult] = useState<MigrationAnalysis | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (data: { migration: string; databaseType: string }) => {
      const response = await fetch("/api/analyze-migration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to analyze migration");
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleAnalyze = () => {
    if (!migration.trim()) return;
    analyzeMutation.mutate({ migration, databaseType });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2 mb-2">
            <Shield className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            Migration Safety Assistant
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Analyze SQL migrations for potential risks and get safer alternatives
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Your Migration</CardTitle>
              <CardDescription>Paste your SQL migration or schema change</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="database-type">Database Type</Label>
                <Select value={databaseType} onValueChange={setDatabaseType}>
                  <SelectTrigger id="database-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="sqlserver">SQL Server</SelectItem>
                    <SelectItem value="oracle">Oracle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="migration">SQL Migration</Label>
                <Textarea
                  id="migration"
                  placeholder="ALTER TABLE users ADD COLUMN email VARCHAR(255) NOT NULL;&#10;CREATE INDEX idx_users_email ON users(email);"
                  value={migration}
                  onChange={(e) => setMigration(e.target.value)}
                  className="font-mono text-sm min-h-[200px] md:min-h-[300px]"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!migration.trim() || analyzeMutation.isPending}
                className="w-full"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Analyze Migration
                  </>
                )}
              </Button>

              {analyzeMutation.isError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {(analyzeMutation.error as Error).message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            {result && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Estimated Lock Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {result.estimatedLockTime}
                    </div>
                  </CardContent>
                </Card>

                {result.warnings.length > 0 && (
                  <Card className="border-orange-500/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="h-5 w-5" />
                        Warnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[150px]">
                        <ul className="space-y-2">
                          {result.warnings.map((warning, idx) => (
                            <li key={idx} className="flex gap-2 text-sm">
                              <Badge variant="destructive" className="shrink-0">
                                {idx + 1}
                              </Badge>
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <p className="text-sm whitespace-pre-wrap">{result.analysis}</p>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="border-green-500/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      Safer Rewrite
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <pre className="text-sm font-mono bg-muted p-4 rounded-lg overflow-x-auto">
                        {result.saferRewrite}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[250px]">
                      <ol className="space-y-3 list-decimal list-inside">
                        {result.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm">
                            <span className="ml-2">{rec}</span>
                          </li>
                        ))}
                      </ol>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </>
            )}

            {!result && !analyzeMutation.isPending && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-sm md:text-base px-4">
                    Enter your SQL migration and click "Analyze Migration" to get safety insights
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
