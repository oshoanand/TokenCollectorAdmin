// import type { Metadata } from "next";
// import "./globals.css";
// import { Toaster } from "@/components/ui/toaster";
// import NextAuthProvider from "@/components/providers/next-auth-session-provider";
// import ReactQueryProvider from "@/utils/query-client-provider";

// export const metadata: Metadata = {
//   title: "Nova Admin",
//   description: "Admin Dashboard created with Firebase Studio",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <head>
//         <link rel="preconnect" href="https://fonts.googleapis.com" />
//         <link
//           rel="preconnect"
//           href="https://fonts.gstatic.com"
//           crossOrigin="anonymous"
//         />
//         <link
//           href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
//           rel="stylesheet"
//         />
//       </head>
//       <body className="font-body antialiased">
//         <NextAuthProvider>
//           <ReactQueryProvider>
//             {children}
//             <Toaster />
//           </ReactQueryProvider>
//         </NextAuthProvider>
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import NextAuthProvider from "@/components/providers/next-auth-session-provider";
import ReactQueryProvider from "@/utils/query-client-provider";
import SocketProvider from "@/components/providers/socket-provider";
import PushNotificationManager from "@/components/providers/push-notification-manager";

export const metadata: Metadata = {
  title: "Nova Admin",
  description: "Admin Dashboard created with Firebase Studio",
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
            {/* 1. SOCKET: Listens for live events when tab is OPEN */}
            <SocketProvider />

            {/* 2. PUSH MANAGER: Handles service worker for when tab is CLOSED */}
            <PushNotificationManager />

            {/* Main Content */}
            <Suspense>{children}</Suspense>

            {/* 3. TOASTER: The UI component that shows the popup */}
            <Toaster />
          </ReactQueryProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
