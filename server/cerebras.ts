
import dotenv from "dotenv";
dotenv.config();
interface CerebrasMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface CerebrasResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class CerebrasService {
  private apiKey: string ;
  private baseUrl = "https://api.cerebras.ai/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateSchema(prompt: string, databaseType: string): Promise<{
    schemas: {
      sql: string;
      prisma: string;
      mongoose: string;
      typeorm: string;
      sequelize: string;
      mysql: string;
      oracle: string;
      sqlserver: string;
    };
    explanation: string;
    normalizationSuggestions: string;
    queryExamples: Array<{ name: string; description: string; query: string }>;
    migrationScript: string;
    dockerfile: string;
    dockerCompose: string;
  }> {
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

    const messages: CerebrasMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages,
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cerebras API error: ${response.status} - ${error}`);
    }

    const data: CerebrasResponse = await response.json();
    const content = data.choices[0].message.content;

    try {
      // Try to extract JSON from markdown code blocks first
      const markdownMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      let jsonString = markdownMatch ? markdownMatch[1] : content;
      
      // If no markdown blocks, try to find raw JSON
      if (!markdownMatch) {
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        jsonString = jsonMatch[0];
      }
      
      // Replace backtick template literals with regular strings (handles multiline)
      jsonString = jsonString.replace(/`([\s\S]*?)`/g, (match, p1) => {
        // Escape quotes and special chars in the captured content
        const escaped = p1
          .replace(/\\/g, '\\\\')  // Escape backslashes first
          .replace(/"/g, '\\"')     // Escape quotes
          .replace(/\n/g, '\\n')    // Escape newlines
          .replace(/\r/g, '\\r')    // Escape carriage returns
          .replace(/\t/g, '\\t');   // Escape tabs
        return `"${escaped}"`;
      });
      
      const result = JSON.parse(jsonString);
      return result;
    } catch (parseError) {
      console.error("Failed to parse Cerebras response:", content);
      throw new Error("Failed to parse AI response. Please try again.");
    }
  }

  async optimizeSchema(schema: string, databaseType: string): Promise<{
    optimizedSchema: string;
    suggestions: string;
  }> {
    const messages: CerebrasMessage[] = [
      {
        role: "system",
        content: "You are a database optimization expert. Analyze schemas and provide optimization suggestions.",
      },
      {
        role: "user",
        content: `Analyze and optimize this ${databaseType} schema:\n\n${schema}\n\nProvide:\n1. Optimized version\n2. Detailed suggestions for improvements\n\nRespond in JSON: {"optimizedSchema": "...", "suggestions": "..."}`,
      },
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages,
        temperature: 0.5,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Cerebras API error: ${response.status}`);
    }

    const data: CerebrasResponse = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      // Try to extract JSON from markdown code blocks first
      const markdownMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      let jsonString = markdownMatch ? markdownMatch[1] : content;
      
      // If no markdown blocks, try to find raw JSON
      if (!markdownMatch) {
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        jsonString = jsonMatch[0];
      }
      
      // Replace backtick template literals with regular strings (handles multiline)
      jsonString = jsonString.replace(/`([\s\S]*?)`/g, (match, p1) => {
        // Escape quotes and special chars in the captured content
        const escaped = p1
          .replace(/\\/g, '\\\\')  // Escape backslashes first
          .replace(/"/g, '\\"')     // Escape quotes
          .replace(/\n/g, '\\n')    // Escape newlines
          .replace(/\r/g, '\\r')    // Escape carriage returns
          .replace(/\t/g, '\\t');   // Escape tabs
        return `"${escaped}"`;
      });
      
      return JSON.parse(jsonString);
  
    } catch (parseError) {
      console.error("Failed to parse optimization response:", content);
      throw new Error("Failed to parse AI response. Please try again.");
    }
  }
  async devOpsChatbotService(message: string): Promise<{ response: string }> {
    const messages: CerebrasMessage[] = [
      {
        role: "system",
        content: "You are a helpful DevOps assistant. Provide expert advice on DevOps practices, CI/CD, containers, Kubernetes, infrastructure as code, monitoring, and more.",
      },
      {
        role: "user",
        content: message,
      },
    ];
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });
    if (!response.ok) {
      throw new Error(`Cerebras API error: ${response.status}`);
    }
    const data: CerebrasResponse = await response.json();
    const content = data.choices[0].message.content;
    return { response: content };
  }

  async Genchat(message: string): Promise<{ response: string }> {
    const messages: CerebrasMessage[] = [
      {
        role: "system",
        content: "You are a helpful gen-ai AI assistant. Provide expert advice on a wide range of topics like generative-ai , langchain , Rag , Vector-databases and everything about gen-ai.",
      },
      {
        role: "user",
        content: message,
      },
    ];
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });
    if (!response.ok) {
      throw new Error(`Cerebras API error: ${response.status}`);
    }
    const data: CerebrasResponse = await response.json();
    const content = data.choices[0].message.content;
    return { response: content };
  }

  async Uichat(message: string): Promise<{ response: string }> {
    const messages: CerebrasMessage[] = [
      {
        role: "system",
        content: "You are a helpful UI-builder  AI assistant. you Provide code for frontend for react, tailwind , framer-motion and typescript, javascript example=> user gives you a database schema and you give frontend code for the schema like for profile schema you give  code of profile page .",
      },
      {
        role: "user",
        content: message,
      },
    ];
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });
    if (!response.ok) {
      throw new Error(`Cerebras API error: ${response.status}`);
    }
    const data: CerebrasResponse = await response.json();
    const content = data.choices[0].message.content;
    return { response: content };
  }
  async DatabaseAdvisor(message: string): Promise<{ response: string }> {
    const messages: CerebrasMessage[] = [
      {
        role: "system", 
        content: "You are a helpful Database Advisor  AI assistant. you Provide expert advice on database design, optimization, query writing, normalization, indexing, and best practices for SQL and NoSQL databases.",
      },
      {
        role: "user",
         content: message,
      },
    ];
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });
    if (!response.ok) {
      throw new Error(`Cerebras API error: ${response.status}`);
    }
    const data: CerebrasResponse = await response.json();
    const content = data.choices[0].message.content;
    return { response: content };
  }

  async analyzeMigration(migration: string, databaseType: string): Promise<{
    analysis: string;
    saferRewrite: string;
    warnings: string[];
    estimatedLockTime: string;
    recommendations: string[];
  }> {
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

    const messages: CerebrasMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages,
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cerebras API error: ${response.status} - ${error}`);
    }

    const data: CerebrasResponse = await response.json();
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
        const escaped = p1
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
        return `"${escaped}"`;
      });
      
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse migration analysis response:", content);
      throw new Error("Failed to parse AI response. Please try again.");
    }
  }

  async debugCICD(logs: string, pipelineYaml?: string): Promise<{
    rootCause: string;
    explanation: string;
    suggestedFix: string;
    fixedYaml?: string;
    relatedIssues: string[];
  }> {
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
\`\`\`` : ''}

