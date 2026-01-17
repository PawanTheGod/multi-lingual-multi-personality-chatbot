# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

HypeBuddy is an AI chatbot application with multiple personality modes (funny, wise, savage) built as a full-stack TypeScript application. The system combines a React frontend with a Node.js/Express backend, PostgreSQL database, and OpenAI's GPT model for intelligent chat responses. Features include real-time streaming chat, voice input/output, image analysis, and animated visual effects.

## Development Commands

### Essential Commands

```powershell
# Install dependencies
npm install

# Start development server (frontend + backend with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check

# Database schema operations
npm run db:push
```

### Database Management

```powershell
# Push schema changes to database
npm run db:push

# Note: Database migrations are handled through Drizzle Kit
# Check drizzle.config.ts for configuration
```

## Architecture Overview

### Monorepo Structure

The project uses a monorepo architecture with shared TypeScript code:

- `client/` - React frontend with Vite build system
- `server/` - Express.js backend with TypeScript
- `shared/` - Common schema definitions and types using Drizzle ORM

### Frontend Architecture

**Key Technologies:**
- React 18 with TypeScript and Vite
- Shadcn/ui components built on Radix UI primitives
- TanStack Query for server state management
- Wouter for lightweight routing
- Tailwind CSS with custom animations and themes

**Core Components:**
- `ChatInterface.tsx` - Main chat UI with streaming message display
- `ParticlesBackground.tsx` - Animated particle system
- `VoiceInput.tsx` - Web Speech API integration
- Extensive UI component library in `components/ui/`

**State Management Pattern:**
- Server state: TanStack Query with React hooks
- UI state: Local React state with custom hooks
- Real-time updates: Streaming HTTP responses for chat

### Backend Architecture

**API Design:**
- RESTful endpoints with streaming support for chat
- Express middleware for request logging and error handling
- Multer for file upload processing (image analysis)
- Structured error responses with proper HTTP status codes

**Key Endpoints:**
- `POST /api/users` - User creation/retrieval
- `GET /api/sessions/:userId` - Get chat sessions
- `POST /api/sessions` - Create new chat session
- `POST /api/chat` - Streaming chat endpoint
- `POST /api/analyze-image` - Image analysis with OpenAI Vision

**Development vs Production:**
- Development: Vite dev server integration with HMR
- Production: Static file serving from `dist/public`
- Environment-based port configuration (default: 5000)

### Database Schema

**Core Entities (PostgreSQL with Drizzle ORM):**

```typescript
// Users table
users: {
  id: UUID (primary key),
  username: text (unique),
  nickname: text,
  avatar: text,
  preferences: jsonb,
  createdAt: timestamp
}

// Chat sessions table
chatSessions: {
  id: UUID (primary key),
  userId: UUID (foreign key to users),
  title: text,
  personality: text (funny|wise|savage),
  createdAt: timestamp,
  updatedAt: timestamp
}

// Messages table
messages: {
  id: UUID (primary key),
  sessionId: UUID (foreign key to chatSessions),
  sender: text (user|bot),
  content: text,
  personality: text,
  messageType: text (text|image|code),
  metadata: jsonb,
  createdAt: timestamp
}
```

### AI Integration Pattern

**OpenAI Integration:**
- Configurable personality prompts with different temperature settings
- Streaming response handling for real-time chat experience
- Image analysis using GPT Vision API
- Context-aware conversations with message history

**Personality System:**
- Three distinct AI personalities: funny, wise, savage
- Different system prompts and response styles per personality
- Personality switching within conversations
- Visual theming tied to personality selection

### Key Architectural Patterns

**Streaming Communication:**
- Server-sent events for real-time chat streaming
- Chunked transfer encoding for progressive response display
- Client-side stream parsing and state updates

**Type Safety:**
- Shared TypeScript types between frontend and backend
- Zod schemas for API validation and type inference
- Drizzle ORM for type-safe database operations

**Environment Configuration:**
- dotenv for development environment variables
- Required: `DATABASE_URL` for PostgreSQL connection
- Required: OpenAI API key for AI functionality

## File Organization

### Import Aliases
```typescript
"@/*" → "./client/src/*"     // Frontend components and utilities
"@shared/*" → "./shared/*"   // Shared types and schemas
"@assets/*" → "./attached_assets/*" // Static assets
```

### Critical Files
- `server/routes.ts` - All API endpoint definitions
- `server/storage.ts` - Database abstraction layer
- `server/openai.ts` - AI service integration
- `shared/schema.ts` - Database schema and type definitions
- `client/src/hooks/useChat.ts` - Chat state management
- `client/src/components/ChatInterface.tsx` - Main UI component

## Development Notes

### Database Setup
Requires PostgreSQL database (configured for Neon serverless). Ensure `DATABASE_URL` environment variable is set before running any commands.

### Hot Reload Setup
The development server (`npm run dev`) integrates Vite's HMR with the Express backend, providing full-stack hot reloading.

### Voice Features
Uses Web Speech API for browser-based voice recognition and synthesis. No external TTS service required for basic functionality.

### Image Analysis
Supports image upload and analysis through OpenAI's Vision API. Files are processed in memory (not stored on disk).
