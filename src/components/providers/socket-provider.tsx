// "use client";
// import { useEffect } from "react";
// import { io } from "socket.io-client";
// import { useToast } from "@/hooks/use-toast";
// import { useRouter } from "next/navigation";

// export default function SocketProvider() {
//   const { toast } = useToast();
//   const router = useRouter(); // 2. Initialize Router

//   useEffect(() => {
//     // Connect to your Node.js Backend
//     const socket = io(
//       process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8800",
//     );

//     socket.on("connect", () => {
//       console.log("✅ Admin Panel: Connected to Live Server");
//     });

//     socket.on("new_token", (data: any) => {
//       // Optional: Play Sound
//       try {
//         const audio = new Audio("/sounds/notification.mp3");
//         audio.play().catch(() => {});
//       } catch (e) {}

//       // Trigger Toast with Action
//       toast({
//         title: "New Token Generated 🎟️",
//         description: `Token: ${data.tokenCode} | Order #${data.orderNumber}`,
//         variant: "success", // You can use "success" if defined in your wrapper
//         duration: 10000,
//         action: {
//           label: "View",
//           onClick: () => router.push("/tokens"), // Smooth navigation
//         },
//       });
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, [toast, router]);

//   return null;
// }

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect if the user is authenticated and is an ADMIN
    const role = (session?.user as any)?.role;
    if (status !== "authenticated" || role !== "ADMIN") return;

    // Use your actual backend URL from .env
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8800";

    const socketInstance = io(backendUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("🟢 Socket connected:", socketInstance.id);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("🔴 Socket disconnected");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session, status]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
