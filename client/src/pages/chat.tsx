import { useState } from "react";
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

  // Generate a random session ID client-side immediately
  // This allows "Instant Load" without waiting for the server
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const [personality, setPersonality] = useState<MarvelPersonality>('spiderman');

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="relative z-10 h-screen">
        <EnhancedChatInterface
          sessionId={sessionId}
          userId={userId}
          initialPersonality={personality}
          onPersonalityChange={setPersonality}
        />
      </div>
    </div>
  );
}
