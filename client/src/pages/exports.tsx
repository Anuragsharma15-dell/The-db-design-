import { useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Database } from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/empty-state";

// TODO: Remove mock data - replace with real data from backend
const mockExports = [
  {
    id: "1",
    projectName: "E-commerce Platform",
    format: "SQL",
    size: "4.2 KB",
    exportedAt: "2 hours ago",
  },
  {
    id: "2",
    projectName: "Social Media App",
    format: "MongoDB JSON",
    size: "6.8 KB",
    exportedAt: "1 day ago",
  },
  {
    id: "3",
    projectName: "Food Delivery Service",
    format: "Prisma",
    size: "3.1 KB",
    exportedAt: "3 days ago",
  },
];

export default function Exports() {
  const [exports] = useState(mockExports); // TODO: Replace with real state management

  const handleDownload = (exportId: string) => {
    console.log("Download export:", exportId);
    // TODO: Implement download functionality
  };

  if (exports.length === 0) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <EmptyState
          title="No exports yet"
          description="Export your database schemas to download them as SQL files, Prisma schemas, or MongoDB configurations."
          icon="database"
        />
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Exported Schemas</h1>
          <p className="text-muted-foreground mt-1">
            Download and manage your exported database schemas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exports.map((exportItem, index) => (
            <motion.div
              key={exportItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="border-card-border bg-card/80 backdrop-blur-xl hover-elevate" data-testid={`card-export-${exportItem.id}`}>
                <CardHeader className="space-y-0 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate" data-testid="text-export-project">
                        {exportItem.projectName}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {exportItem.exportedAt}
                      </p>
                    </div>
                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Format</span>
                    <Badge variant="outline" data-testid="badge-export-format">{exportItem.format}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Size</span>
                    <span className="font-mono">{exportItem.size}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t border-card-border">
                  <Button
                    variant="outline"
                    className="w-full gap-2 hover-elevate active-elevate-2"
                    onClick={() => handleDownload(exportItem.id)}
                    data-testid="button-download-export"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
