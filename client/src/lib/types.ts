export interface Message {
  id: string;
  sessionId: string;
  sender: 'user' | 'bot';
  content: string;
  personality?: string;
  messageType?: 'text' | 'image' | 'code';
  metadata?: any;
  createdAt?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title?: string;
  personality: 'spiderman' | 'ironman' | 'captain' | 'thor' | 'hulk' | 'widow';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  nickname?: string;
  avatar?: string;
  preferences?: any;
  createdAt: string;
}

export type { Personality } from "@shared/schema";

export interface ChatResponse {
  response: string;
}
