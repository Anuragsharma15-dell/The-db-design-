import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle2, Activity, ShieldAlert, GitCompare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface DriftDetail {
  resource: string;
  field: string;
  desired: string;
  actual: string;
  severity: "low" | "medium" | "high" | "critical";
}

interface InfraDriftResult {
  driftSummary: string;
  driftDetails: DriftDetail[];
  explanation: string;
  autoFixSuggestions: string[];
  dangerousChanges: string[];
  recommendations: string;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
};

const getSeverityVariant = (severity: string): "default" | "destructive" | "outline" | "secondary" => {
  switch (severity) {
    case "critical":
    case "high":
      return "destructive";
    case "medium":
      return "outline";
    default:
      return "secondary";
  }
};

export default function InfraDrift() {
  const [desiredState, setDesiredState] = useState("");
  const [actualState, setActualState] = useState("");
  const [iacType, setIacType] = useState("terraform");
  const [result, setResult] = useState<InfraDriftResult | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (data: { desiredState: string; actualState: string; iacType: string }) => {
      const response = await fetch("/api/analyze-drift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to analyze infrastructure drift");
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleAnalyze = () => {
    if (!desiredState.trim() || !actualState.trim()) return;
    analyzeMutation.mutate({ desiredState, actualState, iacType });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2 mb-2">
            <Activity className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            Infra Drift Guardian
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Detect and analyze infrastructure drift between IaC and actual cloud state
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Infrastructure as Code (Desired State)</CardTitle>
                <CardDescription>Paste your Terraform, Helm, or CloudFormation config</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="iac-type">IaC Type</Label>
                  <Select value={iacType} onValueChange={setIacType}>
                    <SelectTrigger id="iac-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="terraform">Terraform</SelectItem>
                      <SelectItem value="helm">Helm</SelectItem>
                      <SelectItem value="cloudformation">CloudFormation</SelectItem>
                      <SelectItem value="pulumi">Pulumi</SelectItem>
                      <SelectItem value="kubernetes">Kubernetes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desired-state">Desired State</Label>
                  <Textarea
                    id="desired-state"
                    placeholder="resource &quot;aws_instance&quot; &quot;prod_app&quot; {&#10;  instance_type = &quot;t3.medium&quot;&#10;  ami = &quot;ami-12345&quot;&#10;  ...&#10;}"
                    value={desiredState}
                    onChange={(e) => setDesiredState(e.target.value)}
                    className="font-mono text-xs md:text-sm min-h-[200px] md:min-h-[250px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actual Cloud State</CardTitle>
                <CardDescription>Paste the actual configuration from AWS/GCP/Azure/K8s</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="actual-state">Actual State</Label>
                  <Textarea
                    id="actual-state"
                    placeholder="instance_type: t3.xlarge&#10;ami: ami-12345&#10;public_ip: 54.123.45.67&#10;security_groups: [sg-open]&#10;..."
                    value={actualState}
                    onChange={(e) => setActualState(e.target.value)}
                    className="font-mono text-xs md:text-sm min-h-[200px] md:min-h-[250px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleAnalyze}
              disabled={!desiredState.trim() || !actualState.trim() || analyzeMutation.isPending}
              className="w-full"
              size="lg"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Drift...
                </>
              ) : (
                <>
                  <GitCompare className="mr-2 h-4 w-4" />
                  Analyze Infrastructure Drift
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
          </div>

          <div className="space-y-6">
            {result && (
              <>
                <Card className="border-primary/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Drift Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-sm md:text-base">{result.driftSummary}</p>
                  </CardContent>
                </Card>

                {result.driftDetails.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Drift Details</CardTitle>
                      <CardDescription>
                        {result.driftDetails.length} configuration difference(s) detected
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px] md:h-[350px]">
                        <div className="space-y-4">
                          {result.driftDetails.map((drift, idx) => (
                            <div key={idx} className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between gap-2 flex-wrap">
                                <div className="flex-1">
                                  <p className="font-semibold text-sm">{drift.resource}</p>
                                  <p className="text-xs text-muted-foreground">{drift.field}</p>
                                </div>
                                <Badge variant={getSeverityVariant(drift.severity)} className="shrink-0">
                                  {drift.severity.toUpperCase()}
                                </Badge>
                              </div>
                              <Separator />
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-muted-foreground mb-1">Desired:</p>
                                  <code className="bg-muted p-1 rounded break-all">{drift.desired}</code>
                                </div>
                                <div>
                                  <p className="text-muted-foreground mb-1">Actual:</p>
                                  <code className="bg-muted p-1 rounded break-all">{drift.actual}</code>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

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

                {result.dangerousChanges.length > 0 && (
                  <Card className="border-red-500/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <ShieldAlert className="h-5 w-5" />
                        Dangerous Changes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[150px]">
                        <ul className="space-y-2">
                          {result.dangerousChanges.map((change, idx) => (
                            <li key={idx} className="flex gap-2 text-sm">
                              <Badge variant="destructive" className="shrink-0">
                                ⚠
                              </Badge>
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {result.autoFixSuggestions.length > 0 && (
                  <Card className="border-green-500/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        Auto-Fix Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <ol className="space-y-3 list-decimal list-inside">
                          {result.autoFixSuggestions.map((fix, idx) => (
                            <li key={idx} className="text-sm">
                              <span className="ml-2">{fix}</span>
                            </li>
                          ))}
                        </ol>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[150px]">
                      <p className="text-sm whitespace-pre-wrap">{result.recommendations}</p>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </>
            )}

            {!result && !analyzeMutation.isPending && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
                  <Activity className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-sm md:text-base px-4">
                    Enter your IaC desired state and actual cloud state to detect drift
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
