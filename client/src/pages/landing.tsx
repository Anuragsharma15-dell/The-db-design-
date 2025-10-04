import { Button } from "@/components/ui/button";
import { Database, Sparkles, Code2, Network, Zap, Shield, Boxes } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function Landing() {
  const [, navigate] = useLocation();

  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Generation",
      description: "Describe your database in plain English and let Llama AI generate optimized schemas instantly"
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Multi-Database Support",
      description: "Generate schemas for MySQL, PostgreSQL, MongoDB, SQLite, Oracle, and SQL Server"
    },
    {
      icon: <Network className="h-6 w-6" />,
      title: "Visual ERD Diagrams",
      description: "Auto-generate entity-relationship diagrams and export as PNG, PDF, or interactive components"
    },
    {
      icon: <Code2 className="h-6 w-6" />,
      title: "Multiple Export Formats",
      description: "Export as SQL, JSON, YAML, Prisma, TypeORM, Mongoose, and more"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Smart Optimization",
      description: "Get normalization suggestions and query optimization tips powered by AI"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Migration Scripts",
      description: "Auto-generate migration scripts and Docker configurations for instant deployment"
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm" data-testid="badge-ai-powered">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Powered by Cerebras Llama AI</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent" data-testid="text-hero-title">
              Create your databases like
              <br />
              <span className="text-primary">never before</span>
              <br />
              <span className="text-3xl md:text-5xl">and scale your app</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Design, visualize, and export production-ready database schemas using natural language.
              AI-powered optimization and beautiful visual diagrams.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                className="gap-2 text-lg px-8 py-6 hover-elevate active-elevate-2"
                onClick={() => navigate("/dashboard")}
                data-testid="button-get-started"
              >
                <Sparkles className="h-5 w-5" />
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-lg px-8 py-6 hover-elevate active-elevate-2"
                onClick={() => navigate("/new")}
                data-testid="button-try-demo"
              >
                <Code2 className="h-5 w-5" />
                Try Demo
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="group relative"
              >
                <div className="h-full p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-xl hover:bg-card/80 transition-all duration-300 hover-elevate">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-24 text-center"
          >
            <div className="inline-flex items-center gap-6 px-8 py-4 rounded-2xl bg-card/30 border border-border backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Boxes className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">6+ Databases</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">8+ Export Formats</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
