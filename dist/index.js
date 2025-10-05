var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import dotenv3 from "dotenv";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  collaborationSessions: () => collaborationSessions,
  insertProjectSchema: () => insertProjectSchema,
  insertUserSchema: () => insertUserSchema,
  projects: () => projects,
  selectProjectSchema: () => selectProjectSchema,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  prompt: text("prompt").notNull(),
  databaseType: varchar("database_type", { length: 50 }).notNull(),
  schemas: jsonb("schemas").notNull().$type(),
  explanation: text("explanation").notNull(),
  normalizationSuggestions: text("normalization_suggestions"),
  queryExamples: jsonb("query_examples").$type(),
  migrationScript: text("migration_script"),
  dockerfile: text("dockerfile"),
  dockerCompose: text("docker_compose"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var collaborationSessions = pgTable("collaboration_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(),
  username: text("username").notNull(),
  cursorPosition: jsonb("cursor_position").$type(),
  isActive: boolean("is_active").default(true).notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var selectProjectSchema = createSelectSchema(projects);

// server/db.ts
import dotenv from "dotenv";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
dotenv.config();
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc } from "drizzle-orm";
var DbStorage = class {
  async getUser(id) {
    const result = await db.query.users.findFirst({
      where: (users2, { eq: eq2 }) => eq2(users2.id, id)
    });
    return result;
  }
  async getUserByUsername(username) {
    const result = await db.query.users.findFirst({
      where: (users2, { eq: eq2 }) => eq2(users2.username, username)
    });
    return result;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async getAllProjects() {
    const result = await db.select().from(projects).orderBy(desc(projects.createdAt));
    return result;
  }
  async getProject(id) {
    const result = await db.query.projects.findFirst({
      where: (projects2, { eq: eq2 }) => eq2(projects2.id, id)
    });
    return result;
  }
  async createProject(project) {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }
  async updateProject(id, projectUpdate) {
    const [updated] = await db.update(projects).set({ ...projectUpdate, updatedAt: /* @__PURE__ */ new Date() }).where(eq(projects.id, id)).returning();
    return updated;
  }
  async deleteProject(id) {
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }
};
var storage = new DbStorage();

// server/cerebras.ts
import dotenv2 from "dotenv";
dotenv2.config();
var CerebrasService = class {
  apiKey;
  baseUrl = "https://api.cerebras.ai/v1";
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  async generateSchema(prompt, databaseType) {
    const systemPrompt = `You are an expert database architect. Generate comprehensive database schemas based on user requirements.

For each request:
1. Create optimized schemas for multiple database systems (PostgreSQL, MySQL, MongoDB, SQLite, Oracle, SQL Server)
2. Generate ORM schemas (Prisma, TypeORM, Mongoose, Sequelize)
3. Provide detailed explanation of design decisions
4. Suggest normalization improvements
5. Generate common query examples
6. Create migration scripts
7. Provide Dockerfile and docker-compose.yml for easy deployment

Respond ONLY with valid JSON in this exact format:
{
  "schemas": {
    "sql": "PostgreSQL schema",
    "mysql": "MySQL schema",
    "oracle": "Oracle schema",
    "sqlserver": "SQL Server schema",
    "sqlite": "SQLite schema",
    "prisma": "Prisma schema",
    "typeorm": "TypeORM entities",
    "mongoose": "Mongoose schemas",
    "sequelize": "Sequelize models"
  },
  "explanation": "Detailed explanation",
  "normalizationSuggestions": "Suggestions for normalization",
  "queryExamples": [{"name": "query name", "description": "what it does", "query": "SQL query"}],
  "migrationScript": "ALTER TABLE migration script",
  "dockerfile": "Dockerfile content",
  "dockerCompose": "docker-compose.yml content"
}`;
    const userPrompt = `Generate a ${databaseType} database schema for: ${prompt}

Requirements:
- Design for scalability and performance
- Follow database normalization best practices
- Include proper indexes, constraints, and relationships
- Provide realistic field types and constraints
- Generate all schema formats requested`;
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages,
        temperature: 0.7,
        max_tokens: 8e3
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cerebras API error: ${response.status} - ${error}`);
    }
    const data = await response.json();
    const content = data.choices[0].message.content;
    try {
      const markdownMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      let jsonString = markdownMatch ? markdownMatch[1] : content;
      if (!markdownMatch) {
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        jsonString = jsonMatch[0];
      }
      jsonString = jsonString.replace(/`([\s\S]*?)`/g, (match, p1) => {
        const escaped = p1.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
        return `"${escaped}"`;
      });
      const result = JSON.parse(jsonString);
      return result;
    } catch (parseError) {
      console.error("Failed to parse Cerebras response:", content);
      throw new Error("Failed to parse AI response. Please try again.");
    }
  }
  async optimizeSchema(schema, databaseType) {
    const messages = [
      {
        role: "system",
        content: "You are a database optimization expert. Analyze schemas and provide optimization suggestions."
      },
      {
        role: "user",
        content: `Analyze and optimize this ${databaseType} schema:

${schema}

Provide:
1. Optimized version
2. Detailed suggestions for improvements

Respond in JSON: {"optimizedSchema": "...", "suggestions": "..."}`
      }
    ];
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages,
        temperature: 0.5,
        max_tokens: 4e3
      })
    });
    if (!response.ok) {
      throw new Error(`Cerebras API error: ${response.status}`);
    }
    const data = await response.json();
    const content = data.choices[0].message.content;
    try {
      const markdownMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      let jsonString = markdownMatch ? markdownMatch[1] : content;
      if (!markdownMatch) {
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        jsonString = jsonMatch[0];
      }
      jsonString = jsonString.replace(/`([\s\S]*?)`/g, (match, p1) => {
        const escaped = p1.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
        return `"${escaped}"`;
      });
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse optimization response:", content);
      throw new Error("Failed to parse AI response. Please try again.");
    }
  }
  async devOpsChatbotService(message) {
    const messages = [
      {
        role: "system",
        content: "You are a helpful DevOps assistant. Provide expert advice on DevOps practices, CI/CD, containers, Kubernetes, infrastructure as code, monitoring, and more."
      },
      {
        role: "user",
        content: message
      }
    ];
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages,
        temperature: 0.7,
        max_tokens: 4e3
      })
    });
    if (!response.ok) {
      throw new Error(`Cerebras API error: ${response.status}`);
    }
    const data = await response.json();
    const content = data.choices[0].message.content;
    return { response: content };
  }
  async Genchat(message) {
    const messages = [
      {
        role: "system",
        content: "You are a helpful gen-ai AI assistant. Provide expert advice on a wide range of topics like generative-ai , langchain , Rag , Vector-databases and everything about gen-ai."
      },
      {
        role: "user",
        content: message
      }
    ];
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages,
        temperature: 0.7,
        max_tokens: 4e3
      })
    });
    if (!response.ok) {
      throw new Error(`Cerebras API error: ${response.status}`);
    }
    const data = await response.json();
    const content = data.choices[0].message.content;
    return { response: content };
  }
  async Uichat(message) {
    const messages = [
      {
        role: "system",
        content: "You are a helpful UI-builder  AI assistant. you Provide code for frontend for react, tailwind , framer-motion and typescript, javascript example=> user gives you a database schema and you give frontend code for the schema like for profile schema you give  code of profile page ."
      },
      {
        role: "user",
        content: message
      }
    ];
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages,
        temperature: 0.7,
        max_tokens: 4e3
      })
    });
    if (!response.ok) {
      throw new Error(`Cerebras API error: ${response.status}`);
    }
    const data = await response.json();
    const content = data.choices[0].message.content;
    return { response: content };
  }
  async DatabaseAdvisor(message) {
    const messages = [
      {
        role: "system",
        content: "You are a helpful Database Advisor  AI assistant. you Provide expert advice on database design, optimization, query writing, normalization, indexing, and best practices for SQL and NoSQL databases."
      },
      {
        role: "user",
        content: message
      }
    ];
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages,
        temperature: 0.7,
        max_tokens: 4e3
      })
    });
    if (!response.ok) {
      throw new Error(`Cerebras API error: ${response.status}`);
    }
    const data = await response.json();
    const content = data.choices[0].message.content;
    return { response: content };
  }
  async analyzeMigration(migration, databaseType) {
    const systemPrompt = `You are a database migration safety expert. Analyze SQL migrations and identify potential issues like table locks, data loss risks, performance impacts, and suggest safer alternatives.

Focus on:
1. Table locking concerns (ALTER TABLE operations)
2. Data migration risks
3. Performance impact on production
4. Downtime estimation
5. Safer migration strategies (nullable columns, backfills, multi-step migrations)

Respond ONLY with valid JSON in this exact format:
{
  "analysis": "Detailed analysis of the migration and its risks",
  "saferRewrite": "A safer version of the migration SQL",
  "warnings": ["warning 1", "warning 2"],
  "estimatedLockTime": "Estimated lock time or 'None' if no locks",
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;
    const userPrompt = `Analyze this ${databaseType} migration and check for safety issues:

\`\`\`sql
${migration}
\`\`\`

Provide:
1. Detailed risk analysis
2. Safer rewrite of the migration
3. List of warnings
4. Estimated lock time
5. Step-by-step recommendations for safe execution`;
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages,
        temperature: 0.3,
        max_tokens: 4e3
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cerebras API error: ${response.status} - ${error}`);
    }
    const data = await response.json();
    const content = data.choices[0].message.content;
    try {
      const markdownMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      let jsonString = markdownMatch ? markdownMatch[1] : content;
      if (!markdownMatch) {
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        jsonString = jsonMatch[0];
      }
      jsonString = jsonString.replace(/`([\s\S]*?)`/g, (match, p1) => {
        const escaped = p1.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
        return `"${escaped}"`;
      });
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse migration analysis response:", content);
      throw new Error("Failed to parse AI response. Please try again.");
    }
  }
  async debugCICD(logs, pipelineYaml) {
    const systemPrompt = `You are a CI/CD debugging expert. Analyze pipeline failures, identify root causes, and provide clear fixes.

Focus on:
1. Common CI/CD issues (dependency conflicts, environment mismatches, authentication failures)
2. YAML syntax and configuration errors
3. Build and deployment failures
4. Version mismatches
5. Clear explanations for junior developers

Respond ONLY with valid JSON in this exact format:
{
  "rootCause": "One-line summary of the root cause",
  "explanation": "Detailed explanation in plain English",
  "suggestedFix": "Step-by-step fix instructions",
  "fixedYaml": "Corrected YAML configuration (if YAML was provided)",
  "relatedIssues": ["related issue 1", "related issue 2"]
}`;
    const userPrompt = `Debug this CI/CD pipeline failure:

**Pipeline Logs:**
\`\`\`
${logs}
\`\`\`

${pipelineYaml ? `**Pipeline YAML:**
\`\`\`yaml
${pipelineYaml}
\`\`\`` : ""}

Provide:
1. Root cause in plain English
2. Detailed explanation
3. Step-by-step fix
4. Corrected YAML (if applicable)
5. Related issues to watch for`;
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages,
        temperature: 0.3,
        max_tokens: 4e3
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cerebras API error: ${response.status} - ${error}`);
    }
    const data = await response.json();
    const content = data.choices[0].message.content;
    try {
      const markdownMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      let jsonString = markdownMatch ? markdownMatch[1] : content;
      if (!markdownMatch) {
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        jsonString = jsonMatch[0];
      }
      jsonString = jsonString.replace(/`([\s\S]*?)`/g, (match, p1) => {
        const escaped = p1.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
        return `"${escaped}"`;
      });
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse CI/CD debug response:", content);
      throw new Error("Failed to parse AI response. Please try again.");
    }
  }
  async analyzeInfraDrift(desiredState, actualState, iacType) {
    const systemPrompt = `You are an infrastructure drift detection expert. Analyze differences between desired Infrastructure as Code (IaC) state and actual cloud resource state.

Focus on:
1. Identifying all configuration drifts
2. Categorizing severity (low, medium, high, critical)
3. Explaining drift in plain English
4. Suggesting safe auto-fixes
5. Flagging dangerous changes (security, data loss, downtime risks)

Respond ONLY with valid JSON in this exact format:
{
  "driftSummary": "One-line summary of overall drift status",
  "driftDetails": [
    {
      "resource": "resource name/ID",
      "field": "configuration field that drifted",
      "desired": "value in IaC",
      "actual": "value in cloud",
      "severity": "low|medium|high|critical"
    }
  ],
  "explanation": "Detailed explanation of all drifts and their implications",
  "autoFixSuggestions": ["suggestion 1", "suggestion 2"],
  "dangerousChanges": ["dangerous change 1", "dangerous change 2"],
  "recommendations": "Overall recommendations for handling the drift"
}`;
    const userPrompt = `Analyze infrastructure drift for ${iacType}:

**Desired State (IaC):**
\`\`\`
${desiredState}
\`\`\`

**Actual State (Cloud):**
\`\`\`
${actualState}
\`\`\`

Analyze:
1. All configuration differences
2. Severity of each drift
3. Security implications
4. Cost implications
5. Performance impact
6. Safe auto-fix options
7. Dangerous changes to avoid`;
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages,
        temperature: 0.3,
        max_tokens: 4e3
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cerebras API error: ${response.status} - ${error}`);
    }
    const data = await response.json();
    const content = data.choices[0].message.content;
    try {
      const markdownMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      let jsonString = markdownMatch ? markdownMatch[1] : content;
      if (!markdownMatch) {
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        jsonString = jsonMatch[0];
      }
      jsonString = jsonString.replace(/`([\s\S]*?)`/g, (match, p1) => {
        const escaped = p1.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
        return `"${escaped}"`;
      });
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse infra drift response:", content);
      throw new Error("Failed to parse AI response. Please try again.");
    }
  }
};
var cerebrasService = new CerebrasService(process.env.apiKey || "");

// server/docker-generation.ts
var DockerGeneratorService = class {
  SUPPORTED_DATABASES = ["postgresql", "postgres", "mysql", "mongodb", "mongo", "sqlite", "mssql", "sqlserver"];
  generateDockerConfiguration(config) {
    const { type, schema, includeSampleData } = config;
    const normalizedType = type.toLowerCase();
    if (!this.SUPPORTED_DATABASES.includes(normalizedType)) {
      throw new Error(`Unsupported database type: ${type}. Supported types are: PostgreSQL, MySQL, MongoDB, SQLite, SQL Server`);
    }
    switch (normalizedType) {
      case "postgresql":
      case "postgres":
        return this.generatePostgresDocker(schema, includeSampleData);
      case "mysql":
        return this.generateMySQLDocker(schema, includeSampleData);
      case "mongodb":
      case "mongo":
        return this.generateMongoDocker(schema, includeSampleData);
      case "sqlite":
        return this.generateSQLiteDocker(schema, includeSampleData);
      case "mssql":
      case "sqlserver":
        return this.generateSQLServerDocker(schema, includeSampleData);
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }
  generatePostgresDocker(schema, includeSampleData) {
    const dockerfile = `FROM postgres:alpine

ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=admin
ENV POSTGRES_DB=myapp

COPY ./init-db/ /docker-entrypoint-initdb.d/

EXPOSE 5432

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \\
  CMD pg_isready -U admin -d myapp || exit 1`;
    const dockerCompose = `version: '3.8'

services:
  postgres:
    build: .
    container_name: myapp-postgres
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d myapp"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local`;
    const initScript = `-- PostgreSQL Database Schema
-- This file is automatically executed when the container starts

${schema}

${includeSampleData ? `
-- Sample Data (Optional)
-- Add your sample data INSERT statements here
-- Example:
-- INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');
` : ""}`;
    const dockerRunCommand = `# Quick Start Command:
docker-compose up -d

# Or build and run manually:
docker build -t myapp-postgres .
docker run -d -p 5432:5432 --name myapp-postgres myapp-postgres

# Connect to database:
# Host: localhost
# Port: 5432
# Database: myapp
# User: admin
# Password: admin

# Connection string:
postgresql://admin:admin@localhost:5432/myapp`;
    const instructions = `# PostgreSQL Docker Setup Instructions

## Files Included:
1. **Dockerfile** - Container image definition
2. **docker-compose.yml** - Complete stack configuration
3. **init-db/01-schema.sql** - Database schema initialization

## Quick Start:

### Option 1: Using Docker Compose (Recommended)
\`\`\`bash
# 1. Create project directory
mkdir myapp-database && cd myapp-database

# 2. Save files:
#    - Save Dockerfile as "Dockerfile"
#    - Save docker-compose.yml as "docker-compose.yml"
#    - Create init-db folder and save init script as "init-db/01-schema.sql"
mkdir init-db

# 3. Start the database
docker-compose up -d

# 4. Check status
docker-compose ps

# 5. View logs
docker-compose logs -f
\`\`\`

### Option 2: Using Docker Run
\`\`\`bash
# 1. Build image
docker build -t myapp-postgres .

# 2. Run container
docker run -d \\
  -p 5432:5432 \\
  -e POSTGRES_USER=admin \\
  -e POSTGRES_PASSWORD=admin \\
  -e POSTGRES_DB=myapp \\
  -v $(pwd)/init-db:/docker-entrypoint-initdb.d \\
  --name myapp-postgres \\
  myapp-postgres
\`\`\`

## Connection Details:
- **Host**: localhost
- **Port**: 5432
- **Database**: myapp
- **Username**: admin
- **Password**: admin
- **Connection String**: \`postgresql://admin:admin@localhost:5432/myapp\`

## Useful Commands:
\`\`\`bash
# Stop database
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v

# Access PostgreSQL CLI
docker exec -it myapp-postgres psql -U admin -d myapp

# Backup database
docker exec myapp-postgres pg_dump -U admin myapp > backup.sql

# Restore database
docker exec -i myapp-postgres psql -U admin myapp < backup.sql
\`\`\`

## Security Note:
\u26A0\uFE0F Change the default credentials before deploying to production!`;
    return {
      dockerfile,
      dockerCompose,
      files: [
        { name: "01-schema.sql", content: initScript, path: "init-db/" }
      ],
      instructions,
      dockerRunCommand
    };
  }
  generateMySQLDocker(schema, includeSampleData) {
    const dockerfile = `FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=rootpassword
ENV MYSQL_DATABASE=myapp
ENV MYSQL_USER=admin
ENV MYSQL_PASSWORD=admin

COPY ./init-db/ /docker-entrypoint-initdb.d/

EXPOSE 3306

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \\
  CMD mysqladmin ping -h localhost -u root -p$MYSQL_ROOT_PASSWORD || exit 1`;
    const dockerCompose = `version: '3.8'

services:
  mysql:
    build: .
    container_name: myapp-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: myapp
      MYSQL_USER: admin
      MYSQL_PASSWORD: admin
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init-db:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p$$MYSQL_ROOT_PASSWORD"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    restart: unless-stopped

volumes:
  mysql_data:
    driver: local`;
    const initScript = `-- MySQL Database Schema
USE myapp;

${schema}

${includeSampleData ? `
-- Sample Data (Optional)
-- Add your sample data INSERT statements here
-- Example:
-- INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');
` : ""}`;
    const dockerRunCommand = `# Quick Start Command:
docker-compose up -d

# Or build and run manually:
docker build -t myapp-mysql .
docker run -d -p 3306:3306 --name myapp-mysql myapp-mysql

# Connect to database:
# Host: localhost
# Port: 3306
# Database: myapp
# User: admin
# Password: admin

# Connection string:
mysql://admin:admin@localhost:3306/myapp`;
    const instructions = `# MySQL Docker Setup Instructions

## Files Included:
1. **Dockerfile** - Container image definition
2. **docker-compose.yml** - Complete stack configuration
3. **init-db/01-schema.sql** - Database schema initialization

## Quick Start:

### Using Docker Compose (Recommended)
\`\`\`bash
# 1. Create project directory
mkdir myapp-database && cd myapp-database

# 2. Save files and create init-db folder
mkdir init-db

# 3. Start the database
docker-compose up -d

# 4. Check status
docker-compose ps
\`\`\`

## Connection Details:
- **Host**: localhost
- **Port**: 3306
- **Database**: myapp
- **Username**: admin
- **Password**: admin
- **Root Password**: rootpassword
- **Connection String**: \`mysql://admin:admin@localhost:3306/myapp\`

## Useful Commands:
\`\`\`bash
# Access MySQL CLI
docker exec -it myapp-mysql mysql -u admin -padmin myapp

# Backup database
docker exec myapp-mysql mysqldump -u admin -padmin myapp > backup.sql

# Restore database
docker exec -i myapp-mysql mysql -u admin -padmin myapp < backup.sql
\`\`\`

## Security Note:
\u26A0\uFE0F Change the default credentials before deploying to production!`;
    return {
      dockerfile,
      dockerCompose,
      files: [
        { name: "01-schema.sql", content: initScript, path: "init-db/" }
      ],
      instructions,
      dockerRunCommand
    };
  }
  generateMongoDocker(schema, includeSampleData) {
    const dockerfile = `FROM mongo:latest

ENV MONGO_INITDB_ROOT_USERNAME=admin
ENV MONGO_INITDB_ROOT_PASSWORD=admin
ENV MONGO_INITDB_DATABASE=myapp

COPY ./init-db/ /docker-entrypoint-initdb.d/

EXPOSE 27017

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \\
  CMD mongosh --eval "db.adminCommand('ping')" --quiet || exit 1`;
    const dockerCompose = `version: '3.8'

services:
  mongodb:
    build: .
    container_name: myapp-mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin
      MONGO_INITDB_DATABASE: myapp
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./init-db:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')", "--quiet"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    restart: unless-stopped

volumes:
  mongodb_data:
    driver: local`;
    const initScript = `// MongoDB Initialization Script
db = db.getSiblingDB('myapp');

// Create collections and indexes
${schema}

${includeSampleData ? `
// Sample Data (Optional)
// Add your sample data here
// Example:
// db.users.insertMany([
//   { name: 'John Doe', email: 'john@example.com' },
//   { name: 'Jane Smith', email: 'jane@example.com' }
// ]);
` : ""}`;
    const dockerRunCommand = `# Quick Start Command:
docker-compose up -d

# Or build and run manually:
docker build -t myapp-mongodb .
docker run -d -p 27017:27017 --name myapp-mongodb myapp-mongodb

# Connect to database:
# Host: localhost
# Port: 27017
# Database: myapp
# Username: admin
# Password: admin

# Connection string:
mongodb://admin:admin@localhost:27017/myapp?authSource=admin`;
    const instructions = `# MongoDB Docker Setup Instructions

## Files Included:
1. **Dockerfile** - Container image definition
2. **docker-compose.yml** - Complete stack configuration
3. **init-db/init-mongo.js** - Database initialization script

## Quick Start:

### Using Docker Compose (Recommended)
\`\`\`bash
# 1. Create project directory
mkdir myapp-database && cd myapp-database

# 2. Save files and create init-db folder
mkdir init-db

# 3. Start the database
docker-compose up -d

# 4. Check status
docker-compose ps
\`\`\`

## Connection Details:
- **Host**: localhost
- **Port**: 27017
- **Database**: myapp
- **Username**: admin
- **Password**: admin
- **Connection String**: \`mongodb://admin:admin@localhost:27017/myapp?authSource=admin\`

## Useful Commands:
\`\`\`bash
# Access MongoDB shell
docker exec -it myapp-mongodb mongosh -u admin -p admin --authenticationDatabase admin

# Backup database
docker exec myapp-mongodb mongodump --username admin --password admin --authenticationDatabase admin --db myapp --out /backup

# Restore database
docker exec myapp-mongodb mongorestore --username admin --password admin --authenticationDatabase admin /backup
\`\`\`

## Security Note:
\u26A0\uFE0F Change the default credentials before deploying to production!`;
    return {
      dockerfile,
      dockerCompose,
      files: [
        { name: "init-mongo.js", content: initScript, path: "init-db/" }
      ],
      instructions,
      dockerRunCommand
    };
  }
  generateSQLiteDocker(schema, includeSampleData) {
    const dockerfile = `FROM alpine:latest

RUN apk add --no-cache sqlite bash

WORKDIR /app

COPY ./init-db/schema.sql /app/init-db/schema.sql
COPY ./init.sh /app/init.sh

RUN chmod +x /app/init.sh

VOLUME /app/data

ENTRYPOINT ["/app/init.sh"]`;
    const dockerCompose = `version: '3.8'

services:
  sqlite:
    build: .
    container_name: myapp-sqlite
    volumes:
      - ./data:/app/data
      - ./init-db:/app/init-db
    restart: unless-stopped`;
    const schemaSQL = `-- SQLite Database Schema
${schema}

${includeSampleData ? `
-- Sample Data (Optional)
-- Add your sample data INSERT statements here
-- Example:
-- INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');
` : ""}`;
    const initScript = `#!/bin/bash
# SQLite Initialization Script
# This runs every time the container starts

mkdir -p /app/data

if [ ! -f /app/data/myapp.db ]; then
  echo "Initializing database..."
  sqlite3 /app/data/myapp.db < /app/init-db/schema.sql
  echo "Database initialized successfully"
else
  echo "Database already exists, skipping initialization"
fi

# Keep container running
tail -f /dev/null`;
    const dockerRunCommand = `# Quick Start Command:
docker-compose up -d

# Or build and run manually:
docker build -t myapp-sqlite .
docker run -d -v $(pwd)/data:/app/data --name myapp-sqlite myapp-sqlite

# Access database file at: ./data/myapp.db

# Connect using sqlite3:
sqlite3 ./data/myapp.db`;
    const instructions = `# SQLite Docker Setup Instructions

## Files Included:
1. **Dockerfile** - Container image definition
2. **docker-compose.yml** - Stack configuration
3. **init-db/schema.sql** - Database schema
4. **init.sh** - Initialization script

## Quick Start:

### Using Docker Compose (Recommended)
\`\`\`bash
# 1. Create project directory
mkdir myapp-database && cd myapp-database

# 2. Create necessary folders
mkdir -p init-db data

# 3. Start the container
docker-compose up -d
\`\`\`

## Database Access:
The SQLite database file is stored at \`./data/myapp.db\` and is accessible from your host machine.

## Useful Commands:
\`\`\`bash
# Access SQLite CLI inside container
docker exec -it myapp-sqlite sqlite3 /app/data/myapp.db

# Copy database file to host
docker cp myapp-sqlite:/app/data/myapp.db ./myapp.db

# Backup database
cp ./data/myapp.db ./backup_$(date +%Y%m%d).db
\`\`\`

## Note:
SQLite is file-based and doesn't require network ports. The database file is persisted in the \`./data\` folder.`;
    return {
      dockerfile,
      dockerCompose,
      files: [
        { name: "schema.sql", content: schemaSQL, path: "init-db/" },
        { name: "init.sh", content: initScript, path: "" }
      ],
      instructions,
      dockerRunCommand
    };
  }
  generateSQLServerDocker(schema, includeSampleData) {
    const dockerfile = `FROM mcr.microsoft.com/mssql/server:2022-latest

ENV ACCEPT_EULA=Y
ENV SA_PASSWORD=YourStrong@Password123
ENV MSSQL_PID=Express

COPY ./init-db/ /usr/src/app/

USER root
RUN chmod +x /usr/src/app/entrypoint.sh

EXPOSE 1433

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]`;
    const dockerCompose = `version: '3.8'

services:
  sqlserver:
    build: .
    container_name: myapp-sqlserver
    environment:
      ACCEPT_EULA: Y
      SA_PASSWORD: YourStrong@Password123
      MSSQL_PID: Express
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql
      - ./init-db:/usr/src/app
    healthcheck:
      test: ["CMD", "/opt/mssql-tools/bin/sqlcmd", "-S", "localhost", "-U", "sa", "-P", "YourStrong@Password123", "-Q", "SELECT 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s
    restart: unless-stopped

volumes:
  sqlserver_data:
    driver: local`;
    const initScript = `-- SQL Server Database Schema
CREATE DATABASE myapp;
GO

USE myapp;
GO

${schema}

${includeSampleData ? `
-- Sample Data (Optional)
-- Add your sample data INSERT statements here
-- Example:
-- INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');
` : ""}
GO`;
    const dockerRunCommand = `# Quick Start Command:
docker-compose up -d

# Or build and run manually:
docker build -t myapp-sqlserver .
docker run -d -p 1433:1433 --name myapp-sqlserver myapp-sqlserver

# Connect to database:
# Host: localhost
# Port: 1433
# Database: myapp
# User: sa
# Password: YourStrong@Password123

# Connection string:
Server=localhost,1433;Database=myapp;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True;`;
    const instructions = `# SQL Server Docker Setup Instructions

## Files Included:
1. **Dockerfile** - Container image definition
2. **docker-compose.yml** - Complete stack configuration
3. **init-db/01-schema.sql** - Database schema initialization
4. **init-db/entrypoint.sh** - Custom entrypoint script

## Quick Start:

### Using Docker Compose (Recommended)
\`\`\`bash
# 1. Create project directory
mkdir myapp-database && cd myapp-database

# 2. Create init-db folder
mkdir init-db

# 3. Create entrypoint.sh
cat > init-db/entrypoint.sh << 'EOF'
#!/bin/bash
/opt/mssql/bin/sqlservr &
sleep 30
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Password123 -i /usr/src/app/01-schema.sql
wait
EOF

# 4. Start the database
docker-compose up -d

# 5. Check status (may take 60s to fully start)
docker-compose ps
\`\`\`

## Connection Details:
- **Host**: localhost
- **Port**: 1433
- **Database**: myapp
- **Username**: sa
- **Password**: YourStrong@Password123
- **Connection String**: \`Server=localhost,1433;Database=myapp;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True;\`

## Useful Commands:
\`\`\`bash
# Access SQL Server CLI
docker exec -it myapp-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Password123'

# Backup database
docker exec myapp-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Password123' -Q "BACKUP DATABASE myapp TO DISK = '/var/opt/mssql/backup/myapp.bak'"

# View logs
docker logs myapp-sqlserver
\`\`\`

## Security Note:
\u26A0\uFE0F Change the default SA password before deploying to production! Password must meet SQL Server complexity requirements.`;
    const entrypoint = `#!/bin/bash
/opt/mssql/bin/sqlservr &
sleep 30
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Password123 -i /usr/src/app/01-schema.sql
wait`;
    return {
      dockerfile,
      dockerCompose,
      files: [
        { name: "01-schema.sql", content: initScript, path: "init-db/" },
        { name: "entrypoint.sh", content: entrypoint, path: "init-db/" }
      ],
      instructions,
      dockerRunCommand
    };
  }
};
var dockerGeneratorService = new DockerGeneratorService();

