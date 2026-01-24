"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrdersQuery, useUpdateOrderMutation } from "@/data/use-orders";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type StatusFilter = "ALL" | "REQUESTED" | "ISSUED";

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("ALL");
  const { data: results, isLoading, isError } = useOrdersQuery(statusFilter);

  const updateOrderMutation = useUpdateOrderMutation();

  const handleQuantityChange = (orderId: string, newQuantity: string) => {
    const quantityValue = Number(newQuantity);
    if (!isNaN(quantityValue) && quantityValue >= 0) {
      updateOrderMutation.mutate({ id: orderId, quantity: quantityValue });
    }
  };

  const handleIssueOrder = (
    id: string,
    tokenCode: string,
    quantity: number,
    mobileNumber: string,
  ) => {
    updateOrderMutation.mutate({
      id: id,
      tokenCode: tokenCode,
      tokenStatus: "ISSUED",
      quantity: quantity,
      receivedAt: new Date().toISOString(),
      mobileNumber: mobileNumber,
    });
  };

  return (
    <div className="space-y-6">
      {/* <h1 className="font-headline text-3xl font-bold tracking-tight">
        Order Management
      </h1> */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>
                View and manage all customer orders
              </CardDescription>
            </div>
            <Tabs
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <TabsList>
                <TabsTrigger value="ALL">All</TabsTrigger>
                <TabsTrigger value="REQUESTED">Pending</TabsTrigger>
                <TabsTrigger value="ISSUED">Issued</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[64px]">Token</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead className="w-[144px]">Order Number</TableHead>
                <TableHead className="w-[112px]">Order Code</TableHead>
                <TableHead className="w-[244px]">Created Date</TableHead>
                <TableHead className="w-[164px]">Issued Date</TableHead>
                <TableHead className="w-[80px]">Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[64px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-9 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-[70px] rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-9 w-[100px]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Failed to load orders.
                  </TableCell>
                </TableRow>
              ) : results && results.length > 0 ? (
                results.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.tokenCode}</TableCell>
                    <TableCell>{order.mobileNumber}</TableCell>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{order.orderCode}</TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), "PP p")}
                    </TableCell>
                    <TableCell className="w-56">
                      {order.receivedAt
                        ? format(new Date(order.receivedAt), "PP p")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        defaultValue={order.quantity}
                        onBlur={(e) =>
                          handleQuantityChange(order.id, e.target.value)
                        }
                        disabled={
                          order.tokenStatus === "ISSUED" ||
                          updateOrderMutation.isPending
                        }
                        className="w-14"
                      />
                    </TableCell>
                    <TableCell className="w-[80px]">
                      <Badge
                        variant={
                          order.tokenStatus === "ISSUED"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          order.tokenStatus === "REQUESTED"
                            ? "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
                            : order.tokenStatus === "ISSUED"
                              ? "bg-green-500/20 text-green-700 border-green-500/30"
                              : ""
                        }
                      >
                        {order.tokenStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[80px]">
                      {order.tokenStatus === "REQUESTED" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleIssueOrder(
                              order.id,
                              order.tokenCode,
                              order.quantity,
                              order.mobileNumber,
                            )
                          }
                          disabled={
                            !order.quantity ||
                            order.quantity <= 0 ||
                            updateOrderMutation.isPending
                          }
                        >
                          {updateOrderMutation.isPending &&
                          updateOrderMutation.variables?.id === order.id
                            ? "Issuing..."
                            : "Issue Order"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No orders found for the selected filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
