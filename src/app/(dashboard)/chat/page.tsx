"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useNotification } from "@/components/providers/notification-provider";
import {
  useActiveSessions,
  useChatHistory,
  useResolveChat,
} from "@/hooks/use-chat";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/types/chat";
import {
  Loader2,
  Send,
  UserCircle,
  MessageSquare,
  Check,
  CheckCheck,
  Volume2,
} from "lucide-react";

function ChatInterface() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetUserId = searchParams.get("userId");

  const queryClient = useQueryClient();
  const { socket } = useNotification();

  const { data: session, status: sessionStatus } = useSession();
  const adminId = session?.user ? String((session.user as any).id) : null;

  const [activeUserId, setActiveUserId] = useState<string | null>(
    targetUserId || null,
  );
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  const { data: activeSessions = [], isLoading: isLoadingSessions } =
    useActiveSessions(adminId);
  const { data: messages = [], isLoading: isLoadingHistory } = useChatHistory(
    adminId,
    activeUserId,
  );
  const { mutate: resolveTicket, isPending: isResolving } =
    useResolveChat(adminId);

  const currentActiveSession = activeSessions.find(
    (s: any) => s.userId === activeUserId,
  );

  useEffect(() => {
    notificationSound.current = new Audio("/sounds/notification.wav");
  }, []);

  useEffect(() => {
    if (!socket || !adminId) return;

    const joinPersonalRoom = () => {
      socket.emit("user_connected", adminId);
    };

    if (socket.connected) joinPersonalRoom();
    socket.on("connect", joinPersonalRoom);

    // --- 1. HANDLE NEW MESSAGES ---
    const handleNewMessage = (
      newMessage: ChatMessage & { tempId?: string },
    ) => {
      // Refresh the sidebar sessions to update unread counts/last message
      queryClient.invalidateQueries({ queryKey: ["activeSessions", adminId] });

      const isFromOthers = String(newMessage.senderId) !== adminId;

      // Play sound if message is for us and we aren't looking at that chat
      if (
        isFromOthers &&
        (newMessage.senderId !== activeUserId || document.hidden)
      ) {
        notificationSound.current?.play().catch(() => {});
      }

      // If this message belongs to the current open chat
      if (
        activeUserId &&
        (newMessage.senderId === activeUserId ||
          String(newMessage.senderId) === adminId)
      ) {
        queryClient.setQueryData(
          ["chatHistory", adminId, activeUserId],
          (oldMessages: ChatMessage[] | undefined) => {
            if (!oldMessages) return [newMessage];
            // Remove optimistic message if tempId matches
            const filtered = newMessage.tempId
              ? oldMessages.filter((m) => m.id !== newMessage.tempId)
              : oldMessages;

            if (filtered.some((m) => m.id === newMessage.id)) return filtered;
            return [...filtered, newMessage];
          },
        );

        // SYNC: If we are looking at the chat, mark this new message as read immediately
        if (newMessage.senderId === activeUserId) {
          socket.emit("mark_messages_read", {
            readerId: adminId,
            senderId: activeUserId,
          });
        }
      }
    };

    // --- 2. HANDLE READ RECEIPTS (Syncing Ticks) ---
    const handleMessagesRead = ({
      readerId,
      readAt,
    }: {
      readerId: string;
      readAt: string;
    }) => {
      if (activeUserId && readerId === activeUserId) {
        queryClient.setQueryData(
          ["chatHistory", adminId, activeUserId],
          (old: ChatMessage[] | undefined) => {
            return old?.map((msg) =>
              msg.senderId === adminId ? { ...msg, isRead: true, readAt } : msg,
            );
          },
        );
      }
    };

    // --- 3. HANDLE STATUS & TYPING ---
    const handleStatusChange = ({
      userId,
      isOnline,
    }: {
      userId: string;
      isOnline: boolean;
    }) => {
      queryClient.setQueryData(["activeSessions", adminId], (old: any) => {
        if (!old) return old;
        return old.map((s: any) =>
          s.userId === userId ? { ...s, user: { ...s.user, isOnline } } : s,
        );
      });
    };

    const handleTyping = ({ userId }: { userId: string }) => {
      if (activeUserId && userId === activeUserId) setIsTyping(true);
    };

    const handleStopTyping = ({ userId }: { userId: string }) => {
      if (activeUserId && userId === activeUserId) setIsTyping(false);
    };

    socket.on("receive_message", handleNewMessage);
    socket.on("messages_read_by_recipient", handleMessagesRead); // Matches Node.js emit
    socket.on("user_status_changed", handleStatusChange);
    socket.on("user_typing", handleTyping);
    socket.on("user_stopped_typing", handleStopTyping);

    return () => {
      socket.off("connect", joinPersonalRoom);
      socket.off("receive_message", handleNewMessage);
      socket.off("messages_read_by_recipient", handleMessagesRead);
      socket.off("user_status_changed", handleStatusChange);
      socket.off("user_typing", handleTyping);
      socket.off("user_stopped_typing", handleStopTyping);
    };
  }, [socket, adminId, activeUserId, queryClient]);

  // Trigger Read Receipt when switching users
  useEffect(() => {
    if (socket && adminId && activeUserId) {
      socket.emit("mark_messages_read", {
        readerId: adminId,
        senderId: activeUserId,
      });
    }
  }, [activeUserId, socket, adminId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeUserId || !socket || !adminId) return;

    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      senderId: adminId,
      text: inputText,
      createdAt: new Date().toISOString(),
      isRead: false,
    } as ChatMessage;

    queryClient.setQueryData(
      ["chatHistory", adminId, activeUserId],
      (old: ChatMessage[] | undefined) =>
        old ? [...old, optimisticMessage] : [optimisticMessage],
    );

    socket.emit("send_message", {
      senderId: adminId,
      receiverId: activeUserId,
      text: inputText,
      tempId: tempId,
    });

    setInputText("");
    // Clear typing indicator immediately upon send
    socket.emit("stop_typing", { senderId: adminId, receiverId: activeUserId });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!socket || !adminId || !activeUserId) return;

    socket.emit("typing", { senderId: adminId, receiverId: activeUserId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        senderId: adminId,
        receiverId: activeUserId,
      });
    }, 2000);
  };

  if (sessionStatus === "loading") {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Sidebar - Sessions List */}
      <div className="w-80 border-r bg-gray-50 flex flex-col shrink-0">
        <div className="p-4 border-b bg-white flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Conversations</h2>
          <Volume2 className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeSessions.map((session: any) => (
            <div
              key={session.id}
              onClick={() => {
                setActiveUserId(session.userId);
                router.replace(`/chat?userId=${session.userId}`, {
                  scroll: false,
                });
              }}
              className={`p-4 border-b cursor-pointer transition-colors ${
                activeUserId === session.userId
                  ? "bg-white border-l-4 border-l-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <UserCircle className="text-gray-400 h-10 w-10" />
                  {session.user?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm truncate">
                      {session.user?.name || "User"}
                    </h3>
                    {session.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                        {session.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {session.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {activeUserId ? (
          <>
            <div className="p-4 border-b flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <UserCircle className="h-10 w-10 text-gray-400" />
                <div className="flex flex-col">
                  <h2 className="font-bold text-gray-800">
                    {currentActiveSession?.user?.name || "User"}
                  </h2>
                  <p
                    className={`text-xs ${isTyping ? "text-blue-500 animate-pulse" : "text-gray-400"}`}
                  >
                    {isTyping
                      ? "typing..."
                      : currentActiveSession?.user?.isOnline
                        ? "Online"
                        : "Offline"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => resolveTicket(activeUserId)}
                className="text-sm bg-gray-100 px-4 py-2 rounded-md hover:bg-green-100"
              >
                Close Ticket
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa]">
              {messages.map((msg: any, i: number) => {
                const isAdmin = String(msg.senderId) === adminId;
                return (
                  <div
                    key={msg.id || i}
                    className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${isAdmin ? "bg-blue-600 text-white" : "bg-white border"}`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 opacity-70 text-[10px]">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {isAdmin &&
                          (msg.isRead ? (
                            <CheckCheck className="h-3 w-3 text-blue-200" />
                          ) : (
                            <Check className="h-3 w-3" />
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t flex gap-2"
            >
              <input
                value={inputText}
                onChange={handleInputChange}
                placeholder="Type message..."
                className="flex-1 bg-gray-100 rounded-full px-5 py-2 outline-none"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-blue-600 text-white rounded-full p-2 h-10 w-10 flex items-center justify-center disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <MessageSquare className="h-12 w-12 mr-2" /> Select a user to start
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ChatInterface />
    </Suspense>
  );
}
