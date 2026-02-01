// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useSession, signOut } from "next-auth/react";
// import {
//   SidebarHeader,
//   SidebarContent,
//   SidebarMenu,
//   SidebarMenuItem,
//   SidebarMenuButton,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupLabel,
//   SidebarSeparator,
// } from "@/components/ui/sidebar";
// import {
//   LayoutDashboard,
//   ClipboardList,
//   BellRing,
//   LogOut,
//   ChevronsUpDown,
//   Command,
//   Settings,
//   User,
//   Headset,
//   Briefcase
// } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "./ui/dropdown-menu";
// import { PlaceHolderImages } from "@/lib/placeholder-images";

// // Organize menu items into groups for better UX
// const menuGroups = [
//   {
//     label: "Platform",
//     items: [
//       { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
//       { href: "/tokens", icon: ClipboardList, label: "Token Management" },
//     ],
//   },
//   {
//     label: "Communication",
//     items: [
//       { href: "/notifications", icon: BellRing, label: "Push Notifications" },
//       { href: "/support", icon: Headset, label: "Support Queries" },
//     ],
//   },
// ];

// export function SidebarNav() {
//   const { data: session } = useSession();
//   const pathname = usePathname();

//   const getImage = (id: string) =>
//     PlaceHolderImages.find((img) => img.id === id)?.imageUrl;

//   const handleLogout = () => {
//     signOut({ callbackUrl: "/login" });
//   };

//   return (
//     <>
//       {/* --- 1. Brand / Logo Header --- */}
//       <SidebarHeader>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton size="lg" asChild>
//               <Link href="/dashboard">
//                 <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
//                   <Command className="size-4" />
//                 </div>
//                 <div className="grid flex-1 text-left text-sm leading-tight">
//                   <span className="truncate font-semibold">Zepo Admin</span>
//                   <span className="truncate text-xs">Management Panel</span>
//                 </div>
//               </Link>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>

//       {/* --- 2. Navigation Content --- */}
//       <SidebarContent>
//         {menuGroups.map((group) => (
//           <SidebarGroup key={group.label}>
//             <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
//             <SidebarMenu>
//               {group.items.map((item) => (
//                 <SidebarMenuItem key={item.href}>
//                   <Link href={item.href} passHref legacyBehavior>
//                     <SidebarMenuButton
//                       isActive={pathname === item.href}
//                       tooltip={item.label}
//                     >
//                       <item.icon />
//                       <span>{item.label}</span>
//                     </SidebarMenuButton>
//                   </Link>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroup>
//         ))}
//       </SidebarContent>

//       {/* --- 3. User Footer (Modern Approach) --- */}
//       <SidebarFooter>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <SidebarMenuButton
//                   size="lg"
//                   className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
//                 >
//                   <Avatar className="h-8 w-8 rounded-lg">
//                     <AvatarImage
//                       src={
//                         session?.user.image
//                           ? session?.user.image
//                           : "/icons/icon-192x192.png"
//                       }
//                       alt={session?.user.name || "User"}
//                     />
//                     <AvatarFallback className="rounded-lg">
//                       {session?.user.name?.charAt(0) || "A"}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div className="grid flex-1 text-left text-sm leading-tight">
//                     <span className="truncate font-semibold">
//                       {session?.user.name || "Admin User"}
//                     </span>
//                     <span className="truncate text-xs">
//                       {session?.user.email || "admin@zepo.com"}
//                     </span>
//                   </div>
//                   <ChevronsUpDown className="ml-auto size-4" />
//                 </SidebarMenuButton>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent
//                 className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
//                 side="bottom"
//                 align="end"
//                 sideOffset={4}
//               >
//                 <DropdownMenuLabel className="p-0 font-normal">
//                   <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
//                     <Avatar className="h-8 w-8 rounded-lg">
//                       <AvatarImage
//                         src={getImage("avatar3")}
//                         alt={session?.user.name || "User"}
//                       />
//                       <AvatarFallback className="rounded-lg">CN</AvatarFallback>
//                     </Avatar>
//                     <div className="grid flex-1 text-left text-sm leading-tight">
//                       <span className="truncate font-semibold">
//                         {session?.user.name}
//                       </span>
//                       <span className="truncate text-xs">
//                         {session?.user.email}
//                       </span>
//                     </div>
//                   </div>
//                 </DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem>
//                   <Settings className="mr-2 h-4 w-4" />
//                   Settings
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <User className="mr-2 h-4 w-4" />
//                   Profile
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem
//                   onClick={handleLogout}
//                   className="text-red-600 focus:text-red-600"
//                 >
//                   <LogOut className="mr-2 h-4 w-4" />
//                   Log out
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarFooter>
//     </>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  ClipboardList,
  BellRing,
  LogOut,
  ChevronsUpDown,
  Command,
  Settings,
  User,
  Headset,
  Briefcase, // <--- 1. IMPORT THIS ICON
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { PlaceHolderImages } from "@/lib/placeholder-images";

// Organize menu items into groups for better UX
const menuGroups = [
  {
    label: "Platform",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/tokens", icon: ClipboardList, label: "Token Management" },
      { href: "/jobs", icon: Briefcase, label: "Jobs" },
    ],
  },
  {
    label: "Communication",
    items: [
      { href: "/notifications", icon: BellRing, label: "Push Notifications" },
      { href: "/support", icon: Headset, label: "Support Queries" },
    ],
  },
];

export function SidebarNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Zepo Admin</span>
                  <span className="truncate text-xs">Management Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={session?.user.image || "/icons/icon-192x192.png"}
                      alt={session?.user.name || "User"}
                    />
                    <AvatarFallback className="rounded-lg">
                      {session?.user.name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {session?.user.name || "Admin User"}
                    </span>
                    <span className="truncate text-xs">
                      {session?.user.email || "admin@zepo.com"}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={session?.user.image || "/icons/icon-192x192.png"}
                        alt={session?.user.name || "User"}
                      />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {session?.user.name}
                      </span>
                      <span className="truncate text-xs">
                        {session?.user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
