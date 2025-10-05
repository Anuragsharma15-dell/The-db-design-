interface DatabaseConfig {
  type: string;
  schema: string;
  includeSampleData?: boolean;
}

interface K8sFile {
  name: string;
  content: string;
  path?: string;
}

interface KubernetesGenerationResult {
  manifests: string;
  files: K8sFile[];
  instructions: string;
}

export class KubernetesGeneratorService {
  private readonly SUPPORTED_DATABASES = [
    "postgresql", "postgres", "mysql", "mongodb", "mongo", "sqlite", "mssql", "sqlserver",
  ];

  generateKubernetesConfiguration(config: DatabaseConfig): KubernetesGenerationResult {
    const { type, schema, includeSampleData } = config;
    const normalizedType = type.toLowerCase();

    if (!this.SUPPORTED_DATABASES.includes(normalizedType)) {
      throw new Error(`Unsupported database type: ${type}. Supported: PostgreSQL, MySQL, MongoDB, SQLite, SQL Server`);
    }

    switch (normalizedType) {
      case "postgresql":
      case "postgres":
        return this.generatePostgresK8s(schema, includeSampleData);
      case "mysql":
        return this.generateMySQLK8s(schema, includeSampleData);
      case "mongodb":
      case "mongo":
        return this.generateMongoK8s(schema, includeSampleData);
      case "sqlite":
        return this.generateSQLiteK8s(schema, includeSampleData);
      case "mssql":
      case "sqlserver":
        return this.generateSQLServerK8s(schema, includeSampleData);
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }

  // ---------------- PostgreSQL ----------------
  private generatePostgresK8s(schema: string, includeSampleData?: boolean): KubernetesGenerationResult {
    const initScript = `-- PostgreSQL Database Schema
${schema}
${includeSampleData ? `
-- Sample Data (Optional)
-- INSERT INTO users (name,email) VALUES ('John Doe','john@example.com');
` : ''}`;

    const configMap = `apiVersion: v1
kind: ConfigMap
metadata:
  name: postgres-init-scripts
data:
  01-schema.sql: |
${initScript.split("\n").map(line => "    " + line).join("\n")}`;

    const pvc = `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-data
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi`;

    const deployment = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:alpine
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_USER
              value: "admin"
            - name: POSTGRES_PASSWORD
              value: "admin"
            - name: POSTGRES_DB
              value: "myapp"
          volumeMounts:
            - name: postgres-data
              mountPath: /var/lib/postgresql/data
            - name: init-scripts
              mountPath: /docker-entrypoint-initdb.d
      volumes:
        - name: postgres-data
          persistentVolumeClaim:
            claimName: postgres-data
        - name: init-scripts
          configMap:
            name: postgres-init-scripts`;

    const service = `apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  selector:
    app: postgres
  ports:
    - protocol: TCP
      port: 5432
      targetPort: 5432
  type: ClusterIP`;

    const manifests = [configMap, pvc, deployment, service].join("\n---\n");

    const instructions = `# PostgreSQL Kubernetes Deployment Instructions
1. Save each manifest to a .yaml file or use combined file.
2. Apply manifests:
   kubectl apply -f postgres-k8s.yaml
3. Check pods:
   kubectl get pods
4. Access PostgreSQL within cluster using service 'postgres:5432'
5. Use kubectl exec to access container if needed:
   kubectl exec -it <pod-name> -- psql -U admin -d myapp`;

    return {
      manifests,
      files: [{ name: "postgres-k8s.yaml", content: manifests }],
      instructions,
    };
  }

  // ---------------- MySQL ----------------
  private generateMySQLK8s(schema: string, includeSampleData?: boolean): KubernetesGenerationResult {
    const initScript = `USE myapp;
${schema}
${includeSampleData ? `
-- Sample Data (Optional)
-- INSERT INTO users (name,email) VALUES ('John Doe','john@example.com');
` : ''}`;

    const configMap = `apiVersion: v1
kind: ConfigMap
metadata:
  name: mysql-init-scripts
data:
  01-schema.sql: |
${initScript.split("\n").map(line => "    " + line).join("\n")}`;

    const pvc = `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-data
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi`;

    const deployment = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
        - name: mysql
          image: mysql:8.0
          ports:
            - containerPort: 3306
          env:
            - name: MYSQL_ROOT_PASSWORD
              value: "rootpassword"
            - name: MYSQL_DATABASE
              value: "myapp"
            - name: MYSQL_USER
              value: "admin"
            - name: MYSQL_PASSWORD
              value: "admin"
          volumeMounts:
            - name: mysql-data
              mountPath: /var/lib/mysql
            - name: init-scripts
              mountPath: /docker-entrypoint-initdb.d
      volumes:
        - name: mysql-data
          persistentVolumeClaim:
            claimName: mysql-data
        - name: init-scripts
          configMap:
            name: mysql-init-scripts`;

    const service = `apiVersion: v1
kind: Service
metadata:
  name: mysql
spec:
  selector:
    app: mysql
  ports:
    - protocol: TCP
      port: 3306
      targetPort: 3306
  type: ClusterIP`;

    const manifests = [configMap, pvc, deployment, service].join("\n---\n");

    const instructions = `# MySQL Kubernetes Deployment Instructions
kubectl apply -f mysql-k8s.yaml
kubectl get pods
Access MySQL inside cluster using service 'mysql:3306'
Use kubectl exec -it <pod-name> -- mysql -u admin -p myapp`;

    return { manifests, files: [{ name: "mysql-k8s.yaml", content: manifests }], instructions };
  }

  // ---------------- MongoDB ----------------
  private generateMongoK8s(schema: string, includeSampleData?: boolean): KubernetesGenerationResult {
    const initScript = `db = db.getSiblingDB('myapp');
${schema}
${includeSampleData ? `
// Sample Data
// db.users.insertMany([{ name: 'John Doe', email: 'john@example.com'}]);
` : ''}`;

    const configMap = `apiVersion: v1
kind: ConfigMap
metadata:
  name: mongo-init-scripts
data:
  init-mongo.js: |
${initScript.split("\n").map(line => "    " + line).join("\n")}`;

    const pvc = `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongo-data
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi`;

    const deployment = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
        - name: mongodb
          image: mongo:latest
          ports:
            - containerPort: 27017
          env:
            - name: MONGO_INITDB_ROOT_USERNAME
              value: "admin"
            - name: MONGO_INITDB_ROOT_PASSWORD
              value: "admin"
            - name: MONGO_INITDB_DATABASE
              value: "myapp"
          volumeMounts:
            - name: mongo-data
              mountPath: /data/db
            - name: init-scripts
              mountPath: /docker-entrypoint-initdb.d
      volumes:
        - name: mongo-data
          persistentVolumeClaim:
            claimName: mongo-data
        - name: init-scripts
          configMap:
            name: mongo-init-scripts`;

    const service = `apiVersion: v1
kind: Service
metadata:
  name: mongodb
spec:
  selector:
    app: mongodb
  ports:
    - protocol: TCP
      port: 27017
      targetPort: 27017
  type: ClusterIP`;

    const manifests = [configMap, pvc, deployment, service].join("\n---\n");

    const instructions = `# MongoDB Kubernetes Deployment
kubectl apply -f mongo-k8s.yaml
kubectl get pods
Connect to MongoDB inside cluster using 'mongodb:27017'
kubectl exec -it <pod> -- mongosh -u admin -p admin --authenticationDatabase admin`;

    return { manifests, files: [{ name: "mongo-k8s.yaml", content: manifests }], instructions };
  }

  // ---------------- SQLite (simple pod, not clustered) ----------------
  private generateSQLiteK8s(schema: string, includeSampleData?: boolean): KubernetesGenerationResult {
    const initScript = `-- SQLite Database Schema
${schema}
${includeSampleData ? `
-- Sample Data
-- INSERT INTO users (name,email) VALUES ('John Doe','john@example.com');
` : ''}`;

    const configMap = `apiVersion: v1
kind: ConfigMap
metadata:
  name: sqlite-init-sql
data:
  schema.sql: |
${initScript.split("\n").map(line => "    " + line).join("\n")}`;

    const deployment = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: sqlite
spec:
  replicas: 1
  selector:
    matchLabels:
      app: sqlite
  template:
    metadata:
      labels:
        app: sqlite
    spec:
      containers:
        - name: sqlite
          image: alpine:latest
          command: ["/bin/sh", "-c"]
          args:
            - apk add --no-cache sqlite bash;
              mkdir -p /app/data;
              sqlite3 /app/data/myapp.db < /app/init/schema.sql;
              tail -f /dev/null;
          volumeMounts:
            - name: data
              mountPath: /app/data
            - name: init-sql
              mountPath: /app/init
      volumes:
        - name: data
          emptyDir: {}
        - name: init-sql
          configMap:
            name: sqlite-init-sql`;

    const manifests = [configMap, deployment].join("\n---\n");

    const instructions = `# SQLite Kubernetes Deployment
kubectl apply -f sqlite-k8s.yaml
kubectl get pods
SQLite DB file is inside pod at /app/data/myapp.db`;

    return { manifests, files: [{ name: "sqlite-k8s.yaml", content: manifests }], instructions };
  }

  // ---------------- SQL Server ----------------
  private generateSQLServerK8s(schema: string, includeSampleData?: boolean): KubernetesGenerationResult {
    const initScript = `-- SQL Server Database Schema
CREATE DATABASE myapp;
USE myapp;
${schema}
${includeSampleData ? `
-- Sample Data
-- INSERT INTO users (name,email) VALUES ('John Doe','john@example.com');
` : ''}
GO`;

    const configMap = `apiVersion: v1
kind: ConfigMap
metadata:
  name: sqlserver-init-scripts
data:
  01-schema.sql: |
${initScript.split("\n").map(line => "    " + line).join("\n")}`;

    const pvc = `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: sqlserver-data
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi`;

    const deployment = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: sqlserver
spec:
  replicas: 1
  selector:
    matchLabels:
      app: sqlserver
  template:
    metadata:
      labels:
        app: sqlserver
    spec:
      containers:
        - name: sqlserver
          image: mcr.microsoft.com/mssql/server:2022-latest
          ports:
            - containerPort: 1433
          env:
            - name: ACCEPT_EULA
              value: "Y"
            - name: SA_PASSWORD
              value: "YourStrong@Password123"
          volumeMounts:
            - name: data
              mountPath: /var/opt/mssql
            - name: init-scripts
              mountPath: /usr/src/app
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: sqlserver-data
        - name: init-scripts
          configMap:
            name: sqlserver-init-scripts`;

    const service = `apiVersion: v1
kind: Service
metadata:
  name: sqlserver
spec:
  selector:
    app: sqlserver
  ports:
    - protocol: TCP
      port: 1433
      targetPort: 1433
  type: ClusterIP`;

    const manifests = [configMap, pvc, deployment, service].join("\n---\n");

    const instructions = `# SQL Server Kubernetes Deployment
kubectl apply -f sqlserver-k8s.yaml
kubectl get pods
Connect inside cluster via service 'sqlserver:1433'
kubectl exec -it <pod> -- /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Password123'`;

    return { manifests, files: [{ name: "sqlserver-k8s.yaml", content: manifests }], instructions };
  }
}

export const kubernetesGeneratorService = new KubernetesGeneratorService();
