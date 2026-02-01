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
import { TokenPayload, NotificationContextType } from "@/types/notification";

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

// Use the environment variable consistent with your old provider
const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8800";

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<TokenPayload[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Initialize hooks
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // 1. Initialize Socket connection
    const newSocket: Socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log(
        "✅ Admin Panel: Connected to Live Server via NotificationContext",
      );
    });

    // 2. Listen for 'new_token' (Handles Bell + Toast + Sound)
    newSocket.on("new_token", (payload: TokenPayload) => {
      console.log("🔔 New Token Received:", payload);

      // --- A. Bell State Logic ---
      setNotifications((prev) => [payload, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // --- B. Sound Logic ---
      try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.play().catch((e) => console.log("Audio play blocked", e));
      } catch (error) {
        console.error("Audio error:", error);
      }

      // --- C. Toast Logic ---
      toast({
        title: "New Token Generated 🎟️",
        description: `Token: ${payload.tokenCode} | Order #${payload.orderNumber}`,
        variant: "success", // Ensure 'success' variant exists in your toast component, or use 'default'
        duration: 10000,
        action: {
          label: "View",
          onClick: () => router.push("/tokens"),
        },
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [toast, router]); // Dependencies ensure fresh hooks are used

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllAsRead,
        socket,
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
