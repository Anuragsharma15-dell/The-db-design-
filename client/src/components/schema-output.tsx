  /* import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Download, Check, Lightbulb, Code as CodeIcon, FileCode } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

 export interface SchemaOutputProps {
  schemas: {
     sql: "CREATE TABLE ...",
    mysql: "CREATE TABLE ...",
    sqlite: "",
    oracle: "",
    sqlserver: "",
    prisma: "",
    typeorm: "",
    mongoose: "",
    sequelize: "",
    language?: string;
    extension?: string;
   label?: string;
    
  };
  explanation: string;
  normalizationSuggestions?: string;
  queryExamples?: Array<{ name: string; description: string; query: string }>;
  migrationScript?: string;
  dockerfile?: string;
  dockerCompose?: string;
  
}

export function SchemaOutput({
  schemas,
  explanation,
  normalizationSuggestions,
  queryExamples,
  migrationScript,
  dockerfile,
  dockerCompose,
}: SchemaOutputProps) {
  const [activeTab, setActiveTab] = useState("sql");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

   const schemaOptions = {
    sql: { code: schemas.sql, language: "sql", label: "PostgreSQL", extension: "sql" },
    mysql: { code: schemas.mysql, language: "mysql", label: "MySQL", extension: "sql" },
    sqlite: { code: schemas.sqlite, language: "sqllite", label: "SQLite", extension: "sql" },
    oracle: { code: schemas.oracle, language: "oracle", label: "Oracle", extension: "sql" },
    sqlserver: { code: schemas.sqlserver, language: "sqlserver", label: "SQL Server", extension: "sql" },
    prisma: { code: schemas.prisma, language: "typescript", label: "Prisma", extension: "prisma" },
    typeorm: { code: schemas.typeorm, language: "typescript", label: "TypeORM", extension: "ts" },
    mongoose: { code: schemas.mongoose, language: "javascript", label: "Mongoose", extension: "js" },
    sequelize: { code: schemas.sequelize, language: "javascript", label: "Sequelize", extension: "js" },
  };

  const handleCopy = () => {
    const currentSchema = schemaOptions[activeTab as keyof typeof schemaOptions];
    navigator.clipboard.writeText(currentSchema.code);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: `${currentSchema.label} schema copied successfully`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const currentSchema = schemaOptions[activeTab as keyof typeof schemaOptions];
    const blob = new Blob([currentSchema.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schema.${currentSchema.extension}`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded",
      description: `Schema downloaded as ${a.download}`,
    });
  };

  const exportAsJSON = () => {
    const data = JSON.stringify({ schemas, explanation, normalizationSuggestions, queryExamples, migrationScript }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schema.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported as JSON", description: "Schema exported successfully" });
  };

  const exportAsYAML = () => {
    const yaml = Object.entries(schemas).map(([key, value]) => `${key}:\n  ${value.split('\n').join('\n  ')}`).join('\n\n');
    const blob = new Blob([yaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schema.yaml";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported as YAML", description: "Schema exported successfully" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="space-y-4"
    >
      <div className="rounded-2xl border border-card-border bg-card/80 backdrop-blur-xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xl font-semibold">Generated Schema</h3>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2 hover-elevate active-elevate-2"
              data-testid="button-copy-schema"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2 hover-elevate active-elevate-2"
              data-testid="button-download-schema"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsJSON}
              className="gap-2 hover-elevate active-elevate-2"
            >
              <FileCode className="h-4 w-4" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsYAML}
              className="gap-2 hover-elevate active-elevate-2"
            >
              <FileCode className="h-4 w-4" />
              YAML
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9" data-testid="tabs-schema-type">
            <TabsTrigger value="sql">PostgreSQL</TabsTrigger>
            <TabsTrigger value="mysql">MySQL</TabsTrigger>
            <TabsTrigger value="sqlite">SQLite</TabsTrigger>
            <TabsTrigger value="oracle">Oracle</TabsTrigger>
            <TabsTrigger value="sqlserver">SQL Server</TabsTrigger>
            <TabsTrigger value="prisma">Prisma</TabsTrigger>
            <TabsTrigger value="typeorm">TypeORM</TabsTrigger>
            <TabsTrigger value="mongoose">Mongoose</TabsTrigger>
            <TabsTrigger value="sequelize">Sequelize</TabsTrigger>
          </TabsList>
          {Object.entries(schemaOptions).map(([key, { code, language }]) => (
            <TabsContent key={key} value={key} className="mt-4">
              <div className="rounded-lg overflow-hidden border border-border">
                <SyntaxHighlighter
                  language={language}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    fontSize: "0.875rem",
                    maxHeight: "400px",
                  }}
                  data-testid="code-schema-output"
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="rounded-2xl border border-card-border bg-card/80 backdrop-blur-xl p-6">
        <h4 className="text-lg font-semibold mb-3">AI Explanation</h4>
        <p className="text-muted-foreground leading-relaxed" data-testid="text-schema-explanation">
          {explanation}
        </p>
      </div>

      {normalizationSuggestions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Normalization Suggestions
            </CardTitle>
            <CardDescription>AI-powered optimization recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{normalizationSuggestions}</p>
          </CardContent>
        </Card>
      )}

      {queryExamples && queryExamples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CodeIcon className="h-5 w-5 text-primary" />
              Common Query Examples
            </CardTitle>
            <CardDescription>Pre-generated queries for common operations</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {queryExamples.map((example, index) => (
                <AccordionItem key={index} value={`query-${index}`}>
                  <AccordionTrigger>{example.name}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-2">{example.description}</p>
                    <div className="rounded-lg overflow-hidden border border-border">
                      <SyntaxHighlighter language="sql" style={vscDarkPlus} customStyle={{ margin: 0, fontSize: "0.875rem" }}>
                        {example.query}
                      </SyntaxHighlighter>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {migrationScript && (
        <Card>
          <CardHeader>
            <CardTitle>Migration Script</CardTitle>
            <CardDescription>Script to migrate or alter your database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden border border-border">
              <SyntaxHighlighter language="sql" style={vscDarkPlus} customStyle={{ margin: 0, fontSize: "0.875rem" }}>
                {migrationScript}
              </SyntaxHighlighter>
            </div>
          </CardContent>
        </Card>
      )}

      {dockerfile && dockerCompose && (
        <Card>
          <CardHeader>
            <CardTitle>Docker Configuration</CardTitle>
            <CardDescription>Ready-to-use Docker setup for instant deployment</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="dockerfile">
              <TabsList>
                <TabsTrigger value="dockerfile">Dockerfile</TabsTrigger>
                <TabsTrigger value="compose">docker-compose.yml</TabsTrigger>
              </TabsList>
              <TabsContent value="dockerfile" className="mt-4">
                <div className="rounded-lg overflow-hidden border border-border">
                  <SyntaxHighlighter language="docker" style={vscDarkPlus} customStyle={{ margin: 0, fontSize: "0.875rem" }}>
                    {dockerfile}
                  </SyntaxHighlighter>
                </div>
              </TabsContent>
              <TabsContent value="compose" className="mt-4">
                <div className="rounded-lg overflow-hidden border border-border">
                  <SyntaxHighlighter language="yaml" style={vscDarkPlus} customStyle={{ margin: 0, fontSize: "0.875rem" }}>
                    {dockerCompose}
                  </SyntaxHighlighter>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

; */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Download, Check, Lightbulb, Code as CodeIcon, FileCode } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface SchemaOutputProps {
  schemas: {
    sql: string;
    mysql: string;
    sqlite: string;
    oracle: string;
    sqlserver: string;
    prisma: string;
    typeorm: string;
    mongoose: string;
    sequelize: string;
  };
  explanation: string;
  normalizationSuggestions?: string;
  queryExamples?: Array<{ name: string; description: string; query: string }>;
  migrationScript?: string;
  dockerfile?: string;
  dockerCompose?: string;
}

