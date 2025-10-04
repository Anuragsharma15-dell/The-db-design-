import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Database, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  databaseType: "PostgreSQL" | "MongoDB" | "MySQL";
  createdAt: string;
  tableCount: number;
  onEdit?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
}

const dbTypeColors = {
  PostgreSQL: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  MongoDB: "bg-green-500/10 text-green-600 dark:text-green-400",
  MySQL: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

export function ProjectCard({
  title,
  description,
  databaseType,
  createdAt,
  tableCount,
  onEdit,
  onExport,
  onDelete,
}: ProjectCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="overflow-hidden border-card-border bg-card/80 backdrop-blur-xl hover-elevate" data-testid={`card-project-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate" data-testid="text-project-title">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {description}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-project-menu">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit} data-testid="button-edit-project">
                Edit Schema
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExport} data-testid="button-export-project">
                Export
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive" data-testid="button-delete-project">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              <span>{tableCount} tables</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{createdAt}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-3 border-t border-card-border">
          <Badge className={`${dbTypeColors[databaseType]} border-0`} data-testid="badge-database-type">
            {databaseType}
          </Badge>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
