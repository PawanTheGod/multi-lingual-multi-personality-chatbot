import { users, chatSessions, messages, type User, type InsertUser, type ChatSession, type InsertChatSession, type Message, type InsertMessage } from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getChatSession(id: string): Promise<ChatSession | undefined>;
  getUserChatSessions(userId: string): Promise<ChatSession[]>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession>;
  deleteChatSession(id: string): Promise<void>;

  getSessionMessages(sessionId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getRecentMessages(sessionId: string, limit: number): Promise<Message[]>;
}

export class DatabaseStorage implements IStorage {
  private checkDb() {
    if (!db) {
      throw new Error("Database not connected. Please check DATABASE_URL in environment variables.");
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    this.checkDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    this.checkDb();
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    this.checkDb();
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    this.checkDb();
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session || undefined;
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    this.checkDb();
    return await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt));
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    this.checkDb();
    const [newSession] = await db
      .insert(chatSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession> {
    this.checkDb();
    const [updatedSession] = await db
      .update(chatSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chatSessions.id, id))
      .returning();
    return updatedSession;
  }

  async deleteChatSession(id: string): Promise<void> {
    this.checkDb();
    // First delete all messages in the session
    await db.delete(messages).where(eq(messages.sessionId, id));
    // Then delete the session itself
    await db.delete(chatSessions).where(eq(chatSessions.id, id));
  }

  async getSessionMessages(sessionId: string): Promise<Message[]> {
    this.checkDb();
    return await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    this.checkDb();
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getRecentMessages(sessionId: string, limit: number): Promise<Message[]> {
    this.checkDb();
    return await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }
}

import { nanoid } from "nanoid";

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sessions: Map<string, ChatSession>;
  private messages: Map<string, Message>;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.messages = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = insertUser.username; // Use username as ID for simplicity in memory mode
    const user: User = { ...insertUser, id, createdAt: new Date(), preferences: {} };
    this.users.set(id, user);
    return user;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.sessions.get(id);
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    return Array.from(this.sessions.values())
      .filter((session) => session.userId === userId)
      .sort((a, b) => {
        const timeA = a.updatedAt?.getTime() || 0;
        const timeB = b.updatedAt?.getTime() || 0;
        return timeB - timeA;
      });
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const id = nanoid();
    const newSession: ChatSession = {
      ...session,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      title: session.title || "New Session",
      personality: session.personality || "spiderman"
    };
    this.sessions.set(id, newSession);
    return newSession;
  }

  async updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession> {
    const session = this.sessions.get(id);
    if (!session) throw new Error("Session not found");
    const updatedSession = { ...session, ...updates, updatedAt: new Date() };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteChatSession(id: string): Promise<void> {
    this.sessions.delete(id);
    // Cleanup messages for this session
    for (const [msgId, msg] of this.messages.entries()) {
      if (msg.sessionId === id) {
        this.messages.delete(msgId);
      }
    }
  }

  async getSessionMessages(sessionId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((msg) => msg.sessionId === sessionId)
      .sort((a, b) => {
        const timeA = a.createdAt?.getTime() || 0;
        const timeB = b.createdAt?.getTime() || 0;
        return timeA - timeB;
      });
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = nanoid();
    const newMessage: Message = {
      ...message,
      id,
      createdAt: new Date(),
      messageType: message.messageType || "text",
      metadata: message.metadata || {},
      personality: message.personality || "spiderman"
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getRecentMessages(sessionId: string, limit: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((msg) => msg.sessionId === sessionId)
      .sort((a, b) => {
        const timeA = a.createdAt?.getTime() || 0;
        const timeB = b.createdAt?.getTime() || 0;
        return timeB - timeA;
      })
      .slice(0, limit);
  }
}

export const storage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemStorage();