Provide:
1. Root cause in plain English
2. Detailed explanation
3. Step-by-step fix
4. Corrected YAML (if applicable)
5. Related issues to watch for`;

    const messages: CerebrasMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages,
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cerebras API error: ${response.status} - ${error}`);
    }

    const data: CerebrasResponse = await response.json();
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
        const escaped = p1
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
        return `"${escaped}"`;
      });
      
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse CI/CD debug response:", content);
      throw new Error("Failed to parse AI response. Please try again.");
    }
  }

  async analyzeInfraDrift(desiredState: string, actualState: string, iacType: string): Promise<{
    driftSummary: string;
    driftDetails: Array<{
      resource: string;
      field: string;
      desired: string;
      actual: string;
      severity: "low" | "medium" | "high" | "critical";
    }>;
    explanation: string;
    autoFixSuggestions: string[];
    dangerousChanges: string[];
    recommendations: string;
  }> {
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

    const messages: CerebrasMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages,
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cerebras API error: ${response.status} - ${error}`);
    }

    const data: CerebrasResponse = await response.json();
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
        const escaped = p1
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
        return `"${escaped}"`;
      });
      
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse infra drift response:", content);
      throw new Error("Failed to parse AI response. Please try again.");
    }
  }

}



export const cerebrasService = new CerebrasService(process.env.apiKey || "");