export function SchemaOutput({
  schemas = {
    sql: "",
    mysql: "",
    sqlite: "",
    oracle: "",
    sqlserver: "",
    prisma: "",
    typeorm: "",
    mongoose: "",
    sequelize: "",
  },
  explanation,
  normalizationSuggestions,
  queryExamples,
  migrationScript,
  dockerfile,
  dockerCompose,
}: SchemaOutputProps) {
  const [activeTab, setActiveTab] = useState("sql");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const schemaOptions = {
    sql: { code: schemas.sql, language: "sql", label: "PostgreSQL", extension: "sql" },
    mysql: { code: schemas.mysql, language: "mysql", label: "MySQL", extension: "sql" },
    sqlite: { code: schemas.sqlite, language: "sql", label: "SQLite", extension: "sql" },
    oracle: { code: schemas.oracle, language: "sql", label: "Oracle", extension: "sql" },
    sqlserver: { code: schemas.sqlserver, language: "sql", label: "SQL Server", extension: "sql" },
    prisma: { code: schemas.prisma, language: "typescript", label: "Prisma", extension: "prisma" },
    typeorm: { code: schemas.typeorm, language: "typescript", label: "TypeORM", extension: "ts" },
    mongoose: { code: schemas.mongoose, language: "javascript", label: "Mongoose", extension: "js" },
    sequelize: { code: schemas.sequelize, language: "javascript", label: "Sequelize", extension: "js" },
  };

  const handleCopy = () => {
    const currentSchema = schemaOptions[activeTab as keyof typeof schemaOptions];
    navigator.clipboard.writeText(currentSchema.code || "");
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: `${currentSchema.label} schema copied successfully`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const currentSchema = schemaOptions[activeTab as keyof typeof schemaOptions];
    const blob = new Blob([currentSchema.code || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schema.${currentSchema.extension}`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded",
      description: `Schema downloaded as ${a.download}`,
    });
  };

  const exportAsJSON = () => {
    const data = JSON.stringify({ schemas, explanation, normalizationSuggestions, queryExamples, migrationScript }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schema.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported as JSON", description: "Schema exported successfully" });
  };

  const exportAsYAML = () => {
    const yaml = Object.entries(schemas)
      .map(([key, value]) => `${key}:\n  ${(value || "").split("\n").join("\n  ")}`)
      .join("\n\n");
    const blob = new Blob([yaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schema.yaml";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported as YAML", description: "Schema exported successfully" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="space-y-4"
    >
      <div className="rounded-2xl border border-card-border bg-card/80 backdrop-blur-xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xl font-semibold">Generated Schema</h3>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2 hover-elevate active-elevate-2"
              data-testid="button-copy-schema"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2 hover-elevate active-elevate-2"
              data-testid="button-download-schema"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsJSON}
              className="gap-2 hover-elevate active-elevate-2"
            >
              <FileCode className="h-4 w-4" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsYAML}
              className="gap-2 hover-elevate active-elevate-2"
            >
              <FileCode className="h-4 w-4" />
              YAML
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9" data-testid="tabs-schema-type">
            <TabsTrigger value="sql">PostgreSQL</TabsTrigger>
            <TabsTrigger value="mysql">MySQL</TabsTrigger>
            <TabsTrigger value="sqlite">SQLite</TabsTrigger>
            <TabsTrigger value="oracle">Oracle</TabsTrigger>
            <TabsTrigger value="sqlserver">SQL Server</TabsTrigger>
            <TabsTrigger value="prisma">Prisma</TabsTrigger>
            <TabsTrigger value="typeorm">TypeORM</TabsTrigger>
            <TabsTrigger value="mongoose">Mongoose</TabsTrigger>
            <TabsTrigger value="sequelize">Sequelize</TabsTrigger>
          </TabsList>
          {Object.entries(schemaOptions).map(([key, { code, language }]) => (
            <TabsContent key={key} value={key} className="mt-4">
              <div className="rounded-lg overflow-hidden border border-border">
                <SyntaxHighlighter
                  language={language}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    fontSize: "0.875rem",
                    maxHeight: "400px",
                  }}
                  data-testid="code-schema-output"
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="rounded-2xl border border-card-border bg-card/80 backdrop-blur-xl p-6">
        <h4 className="text-lg font-semibold mb-3">AI Explanation</h4>
        <p className="text-muted-foreground leading-relaxed" data-testid="text-schema-explanation">
          {explanation}
        </p>
      </div>

      {normalizationSuggestions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Normalization Suggestions
            </CardTitle>
            <CardDescription>AI-powered optimization recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{normalizationSuggestions}</p>
          </CardContent>
        </Card>
      )}

      {queryExamples && queryExamples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CodeIcon className="h-5 w-5 text-primary" />
              Common Query Examples
            </CardTitle>
            <CardDescription>Pre-generated queries for common operations</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {queryExamples.map((example, index) => (
                <AccordionItem key={index} value={`query-${index}`}>
                  <AccordionTrigger>{example.name}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-2">{example.description}</p>
                    <div className="rounded-lg overflow-hidden border border-border">
                      <SyntaxHighlighter language="sql" style={vscDarkPlus} customStyle={{ margin: 0, fontSize: "0.875rem" }}>
                        {example.query}
                      </SyntaxHighlighter>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {migrationScript && (
        <Card>
          <CardHeader>
            <CardTitle>Migration Script</CardTitle>
            <CardDescription>Script to migrate or alter your database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden border border-border">
              <SyntaxHighlighter language="sql" style={vscDarkPlus} customStyle={{ margin: 0, fontSize: "0.875rem" }}>
                {migrationScript}
              </SyntaxHighlighter>
            </div>
          </CardContent>
        </Card>
      )}

      {dockerfile && dockerCompose && (
        <Card>
          <CardHeader>
            <CardTitle>Docker Configuration</CardTitle>
            <CardDescription>Ready-to-use Docker setup for instant deployment</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="dockerfile">
              <TabsList>
                <TabsTrigger value="dockerfile">Dockerfile</TabsTrigger>
                <TabsTrigger value="compose">docker-compose.yml</TabsTrigger>
              </TabsList>
              <TabsContent value="dockerfile" className="mt-4">
                <div className="rounded-lg overflow-hidden border border-border">
                  <SyntaxHighlighter language="docker" style={vscDarkPlus} customStyle={{ margin: 0, fontSize: "0.875rem" }}>
                    {dockerfile}
                  </SyntaxHighlighter>
                </div>
              </TabsContent>
              <TabsContent value="compose" className="mt-4">
                <div className="rounded-lg overflow-hidden border border-border">
                  <SyntaxHighlighter language="yaml" style={vscDarkPlus} customStyle={{ margin: 0, fontSize: "0.875rem" }}>
                    {dockerCompose}
                  </SyntaxHighlighter>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

