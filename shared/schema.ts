import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  prompt: text("prompt").notNull(),
  databaseType: varchar("database_type", { length: 50 }).notNull(),
  schemas: jsonb("schemas").notNull().$type<{
    sql: string;
    prisma: string;
    mongoose: string;
    typeorm: string;
    sequelize: string;
    mysql: string;
    oracle: string;
    sqlserver: string;
    sqlite: string;
  }>(),
  explanation: text("explanation").notNull(),
  normalizationSuggestions: text("normalization_suggestions"),
  queryExamples: jsonb("query_examples").$type<Array<{
    name: string;
    description: string;
    query: string;
  }>>(),
  migrationScript: text("migration_script"),
  dockerfile: text("dockerfile"),
  dockerCompose: text("docker_compose"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const collaborationSessions = pgTable("collaboration_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(),
  username: text("username").notNull(),
  cursorPosition: jsonb("cursor_position").$type<{ x: number; y: number }>(),
  isActive: boolean("is_active").default(true).notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectProjectSchema = createSelectSchema(projects);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
