import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  Image,
  Mic,
  MicOff,
  History,
  ChevronLeft,
  Volume2,
  Copy,
  Zap,
  Shield,
  Hammer,
  Heart,
  Bug,
  User,
  Target,
  X,
  Upload,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useVoice } from "@/hooks/useVoice";
import ChatHistorySidebar from "./ChatHistorySidebar";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

import { Message, Personality as MarvelPersonality } from "@/lib/types";

interface ImageWithModalProps {
  src?: string;
  alt?: string;
  [key: string]: any;
}

function ImageWithModal({ src, alt, ...props }: ImageWithModalProps) {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div className="my-3">
      <div 
        className="relative group cursor-pointer rounded-xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-200 hover:scale-[1.02]"
        onClick={() => setShowModal(true)}
      >
        <img 
          src={src}
          alt={alt}
          className="max-w-full h-auto max-h-96 object-contain bg-black/20" 
          loading="lazy"
          {...props}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-black/70 backdrop-blur-sm rounded-full p-2">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Image Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={src}
                alt={alt}
                className="max-w-full max-h-full object-contain rounded-xl border border-white/20"
              />
              <button
                onClick={() => setShowModal(false)}
                className="absolute -top-2 -right-2 bg-red-500/80 hover:bg-red-500 rounded-full p-2 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SpiderBuddyChatInterfaceProps {
  sessionId?: string;
  userId?: string;
  initialPersonality?: MarvelPersonality;
  onPersonalityChange?: (personality: MarvelPersonality) => void;
  onSessionChange?: (sessionId: string) => void;
  onNewSession?: (personality: MarvelPersonality) => void;
}

