import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  Copy, 
  Bot,
  User,
  Sparkles,
  Cpu,
  Zap,
  Image,
  History,
  ChevronDown
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { Personality, Message } from "@/lib/types";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface EnhancedChatInterfaceProps {
  sessionId?: string;
  userId?: string;
  initialPersonality?: Personality;
  onPersonalityChange?: (personality: Personality) => void;
}

import ThreeStarField from "./ThreeStarField";
import { StarField } from "./StarField"; // Keep as fallback/unused for now

export default function EnhancedChatInterface({ 
  sessionId, 
  userId, 
  initialPersonality = "spiderman",
  onPersonalityChange
}: EnhancedChatInterfaceProps) {
  // ... state declarations ...
  const [personality, setPersonality] = useState<Personality>(initialPersonality);
  const [input, setInput] = useState("");
  const [suggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Model selection state
  const [models, setModels] = useState<Record<string, any>>({});
  const [selectedModel, setSelectedModel] = useState<string>("tngtech/deepseek-r1t-chimera:free");

  // Fetch available models on mount
  useEffect(() => {
    fetch('/api/models')
      .then(res => res.json())
      .then(data => {
        setModels(data);
        if (data['deepseek-r1t-chimera']?.id) {
          setSelectedModel(data['deepseek-r1t-chimera'].id);
        }
      })
      .catch(err => console.error("Failed to load models:", err));
  }, []);

  const { messages, isStreaming, sendMessage, isPending } = useChat({
    sessionId,
    userId,
  });

  const personalityConfig = {
    spiderman: { accent: 'bg-red-500', icon: Sparkles, label: 'Spider-Man' },
    ironman: { accent: 'bg-yellow-500', icon: Cpu, label: 'Iron Man' },
    captain: { accent: 'bg-blue-500', icon: Zap, label: 'Captain America' },
    thor: { accent: 'bg-blue-400', icon: Zap, label: 'Thor' },
    hulk: { accent: 'bg-green-500', icon: Zap, label: 'Hulk' },
    widow: { accent: 'bg-red-600', icon: Zap, label: 'Black Widow' },
    gandalf: { accent: 'bg-gray-400', icon: Sparkles, label: 'Gandalf' },
    yoda: { accent: 'bg-green-400', icon: Sparkles, label: 'Yoda' },
    sherlock: { accent: 'bg-amber-500', icon: Sparkles, label: 'Sherlock' },
    deadpool: { accent: 'bg-red-700', icon: Zap, label: 'Deadpool' },
    batman: { accent: 'bg-gray-700', icon: Sparkles, label: 'Batman' },
    joker: { accent: 'bg-purple-500', icon: Zap, label: 'Joker' }
  };

  const currentConfig = personalityConfig[personality];
  const PersonalityIcon = currentConfig.icon;

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim() || isPending || isStreaming) return;
    
    sendMessage(input.trim(), personality, selectedModel);
    setInput("");
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePersonalityChange = (newPersonality: Personality) => {
    setPersonality(newPersonality);
    onPersonalityChange?.(newPersonality);
  };

  return (
    <div className="flex flex-col h-screen relative bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-blue-500/30">
      <div className="absolute inset-0 z-0">
         <ThreeStarField />
      </div>
      
      {/* Header - Minimalist & Glass */}
      <header className="border-b border-white/5 bg-slate-950/30 backdrop-blur-xl sticky top-0 z-20 transition-all duration-300">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Left: Branding */}
            <div className="flex items-center gap-3 group cursor-pointer hover:opacity-100 transition-opacity">
              <div className={`w-9 h-9 rounded-xl ${currentConfig.accent} flex items-center justify-center shadow-lg shadow-${currentConfig.accent}/20 ring-1 ring-white/10 group-hover:scale-105 transition-transform`}>
                <PersonalityIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-wide">AI CHAT <span className="opacity-50 font-light">| PRO</span></h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">{currentConfig.label}</p>
              </div>
            </div>

            {/* Right: Minimalist Model Switcher */}
            <div className="flex items-center gap-4">
               {/* Mode Display Pill */}
               <div className="relative group">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="appearance-none bg-slate-900/50 hover:bg-slate-800/50 text-xs font-medium text-slate-300 border border-white/10 rounded-full px-4 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all cursor-pointer backdrop-blur-md"
                  >
                    <option value="tngtech/deepseek-r1t-chimera:free">🎭 Roleplay (Chimera)</option>
                    <option value="xiaomi/mimo-v2-flash:free">📚 Academia (Mimo)</option>
                    <option value="deepseek/deepseek-r1-0528:free">🧠 Reasoning (R1 0528)</option>
                    <option value="qwen/qwen3-coder:free">💻 Coding (Qwen 3)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none group-hover:text-slate-300 transition-colors" />
               </div>

               <div className="h-4 w-px bg-white/10 mx-1"></div>

               {/* Personality Quick Switcher (Avatar Stack) */}
               <div className="flex -space-x-2 overflow-hidden hover:space-x-1 transition-all duration-300 p-1">
                  {Object.entries(personalityConfig).slice(0, 5).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => handlePersonalityChange(key as Personality)}
                      className={`relative w-7 h-7 rounded-full ring-2 ring-slate-950 transition-transform hover:scale-110 hover:z-10 ${personality === key ? 'opacity-100 scale-110 z-10 ring-white/20' : 'opacity-60 hover:opacity-100'}`}
                      title={config.label}
                    >
                      <div className={`w-full h-full rounded-full ${config.accent} flex items-center justify-center`}>
                        <config.icon className="w-3 h-3 text-white" />
                      </div>
                    </button>
                  ))}
               </div>
            </div>
        </div>
      </header>

      {/* Messages Area - Glassmorphism & Floating Bubbles */}
      <div className="flex-1 overflow-y-auto z-10 custom-scrollbar">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          {messages.map((message) => {
            const isUser = message.sender === 'user';
            
            return (
              <div
                key={message.id}
                className={`flex gap-4 group ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <Avatar className="w-8 h-8 flex-shrink-0 ring-1 ring-white/10 shadow-lg mt-1">
                    <AvatarFallback className={`${currentConfig.accent} text-white`}>
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-3.5 backdrop-blur-md shadow-lg transition-all duration-300 ${
                    isUser 
                      ? 'bg-blue-600/80 hover:bg-blue-600/90 text-white rounded-tr-sm' 
                      : 'bg-slate-900/40 hover:bg-slate-900/50 border border-white/5 text-slate-200 rounded-tl-sm'
                  }`}
                >
                  <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: ({ node, className, children, ...props }: any) => {
                          const match = /language-(\w+)/.exec(className || '');
                          const isInline = !match;
                          return !isInline ? (
                            <div className="my-3 overflow-hidden rounded-lg border border-white/10 shadow-inner bg-slate-950/50">
                             <div className="bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 border-b border-white/5 flex justify-between">
                                <span>{match![1]}</span>
                                <span className="text-slate-600 cursor-pointer hover:text-white transition-colors">COPY</span>
                             </div>
                              <SyntaxHighlighter
                                style={atomDark as any}
                                language={match![1]}
                                PreTag="div"
                                className="!bg-transparent !m-0 !p-4 !text-sm"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code className="bg-white/10 border border-white/5 px-1.5 py-0.5 rounded text-xs font-mono text-blue-200" {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                    <span className="uppercase tracking-wider font-medium">{isUser ? 'You' : currentConfig.label}</span>
                    <span>{new Date(message.createdAt || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>

                {isUser && (
                  <Avatar className="w-8 h-8 flex-shrink-0 ring-1 ring-white/10 shadow-lg mt-1">
                    <AvatarFallback className="bg-blue-600 text-white">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
          
          {isStreaming && (
            <div className="flex gap-4">
              <Avatar className="w-8 h-8 ring-1 ring-white/10 mt-1">
                <AvatarFallback className={`${currentConfig.accent} text-white`}>
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Minimal Floating Pill */}
      <div className="z-20 p-6 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 flex items-end gap-2 transition-all focus-within:ring-1 focus-within:ring-blue-500/50 focus-within:bg-slate-900/80">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <Image className="h-5 w-5" />
            </button>
            
            <Textarea
               ref={textareaRef}
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={handleKeyDown}
               placeholder={`Message ${currentConfig.label}...`}
               className="flex-1 bg-transparent border-none resize-none text-white placeholder-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-3 min-h-[44px] max-h-[200px]"
               rows={1}
            />
            
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isPending || isStreaming}
              className={`p-3 rounded-xl transition-all duration-300 ${
                input.trim() && !isPending && !isStreaming
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95'
                  : 'bg-white/5 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <div className="text-center mt-3 text-[10px] text-slate-500 tracking-wider">
             POWERED BY <span className="text-slate-400 font-semibold">{models[Object.keys(models).find(k => models[k].id === selectedModel) || '']?.name || 'Loading...'}</span>
          </div>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
