import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIInputProps {
  onGenerate: (prompt: string) => void;
  isGenerating?: boolean;
}

const examplePrompts = [
  "Build me a food delivery app schema",
  "E-commerce platform with multi-vendor support",
  "Social media app with posts, comments, and likes",
  "Task management system with teams and projects",
];

export function AIInput({ onGenerate, isGenerating = false }: AIInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="relative">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your database schema in natural language..."
          className="min-h-32 resize-none border-2 border-input bg-background/50 backdrop-blur-sm text-base pr-12"
          data-testid="input-ai-prompt"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSubmit();
            }
          }}
        />
        <div className="absolute right-3 top-3">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-lg border-2 border-primary animate-pulse pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {examplePrompts.slice(0, 2).map((example, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setPrompt(example)}
              className="text-xs hover-elevate active-elevate-2"
              data-testid={`button-example-${index}`}
            >
              {example}
            </Button>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!prompt.trim() || isGenerating}
          className="gap-2"
          size="lg"
          data-testid="button-generate-schema"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Schema
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Cmd/Ctrl + Enter</kbd> to generate
      </p>
    </motion.div>
  );
}