export default function SpiderBuddyChatInterface({ 
  sessionId, 
  userId, 
  initialPersonality = "spiderman",
  onPersonalityChange,
  onSessionChange,
  onNewSession
}: SpiderBuddyChatInterfaceProps) {
  const [personality, setPersonality] = useState<MarvelPersonality>(initialPersonality);
  const [input, setInput] = useState("");
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [spiderSense, setSpiderSense] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, isStreaming, sendMessage, clearChat, refreshMessages, isPending } = useChat({
    sessionId,
    userId,
  });

  const { 
    isListening, 
    isSupported, 
    transcript, 
    startListening, 
    stopListening,
    speak, 
  } = useVoice();

  useEffect(() => {
    if (transcript && !isListening) {
      setInput(transcript);
    }
  }, [transcript, isListening]);

  const personalityConfigs = {
    spiderman: {
      name: 'Spider-Man',
      colors: {
        primary: 'text-red-500',
        secondary: 'text-blue-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        gradient: 'from-red-500/20 via-blue-500/20 to-red-500/20'
      },
      icon: Bug,
      emoji: '🕷️',
      catchphrase: 'Your friendly neighborhood AI!'
    },
    ironman: {
      name: 'Iron Man',
      colors: {
        primary: 'text-yellow-500',
        secondary: 'text-red-500',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        gradient: 'from-yellow-500/20 via-red-500/20 to-yellow-500/20'
      },
      icon: Zap,
      emoji: '⚡',
      catchphrase: 'Genius, billionaire, playboy, philanthropist AI'
    },
    captain: {
      name: 'Captain America',
      colors: {
        primary: 'text-blue-600',
        secondary: 'text-red-600',
        bg: 'bg-blue-600/10',
        border: 'border-blue-600/30',
        gradient: 'from-blue-600/20 via-red-600/20 to-blue-600/20'
      },
      icon: Shield,
      emoji: '🛡️',
      catchphrase: 'I can do this all day!'
    },
    thor: {
      name: 'Thor',
      colors: {
        primary: 'text-blue-400',
        secondary: 'text-yellow-400',
        bg: 'bg-blue-400/10',
        border: 'border-blue-400/30',
        gradient: 'from-blue-400/20 via-yellow-400/20 to-blue-400/20'
      },
      icon: Hammer,
      emoji: '🔨',
      catchphrase: 'For Asgard!'
    },
    hulk: {
      name: 'Hulk',
      colors: {
        primary: 'text-green-500',
        secondary: 'text-purple-500',
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        gradient: 'from-green-500/20 via-purple-500/20 to-green-500/20'
      },
      icon: Heart,
      emoji: '💚',
      catchphrase: 'HULK SMASH... but gently!'
    },
    widow: {
      name: 'Black Widow',
      colors: {
        primary: 'text-red-400',
        secondary: 'text-gray-400',
        bg: 'bg-red-400/10',
        border: 'border-red-400/30',
        gradient: 'from-red-400/20 via-gray-700/20 to-red-400/20'
      },
      icon: Target,
      emoji: '🖤',
      catchphrase: 'I\'ve got red in my ledger'
    }
  };

  const currentConfig = personalityConfigs[personality];
  const PersonalityIcon = currentConfig.icon;

  // Spider-sense effect
  useEffect(() => {
    if (isStreaming) {
      setSpiderSense(true);
      const timer = setTimeout(() => setSpiderSense(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isStreaming]);

  // Auto-scroll to bottom with smooth animation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Typing indicator removed - we use real-time streaming instead

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  const handleSendMessage = () => {
    if (!input.trim() || isPending || isStreaming) return;
    
    sendMessage(input.trim(), personality);
    setInput("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Generate personality-specific suggestions
    generateSuggestions();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePersonalityChange = (newPersonality: MarvelPersonality) => {
    // Transformation effect
    setSpiderSense(true);
    setTimeout(() => {
      setPersonality(newPersonality);
      onPersonalityChange?.(newPersonality);
      setSpiderSense(false);
    }, 500);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sessionId) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image too large. Please select an image smaller than 10MB.');
      return;
    }

    setUploadingImage(true);
    setUploadProgress(0);
    
    // Create preview URL
    const imagePreview = URL.createObjectURL(file);
    setPreviewImage(imagePreview);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      
      // Prepare form data for API call
      const formData = new FormData();
      formData.append('image', file);
      formData.append('sessionId', sessionId);
      formData.append('personality', personality);
      if (userId) formData.append('userId', userId);
      
      // Send to vision API which will handle both user and bot message creation
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }
      
      const result = await response.json();
      
      // Brief success state
      setTimeout(() => {
        setUploadProgress(0);
        setPreviewImage(null);
        URL.revokeObjectURL(imagePreview);
      }, 1000);
      
      // Refresh messages to show both user image and AI response
      refreshMessages();
      
    } catch (error) {
      console.error('Image analysis error:', error);
      alert('Failed to analyze image. Please try again.');
      
      // Clean up on error
      setPreviewImage(null);
      URL.revokeObjectURL(imagePreview);
    } finally {
      setUploadingImage(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const generateSuggestions = () => {
    const personalitySuggestions = {
      spiderman: [
        "How do I balance responsibility and fun?",
        "Tell me a web-slinging joke!",
        "What's it like being a friendly neighborhood hero?"
      ],
      ironman: [
        "Explain quantum physics like Tony Stark",
        "What's the latest in tech innovation?",
        "How do I build an arc reactor?"
      ],
      captain: [
        "Give me motivation to do the right thing",
        "What does leadership really mean?",
        "How do I stay strong in tough times?"
      ],
      thor: [
        "Tell me about Asgardian wisdom",
        "What makes someone worthy?",
        "Share a tale from the Nine Realms"
      ],
      hulk: [
        "Help me manage my anger",
        "HULK WANT TO KNOW ABOUT SCIENCE!",
        "How do I find balance between strength and control?"
      ],
      widow: [
        "Teach me spy tactics",
        "How do I overcome a difficult past?",
        "What's the art of strategic thinking?"
      ]
    };
    
    setSuggestions(personalitySuggestions[personality]);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSessionSelect = (newSessionId: string) => {
    onSessionChange?.(newSessionId);
    setIsSidebarOpen(false);
  };

  const handleNewSession = (personality: MarvelPersonality) => {
    onNewSession?.(personality);
    setIsSidebarOpen(false);
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.sender === 'user';
    const messageConfig = personalityConfigs[(message.personality as Personality) || personality];
    const isImageMessage = message.messageType === 'image';
    const raw = message.content || '';

    // Enhanced code detection - checks if content looks like code without markdown
    const looksLikeCode = !raw.includes("```") && (
      // Has multiple programming keywords
      (raw.match(/\b(class|public|private|protected|import|package|void|int|String|function|const|let|var|def|return|if|else|for|while|#include|namespace|using)\b/g) || []).length >= 2 &&
      // Has code-like syntax
      (/[{};()]/.test(raw) || /\n\s{2,}/.test(raw)) &&
      // Not just a casual mention
      raw.split('\n').length > 1
    );

    const guessLanguage = () => {
      if (/\bpackage\s+|\bpublic\s+class\b|System\.out\.println|\.java\b/.test(raw)) return 'java';
      if (/#include\s+<|std::|cout|cin|\.cpp\b|\.h\b/.test(raw)) return 'cpp';
      if (/def\s+\w+\(|print\(|import\s+\w+|\.py\b|__init__|self\./.test(raw)) return 'python';
      if (/function\s+|const\s+|let\s+|var\s+|=>|\.js\b|console\.log|require\(/.test(raw)) return 'javascript';
      if (/<w+>|<\/w+>|\.html\b|<!DOCTYPE/.test(raw)) return 'html';
      if (/\.css\b|@media|\.class|#id|\{[^}]*:[^}]*\}/.test(raw)) return 'css';
      if (/SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN/i.test(raw)) return 'sql';
      return 'text';
    };
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`flex items-start gap-3 mb-4 group ${isUser ? 'justify-end' : ''} ${
          isImageMessage ? 'image-message' : ''
        }`}
      >
        {!isUser && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="relative"
          >
            <Avatar className={`w-14 h-14 border-2 ${messageConfig.border} shadow-lg ${spiderSense ? 'animate-pulse' : ''}`}> 
              <AvatarFallback className={`bg-gradient-to-br ${messageConfig.gradient} backdrop-blur-sm`}>
                <PersonalityIcon className={`w-7 h-7 ${messageConfig.colors.primary}`} />
              </AvatarFallback>
            </Avatar>
            {spiderSense && personality === 'spiderman' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute -top-2 -right-2 text-red-500 text-xl"
              >
                🕷️
              </motion.div>
            )}
          </motion.div>
        )}
        
        <div
          className={`glass-morphism ${
            isImageMessage ? 'max-w-[85%]' : 'max-w-[75%]'
          } ${ 
            isUser 
              ? 'bg-white/10 border-white/20'
              : `${messageConfig.colors.bg} ${messageConfig.border}`
          } border backdrop-blur-xl rounded-2xl p-4 shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
            isImageMessage && isUser ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-400/30' : ''
          }`}
        >
          <div className="text-white/90 leading-relaxed relative z-10">
            {looksLikeCode ? (
              <div className="my-4 relative group">
                <div className={`flex items-center justify-between px-4 py-2 ${messageConfig.colors.bg} ${messageConfig.border} border-b rounded-t-xl`}>
                  <span className={`text-xs font-mono ${messageConfig.colors.primary}`}>
                    {guessLanguage().toUpperCase()}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-white/60 hover:text-white"
                      onClick={() => navigator.clipboard.writeText(raw)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <SyntaxHighlighter
                  style={atomDark}
                  language={guessLanguage()}
                  PreTag="div"
                  className="rounded-t-none rounded-b-xl !bg-black/30 backdrop-blur-sm border-0 !m-0"
                  customStyle={{ background: 'transparent', border: 'none', margin: 0 }}
                  showLineNumbers
                  wrapLongLines={false}
                  lineNumberStyle={{ color: 'rgba(148,163,184,0.6)', paddingRight: '12px', userSelect: 'none' }}
                >
                  {raw}
                </SyntaxHighlighter>
              </div>
            ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({ node, ...props }) => (
                  <ImageWithModal {...props} />
                ),
                code: ({ node, inline, className, children, ...props }: { node?: any; inline?: boolean; className?: string; children?: React.ReactNode;[key: string]: any; }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeContent = String(children).replace(/\n$/, '');
                  
                  return !inline && match ? (
                    <div className="my-4 relative group">
                      {/* Code Block Header */}
                      <div className={`flex items-center justify-between px-4 py-2 ${messageConfig.colors.bg} ${messageConfig.border} border-b rounded-t-xl`}>
                        <span className={`text-xs font-mono ${messageConfig.colors.primary}`}>
                          {match[1].toUpperCase()}
                        </span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-white/60 hover:text-white"
                            onClick={() => navigator.clipboard.writeText(codeContent)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          {!isUser && isSupported && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-white/60 hover:text-white"
                              onClick={() => speak(`Code in ${match[1]}: ${codeContent}`, personality)}
                            >
                              <Volume2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Enhanced Syntax Highlighter */}
                      <SyntaxHighlighter
                        style={atomDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-t-none rounded-b-xl !bg-black/30 backdrop-blur-sm border-0 !m-0"
                        customStyle={{
                          background: 'transparent',
                          border: 'none',
                          margin: 0
                        }}
                        {...props}
                      >
                        {codeContent}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-black/20 px-2 py-1 rounded text-sm backdrop-blur-sm" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
            )}
          </div>
          
          {/* Message actions */}
          <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-white/60 hover:text-white transition-colors"
                onClick={() => navigator.clipboard.writeText(message.content)}
              >
                <Copy className="h-3 w-3" />
              </Button>
              {!isUser && isSupported && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-white/60 hover:text-white transition-colors"
                  onClick={() => speak(message.content, (message.personality as MarvelPersonality) || personality)}
                >
                  <Volume2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <span className="text-xs text-white/40">
              {new Date(message.createdAt || '').toLocaleTimeString()}
            </span>
          </div>
        </div>

        {isUser && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <Avatar className="w-14 h-14 border-2 border-white/20 shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-purple-500/80 to-pink-500/80 backdrop-blur-sm">
                <User className="w-7 h-7 text-white" />
              </AvatarFallback>
            </Avatar>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex h-screen relative">
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userId={userId}
        currentSessionId={sessionId}
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Compact Header */}
        <header 
          className="glass-morphism bg-black/20 backdrop-blur-xl border-b border-white/10 p-2 flex-shrink-0"
        >
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-white/60 hover:text-white p-1"
              >
                <History className="h-3 w-3" />
              </Button>
              
              <div className="flex items-center gap-2">
                <motion.div
                  animate={spiderSense ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <PersonalityIcon className={`h-5 w-5 ${currentConfig.colors.primary}`} />
                </motion.div>
                <div>
                  <h1 
                    className="text-lg font-bold text-gradient"
                  >
                    SpiderBuddy -
                  </h1>
                  <p className={`text-xs ${currentConfig.colors.primary} font-medium hidden sm:block`}>
                    {currentConfig.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Compact Avengers Switcher */}
            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/10">
              {(Object.keys(personalityConfigs) as MarvelPersonality[]).map((p) => {
                const config = personalityConfigs[p];
                const Icon = config.icon;
                return (
                  <button
                    key={p}
                    onClick={() => handlePersonalityChange(p)}
                    className={`p-2 rounded-lg transition-all duration-200 ${ 
                      personality === p 
                        ? `${config.colors.bg} ${config.colors.border} border shadow-md` 
                        : 'hover:bg-white/10'
                    }`}
                    title={config.name}
                  >
                    <Icon className={`h-4 w-4 ${personality === p ? config.colors.primary : 'text-white/60'}`} />
                    <span className="absolute -top-1 -right-1 text-xs">{config.emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Messages Area - Maximized */}
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="h-full overflow-y-auto p-3 max-w-6xl mx-auto custom-scrollbar">
            <AnimatePresence>
              {messages.map((message, index) => renderMessage(message, index))}
            </AnimatePresence>
            
            {/* Typing Indicator removed - using real-time streaming instead */}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Upload Progress Overlay */}
        <AnimatePresence>
          {uploadingImage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mx-3 mb-3"
            >
              <div className={`glass-morphism ${currentConfig.colors.bg} ${currentConfig.colors.border} border backdrop-blur-xl rounded-xl p-4 max-w-6xl mx-auto`}>
                <div className="flex items-center gap-4">
                  {/* Preview Image */}
                  {previewImage && (
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <img 
                        src={previewImage} 
                        alt="Upload preview" 
                        className="w-full h-full object-cover rounded-lg border border-white/20"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                        {uploadProgress === 100 ? (
                          <CheckCircle className={`w-6 h-6 ${currentConfig.colors.primary}`} />
                        ) : (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          >
                            <Upload className={`w-6 h-6 ${currentConfig.colors.primary}`} />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Progress Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">
                        {uploadProgress === 100 ? 'Analysis Complete!' : `Analyzing with ${currentConfig.name}...`}
                      </span>
                      <span className={`text-sm ${currentConfig.colors.primary} font-mono`}>
                        {Math.round(uploadProgress)}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className={`h-full bg-gradient-to-r ${currentConfig.gradient} rounded-full`}
                      />
                    </div>
                    
                    {/* Status Text */}
                    <p className="text-white/60 text-xs mt-2">
                      {uploadProgress < 30 && 'Uploading image...'}
                      {uploadProgress >= 30 && uploadProgress < 70 && 'Processing with LLaVA vision...'}
                      {uploadProgress >= 70 && uploadProgress < 100 && `${currentConfig.name} is analyzing...`}
                      {uploadProgress === 100 && `${currentConfig.name} has finished the analysis!`}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compact Input Area */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-morphism bg-black/20 backdrop-blur-xl border-t border-white/10 p-3 flex-shrink-0"
        >
          <div className="max-w-6xl mx-auto">
            {/* Compact Suggestions */}
            {suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2 flex flex-wrap gap-1"
              >
                {suggestions.slice(0, 2).map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className={`px-2 py-1 rounded-lg text-xs glass-morphism ${currentConfig.colors.bg} ${currentConfig.colors.border} border text-white/80 hover:text-white transition-all duration-200`}
                  >
                    {suggestion.slice(0, 30)}...
                  </button>
                ))}
              </motion.div>
            )}

            {/* Compact Input Form */}
            <div className="flex items-end gap-2">
              <div className="flex-1 glass-morphism bg-white/5 border border-white/20 rounded-xl p-2">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={`Chat as ${currentConfig.name}...`}
                  className="bg-transparent border-none resize-none text-white placeholder-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                  rows={1}
                />
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage || isPending || isStreaming}
                  title={uploadingImage ? 'Analyzing image...' : `Upload image for ${currentConfig.name} to analyze`}
                  className={`p-2 glass-morphism border rounded-lg transition-all duration-200 ${
                    uploadingImage 
                      ? `${currentConfig.colors.bg} ${currentConfig.colors.border} ${currentConfig.colors.primary} cursor-not-allowed` 
                      : 'bg-white/10 border-white/20 text-white/60 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {uploadingImage ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Image className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Image className="h-4 w-4" />
                  )}
                </button>
                
                <button
                  onClick={handleVoiceToggle}
                  className={`p-2 glass-morphism border rounded-lg transition-all duration-200 ${ 
                    isListening 
                      ? 'bg-red-500/20 border-red-400/30 text-red-400'
                      : 'bg-white/10 border-white/20 text-white/60 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isPending || isStreaming}
                  className={`p-2 glass-morphism border rounded-lg transition-all duration-200 ${ 
                    input.trim() && !isPending && !isStreaming
                      ? `${currentConfig.colors.bg} ${currentConfig.colors.border} ${currentConfig.colors.primary} hover:opacity-80` 
                      : 'bg-white/10 border-white/20 text-white/40 cursor-not-allowed'
                  }`}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}
