"use client";

import { useEffect, useState, useMemo, Suspense, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Search, Loader2, MessageSquare, UserCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { clsx } from "clsx";

import { useChatStore } from "@/store/useChatStore";
import AdminChatDetail from "@/components/AdminChatDetail";

// Next.js requires components using useSearchParams to be wrapped in a Suspense boundary
export default function AdminChatPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-green-600 w-10 h-10" />
        </div>
      }
    >
      <AdminChatPage />
    </Suspense>
  );
}

function AdminChatPage() {
  const { data: session } = useSession();
  const adminId = session?.user?.id || "";
  const searchParams = useSearchParams();
  const queryUserId = searchParams.get("userId");

  // Global State
  const socket = useChatStore((state) => state.socket); // <-- ADDED for real-time sync
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const lastSeenMap = useChatStore((state) => state.lastSeenMap);
  const setOnlineStatusBulk = useChatStore(
    (state) => state.setOnlineStatusBulk,
  );
  const refreshTrigger = useChatStore((state) => state.refreshTrigger);

  // Local State
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // --- 1. OPTIMIZED FETCH FUNCTION ---
  // Wrapped in useCallback so we can safely trigger it from socket listeners
  const fetchSessions = useCallback(
    async (isSilent = false) => {
      if (!adminId) return;
      if (!isSilent) setLoading(true);

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8800";
        const { data } = await axios.get(
          `${API_URL}/api/chat/sessions?userId=${adminId}`,
        );

        const currentlyOnline: string[] = [];
        const lastSeenData: Record<string, string> = {};

        data.forEach((s: any) => {
          if (s.isOnline) currentlyOnline.push(s.userId);
          else if (s.lastSeen) lastSeenData[s.userId] = s.lastSeen;
        });

        setOnlineStatusBulk(currentlyOnline, lastSeenData);
        setSessions(data);
      } catch (error) {
        console.error("Failed to fetch sessions", error);
      } finally {
        setLoading(false);
      }
    },
    [adminId, setOnlineStatusBulk],
  );

  // Initial fetch and manual refresh trigger
  useEffect(() => {
    fetchSessions(sessions.length > 0);
  }, [fetchSessions, refreshTrigger, sessions.length]);

  // --- 2. REAL-TIME BACKGROUND SYNC ---
  // Refetches the chat list silently if new messages arrive or are marked read globally
  useEffect(() => {
    if (!socket || !adminId) return;

    const handleSilentRefresh = () => {
      fetchSessions(true);
    };

    socket.on("receive_message", handleSilentRefresh);
    socket.on("read_status_synced", handleSilentRefresh);
    socket.on("messages_read_by_recipient", handleSilentRefresh);

    return () => {
      socket.off("receive_message", handleSilentRefresh);
      socket.off("read_status_synced", handleSilentRefresh);
      socket.off("messages_read_by_recipient", handleSilentRefresh);
    };
  }, [socket, adminId, fetchSessions]);

  // Auto-Select Partner from URL
  useEffect(() => {
    if (queryUserId && !loading) {
      const existingSession = sessions.find((s) => s.userId === queryUserId);
      if (existingSession) {
        setSelectedPartner({
          id: existingSession.userId,
          name: existingSession.user.name,
        });
      } else {
        setSelectedPartner({ id: queryUserId, name: "Новый чат (Клиент)" });
      }
    }
  }, [queryUserId, sessions, loading]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) =>
      s.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [sessions, searchQuery]);

  if (loading && sessions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-green-600 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* LEFT PANE: Chat List Sidebar */}
      <div
        className={clsx(
          "w-full md:w-[350px] lg:w-[400px] border-r flex flex-col bg-gray-50/50 transition-all",
          selectedPartner ? "hidden md:flex" : "flex",
        )}
      >
        <div className="p-4 border-b bg-white">
          <h1 className="text-xl font-bold text-gray-800 mb-4">
            Чаты клиентов
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск клиента..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredSessions.map((chat) => {
            const visitorId = chat.userId;
            const isOnline = onlineUsers.has(visitorId);
            const lastActive =
              lastSeenMap[visitorId] || chat.lastSeen || chat.lastMessageTime;

            return (
              <div
                key={visitorId}
                onClick={() => {
                  // --- 3. OPTIMISTIC UI FIX ---
                  // Instantly wipe the local unread count from the sidebar so it feels fast
                  setSessions((prev) =>
                    prev.map((s) =>
                      s.userId === visitorId ? { ...s, unreadCount: 0 } : s,
                    ),
                  );
                  setSelectedPartner({ id: visitorId, name: chat.user.name });
                }}
                className={clsx(
                  "flex items-center gap-3 p-4 border-b cursor-pointer hover:bg-gray-100 transition-colors",
                  selectedPartner?.id === visitorId &&
                    "bg-green-50/80 border-l-4 border-l-green-500",
                )}
              >
                <div className="relative shrink-0">
                  <div
                    className={clsx(
                      "w-12 h-12 rounded-full overflow-hidden border-2",
                      isOnline ? "border-green-500" : "border-gray-200",
                    )}
                  >
                    {chat.user.image ? (
                      <img
                        src={chat.user.image}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <UserCircle className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-sm text-gray-900 truncate">
                      {chat.user.name}
                    </h3>
                    <span className="text-[10px] text-gray-400">
                      {formatDistanceToNow(new Date(chat.lastMessageTime), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </span>
                  </div>
                  <p
                    className={clsx(
                      "text-xs truncate mt-0.5",
                      chat.unreadCount > 0
                        ? "text-black font-bold"
                        : "text-gray-500",
                    )}
                  >
                    {chat.lastMessage}
                  </p>
                </div>

                {chat.unreadCount > 0 && (
                  <span className="bg-green-600 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full">
                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANE: Active Chat Detail */}
      <div
        className={clsx(
          "flex-1 flex flex-col bg-white transition-all",
          !selectedPartner ? "hidden md:flex" : "flex",
        )}
      >
        {selectedPartner ? (
          <AdminChatDetail
            adminId={adminId}
            partnerId={selectedPartner.id}
            partnerName={selectedPartner.name}
            onBack={() => {
              window.history.replaceState(null, "", "/chat");
              setSelectedPartner(null);
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <MessageSquare className="w-16 h-16 opacity-20 mb-4" />
            <p>Выберите чат для начала общения</p>
          </div>
        )}
      </div>
    </div>
  );
}
