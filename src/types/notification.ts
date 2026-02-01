export interface TokenPayload {
  id: number | string;
  tokenCode: string;
  orderNumber: string;
  mobileNumber: string;
  status: string;
  createdAt: string | Date;
}

export interface NotificationContextType {
  notifications: TokenPayload[];
  unreadCount: number;
  markAllAsRead: () => void;
  socket: any; // Or use Socket from 'socket.io-client' if strict
}
