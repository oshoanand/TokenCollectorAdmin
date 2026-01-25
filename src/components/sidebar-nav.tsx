// "use client";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import {
//   SidebarHeader,
//   SidebarContent,
//   SidebarMenu,
//   SidebarMenuItem,
//   SidebarMenuButton,
//   SidebarFooter,
//   useSidebar,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";
// import {
//   LayoutDashboard,
//   Users,
//   FileText,
//   BarChart3,
//   Settings,
//   ClipboardList,
//   Atom,
//   LogOut,
// } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Separator } from "./ui/separator";
// import { PlaceHolderImages } from "@/lib/placeholder-images";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "./ui/dropdown-menu";
// import { Button } from "./ui/button";
// import { signOut } from "next-auth/react";

// import { useSession } from "next-auth/react";

// const navItems = [
//   { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
//   // { href: "/users", icon: Users, label: "User Management" },
//   { href: "/tokens", icon: ClipboardList, label: "Token Management" },
//   // { href: "/content", icon: FileText, label: "Content" },
//   // { href: "/reports", icon: BarChart3, label: "Analytics" },
//   // { href: "/settings", icon: Settings, label: "Settings" },
// ];

// export function SidebarNav() {
//   const { data: session, status } = useSession();
//   const pathname = usePathname();

//   const getImage = (id: string) =>
//     PlaceHolderImages.find((img) => img.id === id)?.imageUrl;
//   const handleLogout = () => {
//     // signOut deletes the session cookie and redirects
//     signOut({ callbackUrl: "/login" });
//   };

//   return (
//     <>
//       <SidebarHeader>
//         {/* <div className="flex h-8 items-center gap-2 px-2">
//           <Atom className="h-6 w-6 text-primary" />
//           <span
//             className="font-headline text-lg font-bold group-data-[collapsible=icon]:hidden"
//             data-testid="app-name"
//           >
//             Zepo Admin
//           </span>
//         </div> */}

//         <div className="flex items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=expanded]:justify-between">
//           <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   className="flex items-center gap-2 p-0 h-auto"
//                 >
//                   <Avatar className="h-8 w-8">
//                     <AvatarImage
//                       src={getImage("avatar3")}
//                       alt="Admin"
//                       data-ai-hint="person face"
//                     />
//                     <AvatarFallback>A</AvatarFallback>
//                   </Avatar>
//                   <div className="flex flex-col items-start">
//                     <span className="text-sm font-semibold">
//                       {session?.user.name}
//                     </span>
//                     <span className="text-xs text-muted-foreground">
//                       {session?.user.email}
//                     </span>
//                   </div>
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="start" side="top" className="mb-2">
//                 <DropdownMenuLabel>My Account</DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 {/* <DropdownMenuItem>Profile</DropdownMenuItem>
//                 <DropdownMenuItem>Settings</DropdownMenuItem>
//                 <DropdownMenuSeparator /> */}
//                 <DropdownMenuItem onClick={handleLogout}>
//                   <LogOut className="mr-2 h-4 w-4" />
//                   <span>Logout</span>
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//           <SidebarTrigger className="hidden sm:flex" />
//         </div>
//         <Separator className="mb-2" />
//       </SidebarHeader>
//       <SidebarContent>
//         <SidebarMenu>
//           {navItems.map((item) => (
//             <SidebarMenuItem key={item.href}>
//               <Link href={item.href} legacyBehavior passHref>
//                 <SidebarMenuButton
//                   isActive={pathname === item.href}
//                   tooltip={item.label}
//                 >
//                   <item.icon />
//                   <span>{item.label}</span>
//                 </SidebarMenuButton>
//               </Link>
//             </SidebarMenuItem>
//           ))}
//         </SidebarMenu>
//       </SidebarContent>
//       {/* <SidebarFooter className="flex flex-col">
//         <Separator className="mb-2" />
//         <div className="flex items-center justify-center p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=expanded]:justify-between">
//           <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
//              <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   className="flex items-center gap-2 p-0 h-auto"
//                 >
//                   <Avatar className="h-8 w-8">
//                     <AvatarImage
//                       src={getImage("avatar1")}
//                       alt="Admin"
//                       data-ai-hint="person face"
//                     />
//                     <AvatarFallback>A</AvatarFallback>
//                   </Avatar>
//                   <div className="flex flex-col items-start">
//                     <span className="text-sm font-semibold">
//                       {session?.user.name}
//                     </span>
//                     <span className="text-xs text-muted-foreground">
//                       {session?.user.email}
//                     </span>
//                   </div>
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="start" side="top" className="mb-2">
//                 <DropdownMenuLabel>My Account</DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem>Profile</DropdownMenuItem>
//                 <DropdownMenuItem>Settings</DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem onClick={handleLogout}>
//                   <LogOut className="mr-2 h-4 w-4" />
//                   <span>Logout</span>
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>

//              <button
//               onClick={handleLogout}
//               className="relative bg-sidebar-accent text-white flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
//             >
//               <LogOut className="mr-2 h-4 w-4" />
//               <span>Logout</span>
//             </button>
//           </div>
//           <SidebarTrigger className="hidden sm:flex" />
//         </div>
//       </SidebarFooter>  */}
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
  SidebarSeparator,
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
    ],
  },
  {
    label: "Communication",
    items: [
      { href: "/notifications", icon: BellRing, label: "Push Notifications" }, // New FCM Menu
    ],
  },
];

export function SidebarNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const getImage = (id: string) =>
    PlaceHolderImages.find((img) => img.id === id)?.imageUrl;

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* --- 1. Brand / Logo Header --- */}
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

      {/* --- 2. Navigation Content --- */}
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

      {/* --- 3. User Footer (Modern Approach) --- */}
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
                      src={getImage("avatar3")}
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
                        src={getImage("avatar3")}
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
