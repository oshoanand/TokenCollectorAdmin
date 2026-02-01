"use client";

import React, { useState } from "react";
import { Bell } from "lucide-react";
import { useNotification } from "@/context/NotificationContext";
import { TokenPayload } from "@/types/notification";

const NotificationBell: React.FC = () => {
  const { unreadCount, notifications, markAllAsRead } = useNotification();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleBellClick = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    // If opening (true) and we have unread items, clear the badge
    if (nextState && unreadCount > 0) {
      markAllAsRead();
    }
  };

  // Helper to format date safely
  const formatTime = (dateInput: string | Date) => {
    return new Date(dateInput).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
      >
        <Bell size={24} />

        {/* Red Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay to close when clicking outside */}
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
              Notifications
            </div>

            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No new notifications
                </div>
              ) : (
                notifications.map((notif: TokenPayload, index: number) => (
                  <div
                    key={notif.id || index}
                    className="p-3 border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          New Token: {notif.tokenCode}
                        </p>
                        <p className="text-xs text-gray-600">
                          Order #: {notif.orderNumber}
                        </p>
                        <p className="text-xs text-blue-600">
                          Mobile: {notif.mobileNumber}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
