import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Message, ChatSession, Personality } from "@/lib/types";

interface UseChatProps {
  sessionId?: string;
  userId?: string;
}

export function useChat({ sessionId, userId }: UseChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch messages for session
  const { data: sessionMessages, isLoading } = useQuery<Message[]>({
    queryKey: ['/api/sessions', sessionId, 'messages'],
    queryFn: async () => {
      if (!sessionId) return [];
      const response = await fetch(`/api/sessions/${sessionId}/messages`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch messages (${response.status}): ${errorText}`);
      }
      return response.json();
    },
    enabled: !!sessionId,
  });

  // Update local messages when session messages load
  useEffect(() => {
    if (sessionMessages) {
      setMessages(sessionMessages);
    }
  }, [sessionMessages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ 
      message, 
      personality, 
      sessionId: msgSessionId,
      modelId
    }: { 
      message: string; 
      personality: Personality; 
      sessionId?: string;
      modelId?: string;
    }) => {
      // Add user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        sessionId: msgSessionId || '',
        sender: 'user',
        content: message,
        personality,
        createdAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsStreaming(true);
      setCurrentResponse("");

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      // Prepare a stable id for the bot's streaming message
      const botMessageId = Date.now().toString() + '-bot';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, personality, sessionId: msgSessionId, userId, modelId }),
        signal: abortControllerRef.current.signal,
      });

      // Check response status before processing
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n');

          for (let i = 0; i < parts.length - 1; i++) {
            const chunk = parts[i];
            if (chunk.trim()) {
              try {
                const parsed = JSON.parse(chunk);
                if (parsed.response && parsed.response.trim()) {
                  fullResponse += parsed.response;
                  setCurrentResponse(fullResponse);

                  // Update or create a single bot message during streaming
                  setMessages(prev => {
                    const existingIndex = prev.findIndex(m => m.id === botMessageId);
                    
                    if (existingIndex !== -1) {
                      // Update existing message
                      const updated = [...prev];
                      updated[existingIndex] = {
                        ...updated[existingIndex],
                        content: fullResponse,
                      };
                      return updated;
                    } else {
                      // Create new bot message only if we have content
                      if (fullResponse.trim()) {
                        return [
                          ...prev,
                          {
                            id: botMessageId,
                            sessionId: msgSessionId || '',
                            sender: 'bot' as const,
                            content: fullResponse,
                            personality,
                            createdAt: new Date().toISOString(),
                          },
                        ];
                      }
                      return prev; // Don't create empty messages
                    }
                  });
                }
              } catch (e) {
                console.warn('Failed to parse streaming chunk:', chunk);
              }
            }
          }

          buffer = parts[parts.length - 1];
        }
      } finally {
        setIsStreaming(false);
        setCurrentResponse("");
      }

      return { success: true };
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setIsStreaming(false);
      setCurrentResponse("");
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        sessionId: sessionId || '',
        sender: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const sendMessage = useCallback((message: string, personality: Personality, modelId?: string) => {
    sendMessageMutation.mutate({ message, personality, sessionId, modelId });
  }, [sendMessageMutation, sessionId]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setCurrentResponse("");
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const refreshMessages = useCallback(() => {
    if (sessionId) {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', sessionId, 'messages'] });
    }
  }, [sessionId, queryClient]);

  return {
    messages,
    isStreaming,
    currentResponse,
    isLoading,
    sendMessage,
    stopStreaming,
    clearChat,
    refreshMessages,
    isPending: sendMessageMutation.isPending,
  };
}
