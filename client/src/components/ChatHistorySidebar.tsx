import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Trash2, 
  MessageCircle, 
  X,
  Zap,
  Shield,
  Hammer,
  Heart,
  Bug,
  Target,
  Calendar,
  Wand2,
  Sparkles,
  Search,
  Skull,
  Moon,
  Laugh
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessions } from "@/hooks/useSessions";
import { ChatSession, Personality } from "@/lib/types";

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: (personality: Personality) => void;
}

export default function ChatHistorySidebar({
  isOpen,
  onClose,
  userId,
  currentSessionId,
  onSessionSelect,
  onNewSession
}: ChatHistorySidebarProps) {
  const { sessions, isLoading, createSession, deleteSession, isCreatingSession } = useSessions(userId);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const personalityConfigs = {
    spiderman: { name: 'Spider-Man', icon: Bug, emoji: '🕷️', color: 'text-red-500' },
    ironman: { name: 'Iron Man', icon: Zap, emoji: '⚡', color: 'text-yellow-500' },
    captain: { name: 'Captain America', icon: Shield, emoji: '🛡️', color: 'text-blue-600' },
    thor: { name: 'Thor', icon: Hammer, emoji: '🔨', color: 'text-blue-400' },
    hulk: { name: 'Hulk', icon: Heart, emoji: '💚', color: 'text-green-500' },
    widow: { name: 'Black Widow', icon: Target, emoji: '🖤', color: 'text-red-400' },
    gandalf: { name: 'Gandalf', icon: Wand2, emoji: '🧙', color: 'text-gray-400' },
    yoda: { name: 'Yoda', icon: Sparkles, emoji: '🟢', color: 'text-green-400' },
    sherlock: { name: 'Sherlock', icon: Search, emoji: '🔍', color: 'text-amber-600' },
    deadpool: { name: 'Deadpool', icon: Skull, emoji: '💀', color: 'text-red-600' },
    batman: { name: 'Batman', icon: Moon, emoji: '🦇', color: 'text-gray-700' },
    joker: { name: 'Joker', icon: Laugh, emoji: '🃏', color: 'text-purple-500' }
  };

  const handleNewSession = (personality: keyof typeof personalityConfigs) => {
    if (!userId) return;
    
    createSession({
      userId,
      title: `New ${personalityConfigs[personality].name} Chat`,
      personality
    });
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this chat session? This action cannot be undone.')) {
      return;
    }
    
    setDeletingSessionId(sessionId);
    try {
      await deleteSession(sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
    } finally {
      setDeletingSessionId(null);
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const sessionDate = new Date(date);
    const diffInMs = now.getTime() - sessionDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return sessionDate.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-80 bg-black/90 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-red-500" />
                <h2 className="text-white font-semibold">Chat History</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white/60 hover:text-white h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* New Session Section */}
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white/80 text-sm font-medium mb-3">Start New Chat</h3>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(personalityConfigs) as [keyof typeof personalityConfigs, any][]).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <Button
                      key={key}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNewSession(key)}
                      disabled={isCreatingSession}
                      className="h-12 flex flex-col items-center gap-1 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                      title={`New ${config.name} chat`}
                    >
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      <span className="text-xs">{config.emoji}</span>
                    </Button>
                  );
                })}
              </div>
              {isCreatingSession && (
                <p className="text-xs text-white/60 mt-2 text-center">Creating new session...</p>
              )}
            </div>

            {/* Sessions List */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {isLoading ? (
                  <div className="text-center text-white/60 py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-white/30 border-t-white/60 rounded-full mx-auto mb-2" />
                    <p className="text-sm">Loading sessions...</p>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center text-white/60 py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No chat sessions yet</p>
                    <p className="text-xs opacity-60">Start a new conversation above</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((session) => {
                      const config = personalityConfigs[session.personality as keyof typeof personalityConfigs];
                      const Icon = config?.icon || MessageCircle;
                      const isCurrentSession = session.id === currentSessionId;
                      const isDeleting = deletingSessionId === session.id;
                      
                      return (
                        <motion.div
                          key={session.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          className={`group relative rounded-lg border transition-all duration-200 cursor-pointer ${
                            isCurrentSession 
                              ? 'bg-white/10 border-white/30' 
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                          } ${isDeleting ? 'opacity-50' : ''}`}
                          onClick={() => !isDeleting && onSessionSelect(session.id)}
                        >
                          <div className="p-3">
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 p-2 rounded-lg ${config?.color || 'text-white/60'} bg-white/5`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-white font-medium text-sm truncate">
                                    {session.title || `${config?.name || 'Chat'} Session`}
                                  </h3>
                                  <span className="text-xs">{config?.emoji}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs text-white/60">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDate(session.updatedAt)}</span>
                                </div>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDeleteSession(session.id, e)}
                                disabled={isDeleting}
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-white/40 hover:text-red-400 hover:bg-red-500/10"
                              >
                                {isDeleting ? (
                                  <div className="w-3 h-3 border border-white/30 border-t-white/60 rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
