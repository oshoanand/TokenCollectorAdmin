import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/utils/api-client";
import { ChatSession, ChatMessage } from "@/types/chat";

// 1. Fetch Active Sessions (Universal Inbox)
export const useActiveSessions = (adminId: string | null) => {
  return useQuery({
    queryKey: ["activeSessions", adminId],
    queryFn: async (): Promise<ChatSession[]> => {
      if (!adminId) return [];
      return await apiRequest<ChatSession[]>({
        url: `/api/chat/sessions?userId=${adminId}`,
        method: "GET",
      });
    },
    enabled: !!adminId,
    refetchInterval: 30000, // Background sync every 30s
  });
};

// 2. Fetch Chat History between Admin and Target User
export const useChatHistory = (
  adminId: string | null,
  targetUserId: string | null,
) => {
  return useQuery({
    // IMPORTANT: Keys must match exactly what you use in queryClient.setQueryData
    queryKey: ["chatHistory", adminId, targetUserId],
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!adminId || !targetUserId) return [];
      return await apiRequest<ChatMessage[]>({
        url: `/api/chat/history?userId1=${adminId}&userId2=${targetUserId}`,
        method: "GET",
      });
    },
    enabled: !!adminId && !!targetUserId,
    // Keep data fresh to prevent flickering during socket updates
    staleTime: Infinity,
  });
};

// 3. Resolve a Chat Ticket
export const useResolveChat = (adminId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      return await apiRequest<{ success: boolean; message: string }>({
        url: `/api/chat/admin/resolve/${targetUserId}`,
        method: "PUT",
      });
    },
    onSuccess: (_, targetUserId) => {
      // 1. Refresh the sidebar list
      queryClient.invalidateQueries({ queryKey: ["activeSessions", adminId] });

      // 2. Clear the specific chat history from cache
      queryClient.invalidateQueries({
        queryKey: ["chatHistory", adminId, targetUserId],
      });

      console.log(`✅ Chat with ${targetUserId} marked as RESOLVED`);
    },
  });
};
