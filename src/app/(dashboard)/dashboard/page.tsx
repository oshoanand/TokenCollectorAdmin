"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

// UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Icons & Hooks
import {
  MoreHorizontal,
  MessageSquare,
  Edit2,
  Trash2,
  Search,
  Loader2,
  X,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNotification } from "@/components/providers/notification-provider";
import {
  useUsers,
  useOnlineUsers,
  useUpdateUser,
  useDeleteUser,
  User,
} from "@/hooks/use-users";
import { formatPhoneNumber } from "@/utils/helper";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { socket } = useNotification();

  // --- State for Server-Side Pagination & Search ---
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // --- Data Hooks ---
  const {
    data: usersData,
    isLoading,
    isError,
  } = useUsers(page, limit, debouncedSearch);
  const { data: initialOnlineUsers = [] } = useOnlineUsers();
  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  // --- THE FIX: Real-time Status Sync State ---
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "",
  });

  // 1. Sync from REST API securely
  useEffect(() => {
    if (Array.isArray(initialOnlineUsers) && initialOnlineUsers.length > 0) {
      // Ensure we strip any quotes or whitespace, and force it to a String
      const stringIds = initialOnlineUsers.map((id) => String(id).trim());
      setOnlineUsers(new Set(stringIds));
    }
  }, [initialOnlineUsers]);

  // 2. Sync from Socket securely
  useEffect(() => {
    if (!socket) return;

    const handleStatusChange = ({
      userId,
      isOnline,
    }: {
      userId: string;
      isOnline: boolean;
    }) => {
      // Force string conversion just in case the socket sends a number or padded string
      const idString = String(userId).trim();

      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (isOnline) {
          next.add(idString);
        } else {
          next.delete(idString);
        }
        return next;
      });
    };

    socket.on("user_status_changed", handleStatusChange);
    return () => {
      socket.off("user_status_changed", handleStatusChange);
    };
  }, [socket]);

  // --- Handlers ---
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (usersData?.meta.totalPages || 1)) {
      setPage(newPage);
    }
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email || "",
      mobile: user.mobile,
      role: user.userRole,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    updateUser(
      { id: selectedUser.id, updates: editFormData },
      {
        onSuccess: () => {
          toast({ title: "User updated successfully" });
          setIsEditModalOpen(false);
          setSelectedUser(null);
        },
        onError: () =>
          toast({ title: "Failed to update user", variant: "destructive" }),
      },
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteUser(id, {
        onSuccess: () => toast({ title: "User deleted successfully" }),
        onError: () =>
          toast({ title: "Failed to delete user", variant: "destructive" }),
      });
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">
            Manage platform users, view statuses, and initiate support chats.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[300px]">User</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                    <span className="text-muted-foreground">
                      Loading users...
                    </span>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-48 text-center text-red-500"
                  >
                    <X className="h-8 w-8 mx-auto mb-2" />
                    Failed to load users.
                  </TableCell>
                </TableRow>
              ) : usersData?.data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-48 text-center text-muted-foreground"
                  >
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                usersData?.data.map((user) => {
                  // SECURE CHECK: Also trim the user.id being rendered to guarantee a perfect match
                  const isOnline = onlineUsers.has(String(user.id).trim());

                  return (
                    <TableRow key={user.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10 border border-gray-200">
                              <AvatarImage src={user?.image || ""} />
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {user.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span
                              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white transition-colors duration-300 ${
                                isOnline ? "bg-green-500" : "bg-gray-300"
                              }`}
                            />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {user.name}
                              </span>
                              {isOnline && (
                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                                  Online
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              ID: {user.id.substring(0, 8)}...{" "}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {formatPhoneNumber(user.mobile)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.email || "No email"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.userRole === "COLLECTOR"
                              ? "border-orange-200 text-orange-700 bg-orange-50"
                              : "border-blue-200 text-blue-700 bg-blue-50"
                          }
                        >
                          {user.userRole === "COLLECTOR" && (
                            <Shield className="h-3 w-3 mr-1" />
                          )}
                          {user.userRole}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(user.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4 text-gray-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/chat?userId=${user.id}`)
                              }
                            >
                              <MessageSquare className="mr-2 h-4 w-4 text-blue-500" />
                              Message User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(user)}
                            >
                              <Edit2 className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(user.id, user.name)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Server-Side Pagination Controls */}
      {usersData && usersData.meta.totalPages > 1 && (
        <div className="mt-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(page - 1)}
                  className={
                    page === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {Array.from({ length: usersData.meta.totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => handlePageChange(i + 1)}
                    isActive={page === i + 1}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(page + 1)}
                  className={
                    page === usersData.meta.totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
          </DialogHeader>
          <form
            id="edit-user-form"
            onSubmit={handleSaveEdit}
            className="grid gap-4 py-4"
          >
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-right">Name</label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                className="col-span-3 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-right">Mobile</label>
              <input
                type="text"
                required
                value={editFormData.mobile}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, mobile: e.target.value })
                }
                className="col-span-3 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-right">Email</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
                className="col-span-3 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-right">Role</label>
              <select
                value={editFormData.role}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, role: e.target.value })
                }
                className="col-span-3 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="VISITOR">VISITOR</option>
                <option value="COLLECTOR">COLLECTOR</option>
              </select>
            </div>
          </form>
          <DialogFooter className="sm:justify-between mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="edit-user-form" disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
