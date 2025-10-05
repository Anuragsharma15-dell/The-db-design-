# Database Schema Designer

## Overview

An AI-powered web application for designing, visualizing, and exporting database schemas across multiple database systems and ORMs. The application leverages Cerebras AI with LLaMA models to generate optimized database schemas from natural language descriptions, complete with visual ER diagrams, Docker configurations, and Kubernetes manifests.

**Core Purpose:** Simplify database schema design by allowing developers to describe their requirements in plain English and receive production-ready schemas for 8+ database systems, along with deployment configurations and best practice recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management
- Tailwind CSS with shadcn/ui component library for styling
- Framer Motion for animations and transitions
- XYFlow React for interactive ER diagram visualization

**Design Decisions:**
- **Component-based architecture** with reusable UI components in `/client/src/components/ui`
- **Monorepo structure** with client and server code in the same repository
- **Custom theme system** supporting dark/light modes with CSS variables
- **Real-time collaboration** via WebSocket connections for multi-user schema editing

**Key Features:**
- AI-powered schema generation via natural language input
- Interactive ER diagram visualization with auto-layout
- Multi-format schema export (SQL, Prisma, TypeORM, Mongoose, Sequelize)
- Voice-based interaction for DevOps, database, and coding assistance
- Real-time collaboration with cursor tracking

### Backend Architecture

**Technology Stack:**
- Express.js server running on Node.js 18+
- TypeScript for type safety across the entire backend
- Drizzle ORM for database operations
- WebSocket (ws) for real-time collaboration features

**Design Patterns:**
- **Service layer pattern** separating business logic from routes
- **RESTful API** for CRUD operations on projects
- **WebSocket service** for real-time collaboration sessions
- **Modular route organization** with clear separation of concerns

**Core Services:**
1. **CerebrasService** - AI schema generation using Cerebras API
2. **DockerGeneratorService** - Docker configuration generation
3. **KubernetesGeneratorService** - K8s manifest generation
4. **CollaborationService** - Real-time multi-user editing
5. **DbStorage** - Database abstraction layer

**API Endpoints:**
- `/api/projects` - CRUD operations for schema projects
- `/api/generate-schema` - AI-powered schema generation
- `/api/docker-export` - Docker configuration generation
- `/api/kubernetes-export` - K8s manifest generation
- `/api/devops-chatbot` - DevOps assistance chatbot
- `/api/database-chat` - Database design advisor
- `/api/ui-builder` - React component generation from schemas
- `/ws/collaborate` - WebSocket endpoint for collaboration

### Data Storage

**Database Solution:**
- Neon Postgres (serverless PostgreSQL) via `@neondatabase/serverless`
- Connection pooling for efficient database access
- Drizzle ORM for type-safe query building

**Schema Design:**
```typescript
// Core tables:
- users: User authentication and profiles
- projects: Schema projects with metadata
- collaboration_sessions: Real-time collaboration state
```

**Data Models:**
- Projects store schemas in JSONB format for all 8+ database types
- Support for normalization suggestions, query examples, and migration scripts
- Collaboration sessions track active users and cursor positions

**Design Rationale:**
- JSONB chosen for flexible schema storage across multiple database types
- Serverless Postgres enables scalability without infrastructure management
- Drizzle ORM provides TypeScript inference and compile-time safety

### External Dependencies

**AI Services:**
- **Cerebras API** - Primary AI inference provider using LLaMA models
  - Endpoint: `https://api.cerebras.ai/v1`
  - Used for: Schema generation, optimization suggestions, query examples
  - API key required via `apiKey` environment variable

**Database:**
- **Neon Postgres** - Serverless PostgreSQL database
  - Connection via `DATABASE_URL` environment variable
  - WebSocket constructor override for serverless compatibility

**Voice Recognition:**
- **Browser Web Speech API** - Client-side voice input
  - Uses `webkitSpeechRecognition` or `SpeechRecognition`
  - No external API required

**UI Components:**
- **shadcn/ui** - Radix UI primitives with Tailwind styling
- **XYFlow React** - ER diagram visualization and manipulation
- **React Syntax Highlighter** - Code display with syntax highlighting

**Development Tools:**
- **Replit plugins** - Development tooling for Replit environment
  - Runtime error overlay
  - Cartographer for code navigation
  - Dev banner

**Deployment Platforms:**
- **Render** (recommended) - Traditional server deployment
- Docker support for containerized deployment
- Kubernetes manifests for orchestrated deployment

**Environment Variables Required:**
```
DATABASE_URL - PostgreSQL connection string
apiKey - Cerebras API key
NODE_ENV - production/development
```