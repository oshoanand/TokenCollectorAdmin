"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Order } from "@/lib/placeholder-data";
import { type Result } from "@/lib/placeholder-data";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/utils/api-client";

type StatusFilter = "ALL" | "REQUESTED" | "ISSUED";

const getOrders = async (status: StatusFilter): Promise<Order[]> => {
  const response = await apiRequest({
    method: "get",
    url:
      status === "ALL"
        ? "/api/token/all"
        : `/api/token/all/${status.toLowerCase()}`,
  });

  return response as Order[];
};

const updateOrder = async (order: Partial<Order>): Promise<Result> => {
  const response = await apiRequest({
    method: "patch",
    url: `/api/token/status/${order.quantity}/${order.tokenCode}?mobile=${order.mobileNumber}&id=${order.id}`,
  });
  // console.log(response);
  return response as Result;
};

export function useOrdersQuery(status: StatusFilter) {
  return useQuery({
    queryKey: ["orders", status],
    queryFn: () => getOrders(status),
  });
}

export function useUpdateOrderMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Order updated",
        description: "The order has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    },
  });
}
