import { AIInput } from "../ai-input";
import { useState } from "react";

export default function AIInputExample() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (prompt: string) => {
    console.log("Generating schema for:", prompt);
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  return (
    <div className="p-6 max-w-4xl">
      <AIInput onGenerate={handleGenerate} isGenerating={isGenerating} />
    </div>
  );
}
