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

interface DockerFile {
  name: string;
  content: string;
  path?: string;
}

interface DockerConfig {
  dockerfile: string;
  dockerCompose: string;
  files: DockerFile[];
  instructions: string;
  dockerRunCommand: string;
}

export default function DockerExport() {
  const { toast } = useToast();
  const [schema, setSchema] = useState("");
  const [databaseType, setDatabaseType] = useState<string>("");
  const [includeSampleData, setIncludeSampleData] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dockerConfig, setDockerConfig] = useState<DockerConfig | null>(null);
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
      const response = await fetch("/api/generate-docker", {
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

      if (!response.ok) {
        throw new Error("Failed to generate Docker configuration");
      }

      const result = await response.json();
      setDockerConfig(result);
      
      toast({
        title: "Docker Configuration Generated!",
        description: "Your database-in-a-box is ready to download.",
      });
    } catch (error) {
      console.error("Error generating Docker config:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate Docker configuration. Please try again.",
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
      title: "Copied to Clipboard",
      description: `${fileName} copied successfully.`
    });
  };

  const handleDownloadAll = () => {
    if (!dockerConfig) return;

    const allFiles = [
      { name: "Dockerfile", content: dockerConfig.dockerfile },
      { name: "docker-compose.yml", content: dockerConfig.dockerCompose },
      ...dockerConfig.files.map(f => ({
        name: f.path ? `${f.path}${f.name}` : f.name,
        content: f.content
      })),
      { name: "README.md", content: dockerConfig.instructions }
    ];

    allFiles.forEach(file => {
      const blob = new Blob([file.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    toast({
      title: "Downloaded Successfully",
      description: `All Docker files have been downloaded. ${dockerConfig.files.length > 1 ? 'Note: Create the init-db folder for initialization files.' : ''}`
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

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Container className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">
                Instant Database-in-a-Box
              </h1>
            </div>
            <p className="text-muted-foreground">
              Generate ready-to-run Docker images with your database schema pre-configured.
              Perfect for quick development setup, testing, or sharing with your team.
            </p>
          </div>
        </div>

        <Alert className="border-primary/50 bg-primary/10">
          <Rocket className="h-4 w-4 text-primary" />
          <AlertDescription>
            <strong>How it works:</strong> Provide your database schema, and we'll generate a complete Docker setup including
            Dockerfile, docker-compose.yml, initialization scripts, and instructions. No Docker knowledge required!
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-card-border bg-card/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-primary" />
                Configuration
              </CardTitle>
              <CardDescription>
                Provide your database schema and select options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="database-type">Database Type</Label>
                <Select value={databaseType} onValueChange={setDatabaseType}>
                  <SelectTrigger id="database-type">
                    <SelectValue placeholder="Select database type" />
                  </SelectTrigger>
                  <SelectContent>
                    {databaseTypes.map((db) => (
                      <SelectItem key={db.value} value={db.value}>
                        {db.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schema">Database Schema</Label>
                <Textarea
                  id="schema"
                  placeholder={`Paste your ${databaseType || "database"} schema here...

Example for PostgreSQL:
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
                  value={schema}
                  onChange={(e) => setSchema(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sample-data"
                  checked={includeSampleData}
                  onCheckedChange={(checked) => setIncludeSampleData(checked as boolean)}
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
                    Generate Docker Setup
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
                Complete Docker environment ready to use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  {
                    title: "Dockerfile",
                    description: "Container image definition with all dependencies"
                  },
                  {
                    title: "docker-compose.yml",
                    description: "Complete stack configuration for easy deployment"
                  },
                  {
                    title: "Init Scripts",
                    description: "Database schema automatically applied on startup"
                  },
                  {
                    title: "Setup Instructions",
                    description: "Step-by-step guide to get your database running"
                  },
                  {
                    title: "Quick Start Commands",
                    description: "Ready-to-use commands for instant deployment"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {dockerConfig && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-card-border bg-card/80 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Generated Docker Configuration</CardTitle>
                    <CardDescription>
                      Download files or copy to clipboard
                    </CardDescription>
                  </div>
                  <Button onClick={handleDownloadAll} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download All Files
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="dockerfile" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 md:grid-cols-4">
                    <TabsTrigger value="dockerfile">Dockerfile</TabsTrigger>
                    <TabsTrigger value="compose">docker-compose</TabsTrigger>
                    <TabsTrigger value="files">Init Files</TabsTrigger>
                    <TabsTrigger value="commands">Commands</TabsTrigger>
                    <TabsTrigger value="instructions" className="hidden md:block">Instructions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="dockerfile" className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold">Dockerfile</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(dockerConfig.dockerfile, "Dockerfile")}
                          className="gap-2"
                        >
                          {copiedFile === "Dockerfile" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(dockerConfig.dockerfile, "Dockerfile")}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <SyntaxHighlighter
                      language="dockerfile"
                      style={vscDarkPlus}
                      className="rounded-lg text-sm"
                    >
                      {dockerConfig.dockerfile}
                    </SyntaxHighlighter>
                  </TabsContent>

                  <TabsContent value="compose" className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold">docker-compose.yml</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(dockerConfig.dockerCompose, "docker-compose.yml")}
                          className="gap-2"
                        >
                          {copiedFile === "docker-compose.yml" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(dockerConfig.dockerCompose, "docker-compose.yml")}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <SyntaxHighlighter
                      language="yaml"
                      style={vscDarkPlus}
                      className="rounded-lg text-sm"
                    >
                      {dockerConfig.dockerCompose}
                    </SyntaxHighlighter>
                  </TabsContent>

                  <TabsContent value="files" className="space-y-6">
                    {dockerConfig.files.map((file, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-sm font-semibold">
                              {file.path}{file.name}
                            </h3>
                            {file.path && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Create in: {file.path} folder
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(file.content, file.name)}
                              className="gap-2"
                            >
                              {copiedFile === file.name ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadFile(file.content, file.name)}
                              className="gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </div>
                        <SyntaxHighlighter
                          language={
                            file.name.endsWith('.js') ? 'javascript' :
                            file.name.endsWith('.sh') ? 'bash' :
                            file.name.endsWith('.sql') ? 'sql' : 'text'
                          }
                          style={vscDarkPlus}
                          className="rounded-lg text-sm"
                        >
                          {file.content}
                        </SyntaxHighlighter>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="commands" className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold">Quick Start Commands</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(dockerConfig.dockerRunCommand, "commands")}
                        className="gap-2"
                      >
                        {copiedFile === "commands" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        Copy
                      </Button>
                    </div>
                    <SyntaxHighlighter
                      language="bash"
                      style={vscDarkPlus}
                      className="rounded-lg text-sm"
                    >
                      {dockerConfig.dockerRunCommand}
                    </SyntaxHighlighter>
                  </TabsContent>

                  <TabsContent value="instructions" className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold">Setup Instructions</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(dockerConfig.instructions, "README.md")}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download README
                      </Button>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none p-6 bg-muted/50 rounded-lg overflow-auto">
                      <pre className="whitespace-pre-wrap">{dockerConfig.instructions}</pre>
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
