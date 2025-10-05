import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project-card";
import { EmptyState } from "@/components/empty-state";
import { Sparkles, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  description: string;
  databaseType: string;
  createdAt: string;
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to load projects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
     
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete project");
      
      setProjects(projects.filter(p => p.id !== id));
      toast({
        title: "Project deleted",
        description: "The project has been removed successfully",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Could not delete the project",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Your Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your database schemas
            </p>
          </div>
          <Button
            size="lg"
            className="gap-2"
            onClick={() => navigate("/new")}
            data-testid="button-new-schema"
          >
            <Sparkles className="h-4 w-4" />
            New Schema
          </Button>
        </div>

        {projects.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 max-w-md"
              data-testid="input-search-projects"
            />
          </div>
        )}

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                title={project.title}
                description={project.description}
                databaseType={project.databaseType as any}
                createdAt={formatDate(project.createdAt)}
                tableCount={0}
                onEdit={() => navigate(`/edit/${project.id}`)}
                onExport={() => navigate(`/exports?project=${project.id}`)}
                onDelete={() => handleDelete(project.id)}
              />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects match your search</p>
          </div>
        ) : (
          <EmptyState
            title="No projects yet"
            description="Create your first AI-powered database schema to get started. Just describe what you need in natural language."
            actionLabel="Create First Schema"
            onAction={() => navigate("/new")}
            icon="sparkles"
          />
        )}
      </motion.div>
    </div>
  );
}