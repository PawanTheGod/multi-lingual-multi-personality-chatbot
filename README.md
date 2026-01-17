# 🕷️ SpiderBuddy - Your Friendly Neighborhood AI with Avengers Powers!

<div align="center">

![SpiderBuddy Logo](https://img.shields.io/badge/SpiderBuddy-Avengers%20AI-red?style=for-the-badge&logo=spider)

**Your amazing friendly neighborhood AI chatbot with the personalities of your favorite Avengers heroes!**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescript.org)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Ollama](https://img.shields.io/badge/Ollama-Local%20LLM-orange?style=for-the-badge)](https://ollama.ai)

</div>

## ✨ Features

### 🎭 **Avengers Personalities**
- **🕷️ Spider-Man**: Your friendly neighborhood hero with witty quips and scientific genius
- **⚡ Iron Man**: Tony Stark's confidence, tech expertise, and charming arrogance
- **🛡️ Captain America**: Steve Rogers' moral compass, leadership, and unwavering determination
- **🔨 Thor**: Asgardian wisdom, noble speech, and the power of thunder
- **💪 Hulk**: Banner's intellect mixed with Hulk's raw power and protective nature
- **🕷️ Black Widow**: Natasha's strategic mind, spy skills, and hidden warmth

### 🎨 **Marvel-Themed UI/UX**
- **Web-Pattern Backgrounds**: Interactive spider web animations with hero-specific theming
- **Superhero Aesthetics**: Each Avenger has unique colors, animations, and visual effects
- **Spider-Sense Alerts**: Visual feedback and animations during AI processing
- **Hero Transformation Effects**: Smooth transitions when switching between personalities
- **Comic Book Styling**: Professional design inspired by Marvel's visual language

### 🚀 **Advanced Features**
- **Real-time Streaming**: Live chat responses with typing indicators
- **Voice Integration**: Text-to-speech with Web Speech API
- **Image Analysis**: Upload and analyze images with Llava vision model
- **Chat History**: Persistent sessions with PostgreSQL database
- **Local LLM Support**: Works with Ollama (Gemma, Llava) or OpenAI

### 🛠 **Technical Stack**

#### Frontend
- **React 18** with TypeScript
- **Vite** for lightning-fast development
- **Shadcn/ui** components with Radix UI primitives
- **TailwindCSS** with custom animations
- **Framer Motion** for advanced animations
- **TanStack Query** for efficient state management

#### Backend  
- **Node.js/Express** with TypeScript
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** for data persistence
- **Streaming API** for real-time chat responses
- **Multer** for file upload handling

#### AI Integration
- **Ollama** for local LLM inference (Gemma 3:4b, Llava)
- **OpenAI API** support as fallback
- **Streaming responses** for real-time chat experience
- **Context-aware** conversations with memory

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **PostgreSQL** database
- **Ollama** with models installed (optional, can use OpenAI)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/hypebuddy.git
cd hypebuddy
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/hypebuddy

# Local LLM Configuration (Ollama)
LOCAL_LLM_BASE_URL=http://localhost:11434/v1
LOCAL_LLM_API_KEY=ollama
MODEL_NAME=gemma2:2b
LOCAL_LLM_VISION_MODEL=llava:latest

# Development Settings
NODE_ENV=development
PORT=5000
```

4. **Setup database**
```bash
npm run db:push
```

5. **Install Ollama models** (if using local LLM)
```bash
ollama pull gemma2:2b
ollama pull llava:latest
```

6. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:5000` to experience HypeBuddy!

## 🎯 Usage

### Personality Switching
Click the personality icons in the header to switch between:
- 😂 **Funny** - For laughs and entertainment
- 🧘 **Wise** - For deep insights and advice  
- 🔥 **Savage** - For honest, direct feedback

### Voice Features
- Click the speaker icon to hear responses
- Use the microphone for voice input
- Adjust voice settings in preferences

### Image Analysis
- Upload images using the image button
- Get detailed analysis from the Llava vision model
- Support for multiple image formats

### Chat Management
- Access chat history via the sidebar
- Create new sessions for different topics
- Search through conversation history

## 🎨 UI Highlights

### Glassmorphism Effects
```css
.glass-morphism {
  backdrop-filter: blur(20px) saturate(180%);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```

### Dynamic Animations
- Particle systems with mouse interaction  
- Smooth personality transitions
- Message appearance animations
- Interactive hover effects

### Responsive Design
- Mobile-first approach
- Touch-friendly interactions
- Adaptive layouts for all screen sizes
- Optimized performance across devices

## 🏗 Architecture

### Monorepo Structure
```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Route components
│   │   └── styles/      # CSS and styling
├── server/          # Express backend
│   ├── ai-service.ts    # AI abstraction layer
│   ├── ollama.ts        # Ollama integration
│   ├── routes.ts        # API endpoints
│   └── storage.ts       # Database layer
└── shared/          # Common types and schemas
    └── schema.ts        # Database schema
```

### Key Design Patterns
- **Dependency Injection**: Dynamic AI service loading
- **Type Safety**: End-to-end TypeScript with Zod validation
- **Real-time Communication**: Streaming HTTP responses
- **Progressive Enhancement**: Works without JavaScript for basic features

## 🔧 Development Commands

```bash
# Development with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run check

# Database operations
npm run db:push
```

## 🎭 Personality System

Each personality has unique:
- **System prompts** for different response styles
- **Visual themes** with custom colors and animations  
- **Temperature settings** for response creativity
- **UI elements** that adapt to the active personality

### Example Personality Configuration
```typescript
const personalityConfig = {
  funny: {
    systemPrompt: "You are HypeBuddy in FUNNY mode! 😂...",
    temperature: 0.9,
    gradient: 'from-yellow-400/20 via-orange-400/20 to-pink-400/20',
    accent: 'text-yellow-400'
  }
}
```

## 🔮 Advanced Features

### Real-time Streaming
- **Chunked responses** for immediate feedback
- **Typing indicators** during AI processing  
- **Abort controllers** for request cancellation
- **Error handling** with graceful degradation

### Voice Integration
- **Web Speech API** for synthesis
- **Multiple voice options** with language support
- **Playback controls** (play, pause, stop)
- **Visual feedback** during speech

### Image Processing
- **Drag & drop** image upload
- **Multiple format** support (JPG, PNG, WebP)
- **Real-time analysis** with progress indicators
- **Integrated responses** in chat flow

## 🚀 Performance Optimizations

- **Code splitting** for optimal bundle sizes
- **Lazy loading** of heavy components
- **Optimistic updates** for instant UI feedback
- **Connection pooling** for database efficiency
- **Caching strategies** for repeated requests

## 🛡 Security & Privacy

- **No data collection** - all conversations stay local
- **Environment variables** for sensitive configuration
- **Input validation** with Zod schemas
- **SQL injection protection** with parameterized queries
- **Rate limiting** to prevent abuse

## 📱 Mobile Experience

- **Touch gestures** for navigation
- **Responsive breakpoints** for all screen sizes
- **PWA ready** for native app-like experience
- **Optimized animations** for mobile performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙋 Support

- 📧 **Email**: support@hypebuddy.ai
- 💬 **Discord**: [Join our community](https://discord.gg/hypebuddy)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/hypebuddy/issues)
- 📖 **Documentation**: [Full Docs](https://docs.hypebuddy.ai)

---

<div align="center">

**Made with ❤️ by developers, for developers**

[![Stars](https://img.shields.io/github/stars/yourusername/hypebuddy?style=social)](https://github.com/yourusername/hypebuddy/stargazers)
[![Forks](https://img.shields.io/github/forks/yourusername/hypebuddy?style=social)](https://github.com/yourusername/hypebuddy/network)

</div>
