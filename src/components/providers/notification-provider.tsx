"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// Import your types
import {
  NotificationContextType,
  NotificationItem,
  TokenPayload,
  JobPayload,
  ChatPayload,
} from "@/types/notification";

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8800";

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const { toast } = useToast();
  const router = useRouter();

  const playNotificationSound = () => {
    try {
      const audio = new Audio("/sounds/notification.wav");
      audio.play().catch((e) => console.log("Audio play blocked", e));
    } catch (error) {
      console.error("Audio error:", error);
    }
  };

  useEffect(() => {
    const newSocket: Socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"], // Added polling as a fallback
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Admin Panel: Connected to Live Server");
    });

    // --- 1. LISTENER: NEW TOKEN ---
    newSocket.on("new_token", (payload: TokenPayload) => {
      console.log("🔔 New Token:", payload);
      const item: TokenPayload = { ...payload, type: "TOKEN" };

      setNotifications((prev) => [item, ...prev]);
      setUnreadCount((prev) => prev + 1);
      playNotificationSound();

      toast({
        title: "New Token Generated 🎟️",
        description: `Token: ${payload.tokenCode}`,
        variant: "success",
        duration: 8000,
        action: {
          label: "View",
          onClick: () => router.push("/tokens"),
        },
      });
    });

    // --- 2. LISTENER: NEW JOB ---
    newSocket.on("new_job", (payload: JobPayload) => {
      console.log("🚛 New Job:", payload);
      const item: JobPayload = { ...payload, type: "JOB" };

      setNotifications((prev) => [item, ...prev]);
      setUnreadCount((prev) => prev + 1);
      playNotificationSound();

      toast({
        title: "New Job Posted 🚛",
        description: `${payload.location} | ${payload.cost}₽`,
        variant: "default",
        duration: 8000,
        action: {
          label: "Jobs",
          onClick: () => router.push("/jobs"),
        },
      });
    });

    // --- 3. LISTENER: LIVE CHAT MESSAGES ---
    newSocket.on("receive_message", (payload: ChatPayload) => {
      // Only notify the admin if the sender is a USER
      if (payload.senderType === "USER") {
        console.log("💬 New Chat Message:", payload);
        const item: ChatPayload = { ...payload, type: "CHAT" };

        setNotifications((prev) => [item, ...prev]);
        setUnreadCount((prev) => prev + 1);
        playNotificationSound();

        // Truncate long messages for the toast
        const previewText =
          payload.text.length > 40
            ? payload.text.substring(0, 40) + "..."
            : payload.text;

        toast({
          title: "New Support Message 💬",
          description: previewText,
          duration: 8000,
          action: {
            label: "Reply",
            onClick: () => router.push("/chat"), // Adjust this route to match your chat page URL
          },
        });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [toast, router]);

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllAsRead,
        socket, // Exposing the socket so your Chat page can use it!
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
