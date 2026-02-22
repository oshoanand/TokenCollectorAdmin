// // types/chat.ts

// export interface ChatMessage {
//   id: string;
//   chatSessionId: string;
//   senderId: string;
//   text: string;
//   isRead: boolean;
//   createdAt: string;
// }

// export interface ChatSession {
//   id: string;
//   userId: string;
//   user: {
//     id: string;
//     name: string;
//     userRole: string;
//     mobile: string;
//     email: string;
//   };
//   lastMessage: string;
//   lastMessageTime: string;
//   unreadCount: number;
// }

export interface ChatMessage {
  id: string;
  chatSessionId: string;
  senderId: string;
  text: string;
  isRead: boolean; // Enables the single/double green tick feature
  readAt?: string | Date | null;
  createdAt: string; // ISO 8601 date string from the database
}

// Represents the partner user in the chat (Visitor or Collector)
export interface ChatPartner {
  id: string;
  name: string;
  userRole: string; // "VISITOR" | "COLLECTOR"
  mobile: string;
  email: string | null;
  isOnline?: boolean;
}

export interface ChatSession {
  id: string; // The Prisma ChatSession ID
  userId: string; // The ID of the partner you are chatting with
  user: ChatPartner; // The partner's profile details
  lastMessage: string; // The text snippet shown in the sidebar
  lastMessageTime: string; // The timestamp for the sidebar
  unreadCount: number; // The red badge count
  status: "OPEN" | "RESOLVED";

  // These fields are retained from the backend mapping for Android backward compatibility,
  // but they are functionally identical to userId/user in the Next.js panel.
  collectorId?: string;
  collectorName?: string;
  collectorRole?: string;
  collectorProfileImage?: string | null;
}
