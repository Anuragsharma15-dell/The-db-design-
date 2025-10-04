import { useState, useMemo } from "react";
import { AIInput } from "@/components/ai-input";
import { SchemaOutput } from "@/components/schema-output";
import { ERDiagram } from "@/components/er-diagram";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Code2, Network, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { schemaToNodesAndEdges } from "@/lib/schema-to-diagram";

const DATABASE_TYPES = [
  { value: "PostgreSQL", label: "PostgreSQL" },
  { value: "MySQL", label: "MySQL" },
  { value: "MongoDB", label: "MongoDB" },
  { value: "SQLite", label: "SQLite" },
  { value: "Oracle", label: "Oracle" },
  { value: "SQL Server", label: "SQL Server" },
];



export default function NewSchema() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedSchema, setGeneratedSchema] = useState<any>(null);
  const [activeView, setActiveView] = useState<"code" | "diagram">("code");
  const [databaseType, setDatabaseType] = useState("PostgreSQL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const[Redirect,setRedirect]=useState("");

  const diagramData = useMemo(() => {
    if (!generatedSchema?.schemas?.sql) {
      return { nodes: [], edges: [] };
    }
    return schemaToNodesAndEdges(generatedSchema.schemas.sql);
  }, [generatedSchema]);

  const handleGenerate = async (userPrompt: string) => {
    setIsGenerating(true);
    setPrompt(userPrompt);
    
    try {
      const response = await fetch("/api/generate-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userPrompt,
          databaseType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate schema");
      }

      const result = await response.json();
      setGeneratedSchema(result);

      
      if (!title) {
        const words = userPrompt.split(" ").slice(0, 5).join(" ");
        setTitle(words.charAt(0).toUpperCase() + words.slice(1));
      }
      if (!description) {
        setDescription(userPrompt);
      }

      toast({
        title: "Schema generated!",
        description: "Your AI-powered database schema is ready",
      });
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedSchema || !title || !description) {
      toast({
        title: "Missing information",
        description: "Please provide a title and description",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          prompt,
          databaseType,
          schemas: generatedSchema.schemas,
          explanation: generatedSchema.explanation,
          normalizationSuggestions: generatedSchema.normalizationSuggestions,
          queryExamples: generatedSchema.queryExamples,
          migrationScript: generatedSchema.migrationScript,
          dockerfile: generatedSchema.dockerfile,
          dockerCompose: generatedSchema.dockerCompose,
        }),
      });
      toast({
        title: "Saved feature coming soon!",
        description: "this feature is under development. wait for next update!",
      });

      if (!response.ok) {
        throw new Error("Failed to save project");
      }

      
      setIsSaving(false);
      
     


    } catch (error) {
      
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">AI Schema Generator</h1>
            <p className="text-muted-foreground mt-1">
              Describe your database in natural language and let AI do the rest
            </p>
          </div>
          {generatedSchema && (
            <Button onClick={handleSave} disabled={isSaving} className="gap-2" data-testid="button-save-project">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Project"}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="rounded-2xl border border-card-border bg-card/80 backdrop-blur-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Database Configuration</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="database-type">Database Type</Label>
                  <Select value={databaseType} onValueChange={setDatabaseType}>
                    <SelectTrigger id="database-type" data-testid="select-database-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATABASE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {generatedSchema && (
                  <>
                    <div>
                      <Label htmlFor="project-title">Project Title</Label>
                      <Input
                        id="project-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="My Database Project"
                        data-testid="input-project-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="project-description">Description</Label>
                      <Input
                        id="project-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="A brief description of your project"
                        data-testid="input-project-description"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <AIInput onGenerate={handleGenerate} isGenerating={isGenerating} />
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {generatedSchema ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "code" | "diagram")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="code" className="gap-2" data-testid="tab-code-view">
                        <Code2 className="h-4 w-4" />
                        Code
                      </TabsTrigger>
                      <TabsTrigger value="diagram" className="gap-2" data-testid="tab-diagram-view">
                        <Network className="h-4 w-4" />
                        Diagram
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="code" className="mt-6">
                      <SchemaOutput {...generatedSchema} />
                    </TabsContent>
                    <TabsContent value="diagram" className="mt-6">
                      <ERDiagram 
                        initialNodes={diagramData.nodes} 
                        initialEdges={diagramData.edges} 
                      />
                    </TabsContent>
                  </Tabs>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-96 rounded-2xl border-2 border-dashed border-border bg-card/30 backdrop-blur-sm"
                >
                  <p className="text-muted-foreground">Your generated schema will appear here</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


     