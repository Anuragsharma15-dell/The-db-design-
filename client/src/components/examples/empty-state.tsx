import { EmptyState } from "../empty-state";

export default function EmptyStateExample() {
  return (
    <div className="p-6">
      <EmptyState
        title="No projects yet"
        description="Create your first AI-powered database schema to get started. Just describe what you need in natural language."
        actionLabel="Create First Schema"
        onAction={() => console.log("Create schema clicked")}
        icon="sparkles"
      />
    </div>
  );
}
