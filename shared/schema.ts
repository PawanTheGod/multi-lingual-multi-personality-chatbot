import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const personalityEnum = z.enum(["spiderman", "ironman", "captain", "thor", "hulk", "widow", "gandalf", "yoda", "sherlock", "deadpool", "batman", "joker"]);
export type Personality = z.infer<typeof personalityEnum>;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  nickname: text("nickname"),
  avatar: text("avatar"),
  preferences: jsonb("preferences").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title"),
  personality: text("personality").notNull().default("spiderman"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => chatSessions.id).notNull(),
  sender: text("sender").notNull(), // 'user' | 'bot'
  content: text("content").notNull(),
  personality: text("personality"),
  messageType: text("message_type").default("text"), // 'text' | 'image' | 'code'
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  nickname: true,
  avatar: true,
  preferences: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  userId: true,
  title: true,
  personality: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  sessionId: true,
  sender: true,
  content: true,
  personality: true,
  messageType: true,
  metadata: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Model Selection Types
export type ModelProvider = 'openai' | 'ollama' | 'huggingface' | 'local' | 'openrouter';
export type ModelType = 'chat' | 'vision' | 'multimodal';
export type ModelCapability = 'chat' | 'vision' | 'code' | 'streaming';
export type PerformanceLevel = 'fast' | 'medium' | 'slow';
export type QualityLevel = 'basic' | 'good' | 'excellent';
export type ResourceUsage = 'low' | 'medium' | 'high';

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  type: ModelType;
  capabilities: {
    chat: boolean;
    vision: boolean;
    code: boolean;
    streaming: boolean;
  };
  performance: {
    speed: PerformanceLevel;
    quality: QualityLevel;
    resourceUsage: ResourceUsage;
  };
  requirements: {
    vram?: string;
    ram?: string;
    internetRequired: boolean;
    apiKey?: boolean;
  };
  contextLength: number;
  maxTokens: number;
  description: string;
  isAvailable?: boolean;
}

export interface ModelSelectionRequest {
  modelId: string;
  sessionId: string;
  userId: string;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
  personality?: string;
  modelId?: string;
  imageData?: string;
}

export interface ModelAvailabilityResponse {
  available: ModelConfig[];
  recommended: {
    bestOverall: ModelConfig;
    mostEfficient: ModelConfig;
    bestLocal: ModelConfig;
    bestVision: ModelConfig;
  };
  categories: {
    multimodal: ModelConfig[];
    chat: ModelConfig[];
    vision: ModelConfig[];
  };
}