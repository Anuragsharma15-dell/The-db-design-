import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { cerebrasService } from "./cerebras";
import { dockerGeneratorService } from "./docker-generation";
import { insertProjectSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";


export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/projects", async (req, res, next) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/projects/:id", async (req, res, next) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/projects", async (req, res, next) => {
    try {
      const validationResult = insertProjectSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: fromError(validationResult.error).toString() 
        });
      }

      const project = await storage.createProject(validationResult.data);
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/projects/:id", async (req, res, next) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/projects/:id", async (req, res, next) => {
    try {
      const deleted = await storage.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/generate-schema", async (req, res, next) => {
    try {
      const { prompt, databaseType } = req.body;

      if (!prompt || !databaseType) {
        return res.status(400).json({ 
          message: "prompt and databaseType are required" 
        });
      }

      const result = await cerebrasService.generateSchema(prompt, databaseType);
      res.json(result);
    } catch (error: any) {
      console.error("Schema generation error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to generate schema" 
      });
    }
  });

  app.post("/api/optimize-schema", async (req, res, next) => {
    try {
      const { schema, databaseType } = req.body;

      if (!schema || !databaseType) {
        return res.status(400).json({ 
          message: "schema and databaseType are required" 
        });
      }

      const result = await cerebrasService.optimizeSchema(schema, databaseType);
      res.json(result);
    } catch (error: any) {
      console.error("Schema optimization error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to optimize schema" 
      });
    }
  });

  app.post("/api/generate-docker", async (req, res, next) => {
    try {
      const { databaseType, schema, includeSampleData } = req.body;

      if (!databaseType || !schema) {
        return res.status(400).json({ 
          message: "databaseType and schema are required" 
        });
      }

      const result = dockerGeneratorService.generateDockerConfiguration({
        type: databaseType,
        schema,
        includeSampleData: includeSampleData || false
      });
      
      res.json(result);
    } catch (error: any) {
      console.error("Docker generation error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to generate Docker configuration" 
      });
    }
  });
  app.post("/api/devops-chatbot", async (req, res, next) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ message: "message is required" });
      }

      const result = await cerebrasService.devOpsChatbotService(message);
      res.json(result);
    } catch (error: any) {
      console.error("DevOps chatbot error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to process message" 
      });
    }
  });


  app.post("/api/generate-docker", async (req, res, next) => {
    try {
      const { databaseType, schema, includeSampleData } = req.body;

      if (!databaseType || !schema) {
        return res.status(400).json({ 
          message: "databaseType and schema are required" 
        });
      }

      const result = dockerGeneratorService.generateDockerConfiguration({
        type: databaseType,
        schema,
        includeSampleData: includeSampleData || false
      });
      
      res.json(result);
    } catch (error: any) {
      console.error("Docker generation error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to generate Docker configuration" 
      });
    }
  });
  app.post("/api/gen-chat", async (req, res, next) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ message: "message is required" });
      }

     


      const result = await cerebrasService.Genchat(message);
      res.json(result);
    } catch (error: any) {
      console.error("DevOps chatbot error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to process message" 
      });
    }
  });

  app.post("/api/database-chat", async (req, res, next) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ message: "message is required" });
      }

     


      const result = await cerebrasService.DatabaseAdvisor(message);
      res.json(result);
    } catch (error: any) {
      console.error("Database  chatbot error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to process message" 
      });
    }
  });




   app.post("/api/ui-builder", async (req, res, next) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ message: "message is required" });
      }

     


      const result = await cerebrasService.Uichat(message);
      res.json(result);
    } catch (error: any) {
      console.error("UI chatbot error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to process message" 
      });
    }
  });

  app.post("/api/analyze-migration", async (req, res, next) => {
    try {
      const { migration, databaseType } = req.body;
      if (!migration || !databaseType) {
        return res.status(400).json({ message: "migration and databaseType are required" });
      }

      const result = await cerebrasService.analyzeMigration(migration, databaseType);
      res.json(result);
    } catch (error: any) {
      console.error("Migration analysis error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to analyze migration" 
      });
    }
  });

  app.post("/api/debug-cicd", async (req, res, next) => {
    try {
      const { logs, pipelineYaml } = req.body;
      if (!logs) {
        return res.status(400).json({ message: "logs are required" });
      }

      const result = await cerebrasService.debugCICD(logs, pipelineYaml);
      res.json(result);
    } catch (error: any) {
      console.error("CI/CD debug error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to debug CI/CD pipeline" 
      });
    }
  });

  app.post("/api/analyze-drift", async (req, res, next) => {
    try {
      const { desiredState, actualState, iacType } = req.body;
      if (!desiredState || !actualState || !iacType) {
        return res.status(400).json({ message: "desiredState, actualState, and iacType are required" });
      }

      const result = await cerebrasService.analyzeInfraDrift(desiredState, actualState, iacType);
      res.json(result);
    } catch (error: any) {
      console.error("Infra drift analysis error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to analyze infrastructure drift" 
      });
    }
  });

  

  const httpServer = createServer(app);

  return httpServer;
}
