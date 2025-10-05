import { SchemaOutput } from "../schema-output";

export default function SchemaOutputExample() {
  const sqlSchema = `CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(500) NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

  const prismaSchema = `model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  content   String?
  published Boolean  @default(false)
  createdAt DateTime @default(now())
}`;

  const mongooseSchema = `const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  content: String,
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});`;

  const explanation = `This schema is designed for a simple blogging platform. The Users table stores user information with unique email addresses. The Posts table contains blog posts with a foreign key relationship to Users, allowing each user to have multiple posts. The published flag enables draft functionality, and timestamps track creation dates for both entities.`;

  return (
    <div className="p-6 max-w-4xl">
      <SchemaOutput
        sqlSchema={sqlSchema}
        prismaSchema={prismaSchema}
        mongooseSchema={mongooseSchema}
        explanation={explanation}
      />
    </div>
  );
}
