import { type User, type InsertUser, type Project, type InsertProject, projects, users } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, username),
    });
    return result;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user!;
  }

  async getAllProjects(): Promise<Project[]> {
    const result = await db.select().from(projects).orderBy(desc(projects.createdAt));
    return result;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const result = await db.query.projects.findFirst({
      where: (projects, { eq }) => eq(projects.id, id),
    });
    return result;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject!;
  }

  async updateProject(id: string, projectUpdate: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db
      .update(projects)
      .set({ ...projectUpdate, updatedAt: new Date() } as any)
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DbStorage();
