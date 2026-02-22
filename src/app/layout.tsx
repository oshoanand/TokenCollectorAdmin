import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import NextAuthProvider from "@/components/providers/next-auth-session-provider";
import ReactQueryProvider from "@/utils/query-client-provider";
import PushNotificationManager from "@/components/providers/push-notification-manager";
import { NotificationProvider } from "@/components/providers/notification-provider";

export const metadata: Metadata = {
  title: "Token Admin",
  description: "Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <NextAuthProvider>
          <ReactQueryProvider>
            {/* NotificationProvider acts as both the Notifier AND the Socket Provider */}
            <NotificationProvider>
              <PushNotificationManager />

              {/* Main App Content */}
              <Suspense>{children}</Suspense>

              {/* Toaster placed inside provider so hooks can trigger it */}
              <Toaster />
            </NotificationProvider>
          </ReactQueryProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
