import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/utils/api-client";

export interface User {
  id: string;
  name: string;
  email: string | null;
  mobile: string;
  image: string;
  userRole: string;
  createdAt: string;
}

export interface PaginatedUsers {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Updated hook to accept pagination and search parameters
export const useUsers = (page: number, limit: number, search: string) => {
  return useQuery({
    queryKey: ["users", page, limit, search],
    queryFn: () =>
      apiRequest<PaginatedUsers>({
        url: `/api/user/admin/list?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
        method: "GET",
      }),
  });
};

export const useOnlineUsers = () => {
  return useQuery({
    queryKey: ["onlineUsers"],
    queryFn: () =>
      apiRequest<number[]>({ url: "/api/user/online", method: "GET" }),
    refetchInterval: 30000, // Background sync every 30s
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; updates: Partial<User> }) =>
      apiRequest({
        url: `/api/user/admin/${data.id}`,
        method: "PUT",
        data: data.updates,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest({ url: `/api/user/admin/${id}`, method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};