// server/routes.ts
import { fromError } from "zod-validation-error";
async function registerRoutes(app2) {
  app2.get("/api/projects", async (req, res, next) => {
    try {
      const projects2 = await storage.getAllProjects();
      res.json(projects2);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/projects/:id", async (req, res, next) => {
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
  app2.post("/api/projects", async (req, res, next) => {
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
  app2.put("/api/projects/:id", async (req, res, next) => {
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
  app2.delete("/api/projects/:id", async (req, res, next) => {
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
  app2.post("/api/generate-schema", async (req, res, next) => {
    try {
      const { prompt, databaseType } = req.body;
      if (!prompt || !databaseType) {
        return res.status(400).json({
          message: "prompt and databaseType are required"
        });
      }
      const result = await cerebrasService.generateSchema(prompt, databaseType);
      res.json(result);
    } catch (error) {
      console.error("Schema generation error:", error);
      res.status(500).json({
        message: error.message || "Failed to generate schema"
      });
    }
  });
  app2.post("/api/optimize-schema", async (req, res, next) => {
    try {
      const { schema, databaseType } = req.body;
      if (!schema || !databaseType) {
        return res.status(400).json({
          message: "schema and databaseType are required"
        });
      }
      const result = await cerebrasService.optimizeSchema(schema, databaseType);
      res.json(result);
    } catch (error) {
      console.error("Schema optimization error:", error);
      res.status(500).json({
        message: error.message || "Failed to optimize schema"
      });
    }
  });
  app2.post("/api/generate-docker", async (req, res, next) => {
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
    } catch (error) {
      console.error("Docker generation error:", error);
      res.status(500).json({
        message: error.message || "Failed to generate Docker configuration"
      });
    }
  });
  app2.post("/api/devops-chatbot", async (req, res, next) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ message: "message is required" });
      }
      const result = await cerebrasService.devOpsChatbotService(message);
      res.json(result);
    } catch (error) {
      console.error("DevOps chatbot error:", error);
      res.status(500).json({
        message: error.message || "Failed to process message"
      });
    }
  });
  app2.post("/api/generate-docker", async (req, res, next) => {
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
    } catch (error) {
      console.error("Docker generation error:", error);
      res.status(500).json({
        message: error.message || "Failed to generate Docker configuration"
      });
    }
  });
  app2.post("/api/gen-chat", async (req, res, next) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ message: "message is required" });
      }
      const result = await cerebrasService.Genchat(message);
      res.json(result);
    } catch (error) {
      console.error("DevOps chatbot error:", error);
      res.status(500).json({
        message: error.message || "Failed to process message"
      });
    }
  });
  app2.post("/api/database-chat", async (req, res, next) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ message: "message is required" });
      }
      const result = await cerebrasService.DatabaseAdvisor(message);
      res.json(result);
    } catch (error) {
      console.error("Database  chatbot error:", error);
      res.status(500).json({
        message: error.message || "Failed to process message"
      });
    }
  });
  app2.post("/api/ui-builder", async (req, res, next) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ message: "message is required" });
      }
      const result = await cerebrasService.Uichat(message);
      res.json(result);
    } catch (error) {
      console.error("UI chatbot error:", error);
      res.status(500).json({
        message: error.message || "Failed to process message"
      });
    }
  });
  app2.post("/api/analyze-migration", async (req, res, next) => {
    try {
      const { migration, databaseType } = req.body;
      if (!migration || !databaseType) {
        return res.status(400).json({ message: "migration and databaseType are required" });
      }
      const result = await cerebrasService.analyzeMigration(migration, databaseType);
      res.json(result);
    } catch (error) {
      console.error("Migration analysis error:", error);
      res.status(500).json({
        message: error.message || "Failed to analyze migration"
      });
    }
  });
  app2.post("/api/debug-cicd", async (req, res, next) => {
    try {
      const { logs, pipelineYaml } = req.body;
      if (!logs) {
        return res.status(400).json({ message: "logs are required" });
      }
      const result = await cerebrasService.debugCICD(logs, pipelineYaml);
      res.json(result);
    } catch (error) {
      console.error("CI/CD debug error:", error);
      res.status(500).json({
        message: error.message || "Failed to debug CI/CD pipeline"
      });
    }
  });
  app2.post("/api/analyze-drift", async (req, res, next) => {
    try {
      const { desiredState, actualState, iacType } = req.body;
      if (!desiredState || !actualState || !iacType) {
        return res.status(400).json({ message: "desiredState, actualState, and iacType are required" });
      }
      const result = await cerebrasService.analyzeInfraDrift(desiredState, actualState, iacType);
      res.json(result);
    } catch (error) {
      console.error("Infra drift analysis error:", error);
      res.status(500).json({
        message: error.message || "Failed to analyze infrastructure drift"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import cors from "cors";
dotenv3.config();
var app = express2();
app.use(cors());
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
console.log("API Key:", process.env.apiKey);
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT || 5e3;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Database Designer server listening on port ${port}`);
  });
})();
