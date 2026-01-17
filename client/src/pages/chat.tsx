import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, LoaderCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import EnhancedChatInterface from "@/components/EnhancedChatInterface";
import "@/styles/advanced.css";

import { Personality as MarvelPersonality } from "@/lib/types";

export default function ChatPage() {
  const [userId] = useState(() => {
    // In a real app, this would come from authentication
    const stored = localStorage.getItem('spiderbuddy-user-id');
    if (stored) return stored;

    const newId = crypto.randomUUID();
    localStorage.setItem('spiderbuddy-user-id', newId);
    return newId;
  });

  const [sessionId, setSessionId] = useState<string>();
  const [personality, setPersonality] = useState<MarvelPersonality>('spiderman');
  const sessionCreated = useRef(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(true);
  const [isSessionSwitching, setIsSessionSwitching] = useState(false);

  // Create initial session
  useEffect(() => {
    if (sessionCreated.current || !userId) return;
    const createSession = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            title: 'New SpiderBuddy Chat',
            personality: 'spiderman'
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const session = await response.json();
          setSessionId(session.id);
          setSessionError(null);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to create session');
        }
      } catch (error: any) {
        console.error('Failed to create session:', error);
        if (error.name === 'AbortError') {
           setSessionError("Connection verification timed out. Your database might be sleeping (Neon/Render) or firewall blocked.");
        } else {
           setSessionError(error instanceof Error ? error.message : 'An unknown error occurred.');
        }
      } finally {
        setIsCreatingSession(false);
      }
    };

    sessionCreated.current = true;
    createSession();
  }, [userId]);

  const handleSessionChange = (newSessionId: string) => {
    setSessionId(newSessionId);
  };

  const createNewSession = async (newPersonality: MarvelPersonality) => {
    if (!userId) return;
    
    setIsCreatingSession(true);
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: `New ${newPersonality} Chat`,
          personality: newPersonality
        }),
      });
      
      if (response.ok) {
        const session = await response.json();
        setSessionId(session.id);
        setPersonality(newPersonality);
        setSessionError(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create session');
      }
    } catch (error) {
      console.error('Failed to create new session:', error);
      setSessionError(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      
      <div className="relative z-10 h-screen">
        {isCreatingSession && (
          <div className="flex flex-col items-center justify-center h-screen text-white">
            <div className="glass-morphism p-8 rounded-2xl text-center border border-red-500/30">
              <div className="relative mb-4">
                <LoaderCircle className="w-12 h-12 animate-spin mx-auto text-red-500" />
                <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">
                  🕷️
                </div>
              </div>
              <p className="text-lg text-gradient font-semibold">Connecting to SpiderBuddy...</p>
              <p className="text-sm text-white/60 mt-2">Spider-sense tingling... Loading Avengers protocols</p>
            </div>
          </div>
        )}
        
        {sessionError && !isCreatingSession && (
          <div className="flex items-center justify-center h-screen p-4">
            <Card className="glass-morphism max-w-md w-full border-red-400/30">
              <CardContent className="pt-6 text-center text-white">
                <AlertTriangle className="w-12 h-12 mx-auto text-red-400 mb-4 animate-pulse-glow" />
                <h2 className="text-xl font-bold mb-2 text-gradient">Connection Error</h2>
                <p className="text-white/70">Could not establish a session with the server.</p>
                <p className="text-xs text-red-400/80 mt-4 bg-red-500/10 p-3 rounded-xl border border-red-400/20">{sessionError}</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        {sessionId && !sessionError && !isCreatingSession && (
          <EnhancedChatInterface
            sessionId={sessionId}
            userId={userId}
            initialPersonality={personality}
            onPersonalityChange={setPersonality}
          />
        )}
      </div>
    </div>
  );
}
