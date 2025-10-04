import { Database, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: "database" | "sparkles";
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = "database",
}: EmptyStateProps) {
  const Icon = icon === "database" ? Database : Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 backdrop-blur-sm p-8 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-6">
            <Icon className="h-12 w-12 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold" data-testid="text-empty-title">{title}</h3>
          <p className="text-muted-foreground" data-testid="text-empty-description">{description}</p>
        </div>
        {actionLabel && onAction && (
          <Button onClick={onAction} size="lg" className="gap-2" data-testid="button-empty-action">
            <Sparkles className="h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
