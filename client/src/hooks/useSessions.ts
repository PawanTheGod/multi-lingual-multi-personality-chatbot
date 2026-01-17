import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatSession, Personality } from "@/lib/types";

interface CreateSessionData {
  userId: string;
  title?: string;
  personality: Personality;
}

export function useSessions(userId?: string) {
  const queryClient = useQueryClient();

  // Fetch user sessions
  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['/api/sessions', userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await fetch(`/api/sessions/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      return response.json() as Promise<ChatSession[]>;
    },
  });

  // Create new session
  const createSessionMutation = useMutation({
    mutationFn: async (data: CreateSessionData) => {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create session');
      }
      return response.json() as Promise<ChatSession>;
    },
    onSuccess: () => {
      // Invalidate sessions query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', userId] });
    },
  });

  // Delete session (we'll need to add this endpoint to backend)
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete session');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', userId] });
    },
  });

  return {
    sessions: sessions || [],
    isLoading,
    error,
    createSession: createSessionMutation.mutate,
    deleteSession: deleteSessionMutation.mutate,
    isCreatingSession: createSessionMutation.isPending,
    isDeletingSession: deleteSessionMutation.isPending,
  };
}
