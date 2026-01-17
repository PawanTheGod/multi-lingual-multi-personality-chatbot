# Overview

HypeBuddy is an AI chatbot application with multiple personality modes (funny, wise, savage) built as a full-stack web application. The system uses a modern React frontend with a Node.js/Express backend, PostgreSQL database for persistence, and OpenAI's GPT model for chat responses. The application features real-time chat interactions, voice input/output capabilities, image analysis, and a visually appealing interface with particle animations and floating emojis.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and local React state for UI state
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Dark theme with purple accent colors, custom CSS variables, and responsive design
- **Voice Features**: Web Speech API integration for speech recognition and synthesis
- **Visual Effects**: Custom particle system background and floating emoji animations

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for user management, chat sessions, and message handling
- **File Upload**: Multer middleware for image upload processing
- **Development Setup**: Hot reload with tsx for development, esbuild for production bundling
- **Error Handling**: Centralized error middleware with structured error responses

## Database Layer
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM with connection pooling
- **Schema**: Three main entities - users, chat sessions, and messages with UUID primary keys
- **Migrations**: Drizzle Kit for schema management and migrations
- **Connection**: WebSocket support for serverless PostgreSQL connections

## AI Integration
- **Provider**: OpenAI GPT API with configurable personality prompts
- **Personalities**: Three distinct modes (funny, wise, savage) with different system prompts and temperature settings
- **Features**: Text chat, image analysis, and streaming responses
- **Configuration**: Environment-based API key management with fallback handling

## Session Management
- **Storage**: Database-persisted chat sessions linked to users
- **Organization**: Hierarchical structure with users → sessions → messages
- **Metadata**: Support for message types (text, image, code) and personality tracking
- **History**: Complete conversation history with timestamps and sender identification

# External Dependencies

- **Database**: Neon PostgreSQL serverless database for data persistence
- **AI Service**: OpenAI API for chat completions and image analysis
- **UI Components**: Radix UI for accessible component primitives
- **Fonts**: Google Fonts (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)
- **Icons**: Lucide React for consistent iconography
- **Build Tools**: Vite for frontend bundling, esbuild for backend compilation
- **Development Tools**: Replit integration with cartographer plugin and error overlay
- **Styling**: Tailwind CSS for utility-first styling approach