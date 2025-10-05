interface DatabaseConfig {
  type: string;
  schema: string;
  includeSampleData?: boolean;
}

interface DockerFile {
  name: string;
  content: string;
  path?: string;
}

interface DockerGenerationResult {
  dockerfile: string;
  dockerCompose: string;
  files: DockerFile[];
  instructions: string;
  dockerRunCommand: string;
}

export class DockerGeneratorService {
  private readonly SUPPORTED_DATABASES = ['postgresql', 'postgres', 'mysql', 'mongodb', 'mongo', 'sqlite', 'mssql', 'sqlserver'];

  generateDockerConfiguration(config: DatabaseConfig): DockerGenerationResult {
    const { type, schema, includeSampleData } = config;
    const normalizedType = type.toLowerCase();

    if (!this.SUPPORTED_DATABASES.includes(normalizedType)) {
      throw new Error(`Unsupported database type: ${type}. Supported types are: PostgreSQL, MySQL, MongoDB, SQLite, SQL Server`);
    }

    switch (normalizedType) {
      case 'postgresql':
      case 'postgres':
        return this.generatePostgresDocker(schema, includeSampleData);
      case 'mysql':
        return this.generateMySQLDocker(schema, includeSampleData);
      case 'mongodb':
      case 'mongo':
        return this.generateMongoDocker(schema, includeSampleData);
      case 'sqlite':
        return this.generateSQLiteDocker(schema, includeSampleData);
      case 'mssql':
      case 'sqlserver':
        return this.generateSQLServerDocker(schema, includeSampleData);
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }

  private generatePostgresDocker(schema: string, includeSampleData?: boolean): DockerGenerationResult {
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
` : ''}`;

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
⚠️ Change the default credentials before deploying to production!`;

    return {
      dockerfile,
      dockerCompose,
      files: [
        { name: '01-schema.sql', content: initScript, path: 'init-db/' }
      ],
      instructions,
      dockerRunCommand
    };
  }

  private generateMySQLDocker(schema: string, includeSampleData?: boolean): DockerGenerationResult {
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
` : ''}`;

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
⚠️ Change the default credentials before deploying to production!`;

    return {
      dockerfile,
      dockerCompose,
      files: [
        { name: '01-schema.sql', content: initScript, path: 'init-db/' }
      ],
      instructions,
      dockerRunCommand
    };
  }

  private generateMongoDocker(schema: string, includeSampleData?: boolean): DockerGenerationResult {
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
` : ''}`;

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
⚠️ Change the default credentials before deploying to production!`;

    return {
      dockerfile,
      dockerCompose,
      files: [
        { name: 'init-mongo.js', content: initScript, path: 'init-db/' }
      ],
      instructions,
      dockerRunCommand
    };
  }

  private generateSQLiteDocker(schema: string, includeSampleData?: boolean): DockerGenerationResult {
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
` : ''}`;

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
        { name: 'schema.sql', content: schemaSQL, path: 'init-db/' },
        { name: 'init.sh', content: initScript, path: '' }
      ],
      instructions,
      dockerRunCommand
    };
  }

  private generateSQLServerDocker(schema: string, includeSampleData?: boolean): DockerGenerationResult {
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
` : ''}
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
⚠️ Change the default SA password before deploying to production! Password must meet SQL Server complexity requirements.`;

    const entrypoint = `#!/bin/bash
/opt/mssql/bin/sqlservr &
sleep 30
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Password123 -i /usr/src/app/01-schema.sql
wait`;

    return {
      dockerfile,
      dockerCompose,
      files: [
        { name: '01-schema.sql', content: initScript, path: 'init-db/' },
        { name: 'entrypoint.sh', content: entrypoint, path: 'init-db/' }
      ],
      instructions,
      dockerRunCommand
    };
  }
}

export const dockerGeneratorService = new DockerGeneratorService();
