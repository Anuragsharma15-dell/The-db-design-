import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Container, FileCode, Info, Copy, Check, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface K8sFile {
  name: string;
  content: string;
  path?: string;
}

interface K8sConfig {
  deployment: string;
  service: string;
  configMap?: string;
  secrets?: string;
  instructions: string;
}

export default function KubernetesExport() {
  const { toast } = useToast();
  const [schema, setSchema] = useState("");
  const [databaseType, setDatabaseType] = useState<string>("");
  const [includeSampleData, setIncludeSampleData] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [k8sConfig, setK8sConfig] = useState<K8sConfig | null>(null);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const databaseTypes = [
    { value: "postgresql", label: "PostgreSQL" },
    { value: "mysql", label: "MySQL" },
    { value: "mongodb", label: "MongoDB" },
    { value: "sqlite", label: "SQLite" },
    { value: "sqlserver", label: "SQL Server" }
  ];

  const handleGenerate = async () => {
    if (!schema || !databaseType) {
      toast({
        title: "Missing Information",
        description: "Please provide both database schema and database type.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-kubernetes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          databaseType,
          schema,
          includeSampleData
        })
      });

      if (!response.ok) throw new Error("Failed to generate Kubernetes manifests");

      const result = await response.json();
      setK8sConfig(result);

      toast({
        title: "Kubernetes Configuration Generated!",
        description: "Your database manifests are ready.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate Kubernetes configuration. Try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, fileName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
    toast({
      title: "Copied",
      description: `${fileName} copied successfully.`
    });
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    if (!k8sConfig) return;

    const files = [
      { name: "deployment.yaml", content: k8sConfig.deployment },
      { name: "service.yaml", content: k8sConfig.service },
      ...(k8sConfig.configMap ? [{ name: "configmap.yaml", content: k8sConfig.configMap }] : []),
      ...(k8sConfig.secrets ? [{ name: "secrets.yaml", content: k8sConfig.secrets }] : []),
      { name: "README.md", content: k8sConfig.instructions }
    ];

    files.forEach(file => downloadFile(file.content, file.name));

    toast({
      title: "Downloaded",
      description: "All Kubernetes manifests have been downloaded."
    });
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Container className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">
                Instant Database Kubernetes Setup
              </h1>
            </div>
            <p className="text-muted-foreground">
              Generate ready-to-deploy Kubernetes manifests for your database.
            </p>
          </div>
        </div>

        <Alert className="border-primary/50 bg-primary/10">
          <Rocket className="h-4 w-4 text-primary" />
          <AlertDescription>
            <strong>How it works:</strong> Provide your schema and get full Kubernetes manifests including Deployment, Service, ConfigMaps, Secrets, and setup instructions.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-card-border bg-card/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-primary" />
                Configuration
              </CardTitle>
              <CardDescription>Provide your database schema and options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="database-type">Database Type</Label>
                <Select value={databaseType} onValueChange={setDatabaseType}>
                  <SelectTrigger id="database-type">
                    <SelectValue placeholder="Select database type" />
                  </SelectTrigger>
                  <SelectContent>
                    {databaseTypes.map(db => (
                      <SelectItem key={db.value} value={db.value}>{db.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schema">Database Schema</Label>
                <Textarea
                  id="schema"
                  placeholder={`Paste your ${databaseType || "database"} schema here...`}
                  value={schema}
                  onChange={e => setSchema(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sample-data"
                  checked={includeSampleData}
                  onCheckedChange={checked => setIncludeSampleData(checked as boolean)}
                />
                <Label htmlFor="sample-data" className="text-sm cursor-pointer">
                  Include sample data placeholders
                </Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !schema || !databaseType}
                className="w-full gap-2"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Container className="h-4 w-4" />
                    Generate Kubernetes Manifests
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-card-border bg-card/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                What You'll Get
              </CardTitle>
              <CardDescription>
                Complete Kubernetes setup ready to deploy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {["Deployment", "Service", "ConfigMap (optional)", "Secrets (optional)", "Setup Instructions"].map((title, index) => (
                  <motion.div key={title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{title}</h4>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {k8sConfig && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="border-card-border bg-card/80 backdrop-blur-xl">
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Kubernetes Configuration</CardTitle>
                  <CardDescription>Download manifests or copy to clipboard</CardDescription>
                </div>
                <Button onClick={handleDownloadAll} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download All Files
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="deployment" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 md:grid-cols-4">
                    <TabsTrigger value="deployment">Deployment</TabsTrigger>
                    <TabsTrigger value="service">Service</TabsTrigger>
                    {k8sConfig.configMap && <TabsTrigger value="configMap">ConfigMap</TabsTrigger>}
                    {k8sConfig.secrets && <TabsTrigger value="secrets">Secrets</TabsTrigger>}
                    <TabsTrigger value="instructions" className="hidden md:block">Instructions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="deployment">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold">Deployment</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopy(k8sConfig.deployment, "deployment.yaml")} className="gap-2">
                          {copiedFile === "deployment.yaml" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => downloadFile(k8sConfig.deployment, "deployment.yaml")} className="gap-2">
                          <Download className="h-4 w-4" /> Download
                        </Button>
                      </div>
                    </div>
                    <SyntaxHighlighter language="yaml" style={vscDarkPlus} className="rounded-lg text-sm">
                      {k8sConfig.deployment}
                    </SyntaxHighlighter>
                  </TabsContent>

                  <TabsContent value="service">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold">Service</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopy(k8sConfig.service, "service.yaml")} className="gap-2">
                          {copiedFile === "service.yaml" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => downloadFile(k8sConfig.service, "service.yaml")} className="gap-2">
                          <Download className="h-4 w-4" /> Download
                        </Button>
                      </div>
                    </div>
                    <SyntaxHighlighter language="yaml" style={vscDarkPlus} className="rounded-lg text-sm">
                      {k8sConfig.service}
                    </SyntaxHighlighter>
                  </TabsContent>

                  {k8sConfig.configMap && (
                    <TabsContent value="configMap">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold">ConfigMap</h3>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleCopy(k8sConfig.configMap!, "configmap.yaml")} className="gap-2">
                            {copiedFile === "configmap.yaml" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => downloadFile(k8sConfig.configMap!, "configmap.yaml")} className="gap-2">
                            <Download className="h-4 w-4" /> Download
                          </Button>
                        </div>
                      </div>
                      <SyntaxHighlighter language="yaml" style={vscDarkPlus} className="rounded-lg text-sm">
                        {k8sConfig.configMap}
                      </SyntaxHighlighter>
                    </TabsContent>
                  )}

                  {k8sConfig.secrets && (
                    <TabsContent value="secrets">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold">Secrets</h3>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleCopy(k8sConfig.secrets!, "secrets.yaml")} className="gap-2">
                            {copiedFile === "secrets.yaml" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => downloadFile(k8sConfig.secrets!, "secrets.yaml")} className="gap-2">
                            <Download className="h-4 w-4" /> Download
                          </Button>
                        </div>
                      </div>
                      <SyntaxHighlighter language="yaml" style={vscDarkPlus} className="rounded-lg text-sm">
                        {k8sConfig.secrets}
                      </SyntaxHighlighter>
                    </TabsContent>
                  )}

                  <TabsContent value="instructions">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold">Setup Instructions</h3>
                      <Button onClick={() => downloadFile(k8sConfig.instructions, "README.md")} className="gap-2">
                        <Download className="h-4 w-4" /> Download README
                      </Button>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none p-6 bg-muted/50 rounded-lg overflow-auto">
                      <pre className="whitespace-pre-wrap">{k8sConfig.instructions}</pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
