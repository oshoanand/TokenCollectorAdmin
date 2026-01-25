// "use client";
// import * as React from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useOrdersQuery, useUpdateOrderMutation } from "@/data/use-orders";
// import { format } from "date-fns";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// type StatusFilter = "ALL" | "REQUESTED" | "ISSUED";

// export default function OrdersPage() {
//   const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("ALL");
//   const { data: results, isLoading, isError } = useOrdersQuery(statusFilter);

//   const updateOrderMutation = useUpdateOrderMutation();

//   const handleQuantityChange = (orderId: string, newQuantity: string) => {
//     const quantityValue = Number(newQuantity);
//     if (!isNaN(quantityValue) && quantityValue >= 0) {
//       updateOrderMutation.mutate({ id: orderId, quantity: quantityValue });
//     }
//   };

//   const handleIssueOrder = (
//     id: string,
//     tokenCode: string,
//     quantity: number,
//     mobileNumber: string,
//   ) => {
//     updateOrderMutation.mutate({
//       id: id,
//       tokenCode: tokenCode,
//       tokenStatus: "ISSUED",
//       quantity: quantity,
//       receivedAt: new Date().toISOString(),
//       mobileNumber: mobileNumber,
//     });
//   };

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <CardTitle>All Orders</CardTitle>
//               <CardDescription>
//                 View and manage all customer orders
//               </CardDescription>
//             </div>
//             <Tabs
//               value={statusFilter}
//               onValueChange={(value) => setStatusFilter(value as StatusFilter)}
//             >
//               <TabsList>
//                 <TabsTrigger value="ALL">All</TabsTrigger>
//                 <TabsTrigger value="REQUESTED">Pending</TabsTrigger>
//                 <TabsTrigger value="ISSUED">Issued</TabsTrigger>
//               </TabsList>
//             </Tabs>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[64px]">Token</TableHead>
//                 <TableHead>Mobile</TableHead>
//                 <TableHead className="w-[144px]">Order Number</TableHead>
//                 <TableHead className="w-[112px]">Order Code</TableHead>
//                 <TableHead className="w-[244px]">Created Date</TableHead>
//                 <TableHead className="w-[164px]">Issued Date</TableHead>
//                 <TableHead className="w-[80px]">Quantity</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead className="w-[80px]">
//                   <span className="sr-only">Actions</span>
//                 </TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {isLoading ? (
//                 Array.from({ length: 5 }).map((_, i) => (
//                   <TableRow key={i}>
//                     <TableCell>
//                       <Skeleton className="h-4 w-[64px]" />
//                     </TableCell>
//                     <TableCell>
//                       <Skeleton className="h-4 w-[100px]" />
//                     </TableCell>
//                     <TableCell>
//                       <Skeleton className="h-4 w-[80px]" />
//                     </TableCell>
//                     <TableCell>
//                       <Skeleton className="h-4 w-[150px]" />
//                     </TableCell>
//                     <TableCell>
//                       <Skeleton className="h-4 w-[150px]" />
//                     </TableCell>
//                     <TableCell>
//                       <Skeleton className="h-9 w-8" />
//                     </TableCell>
//                     <TableCell>
//                       <Skeleton className="h-6 w-[70px] rounded-full" />
//                     </TableCell>
//                     <TableCell>
//                       <Skeleton className="h-9 w-[100px]" />
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : isError ? (
//                 <TableRow>
//                   <TableCell colSpan={8} className="h-24 text-center">
//                     Failed to load orders.
//                   </TableCell>
//                 </TableRow>
//               ) : results && results.length > 0 ? (
//                 results.map((order) => (
//                   <TableRow key={order.id}>
//                     <TableCell>{order.tokenCode}</TableCell>
//                     <TableCell>{order.mobileNumber}</TableCell>
//                     <TableCell>{order.orderNumber}</TableCell>
//                     <TableCell>{order.orderCode}</TableCell>
//                     <TableCell>
//                       {format(new Date(order.createdAt), "PP p")}
//                     </TableCell>
//                     <TableCell className="w-56">
//                       {order.receivedAt
//                         ? format(new Date(order.receivedAt), "PP p")
//                         : "-"}
//                     </TableCell>
//                     <TableCell>
//                       <Input
//                         type="number"
//                         min="1"
//                         defaultValue={order.quantity}
//                         onBlur={(e) =>
//                           handleQuantityChange(order.id, e.target.value)
//                         }
//                         disabled={
//                           order.tokenStatus === "ISSUED" ||
//                           updateOrderMutation.isPending
//                         }
//                         className="w-14"
//                       />
//                     </TableCell>
//                     <TableCell className="w-[80px]">
//                       <Badge
//                         variant={
//                           order.tokenStatus === "ISSUED"
//                             ? "default"
//                             : "secondary"
//                         }
//                         className={
//                           order.tokenStatus === "REQUESTED"
//                             ? "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
//                             : order.tokenStatus === "ISSUED"
//                               ? "bg-green-500/20 text-green-700 border-green-500/30"
//                               : ""
//                         }
//                       >
//                         {order.tokenStatus}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="w-[80px]">
//                       {order.tokenStatus === "REQUESTED" && (
//                         <Button
//                           size="sm"
//                           onClick={() =>
//                             handleIssueOrder(
//                               order.id,
//                               order.tokenCode,
//                               order.quantity,
//                               order.mobileNumber,
//                             )
//                           }
//                           disabled={
//                             !order.quantity ||
//                             order.quantity <= 0 ||
//                             updateOrderMutation.isPending
//                           }
//                         >
//                           {updateOrderMutation.isPending &&
//                           updateOrderMutation.variables?.id === order.id
//                             ? "Issuing..."
//                             : "Issue Order"}
//                         </Button>
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={8} className="h-24 text-center">
//                     No orders found for the selected filter.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
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
import { ChevronLeft, ChevronRight, Search, ArrowUpDown } from "lucide-react";

type StatusFilter = "ALL" | "REQUESTED" | "ISSUED";

export default function TokensPage() {
  const [statusFilter, setStatusFilter] =
    React.useState<StatusFilter>("REQUESTED");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  // Fetch all data (Client-side filtering for this example)
  // Ideally, pass 'page' and 'search' to useOrdersQuery for server-side pagination
  const { data: allOrders, isLoading, isError } = useOrdersQuery("ALL");

  const updateOrderMutation = useUpdateOrderMutation();

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  // --- Filtering & Searching Logic ---
  const filteredOrders = React.useMemo(() => {
    if (!allOrders) return [];

    return allOrders.filter((order) => {
      // 1. Status Filter
      if (statusFilter !== "ALL" && order.tokenStatus !== statusFilter)
        return false;

      // 2. Text Search (Token, Mobile, Order #)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          order.tokenCode.toLowerCase().includes(query) ||
          order.mobileNumber.includes(query) ||
          order.orderNumber.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [allOrders, statusFilter, searchQuery]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  // --- Handlers ---
  const handleQuantityChange = (orderId: string, newQuantity: string) => {
    const quantityValue = Number(newQuantity);
    if (!isNaN(quantityValue) && quantityValue >= 0) {
      updateOrderMutation.mutate({ id: orderId, quantity: quantityValue });
    }
  };

  const handleIssueOrder = (order: any) => {
    updateOrderMutation.mutate({
      id: order.id,
      tokenCode: order.tokenCode,
      tokenStatus: "ISSUED",
      quantity: order.quantity,
      receivedAt: new Date().toISOString(),
      mobileNumber: order.mobileNumber,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Token Management</CardTitle>
              <CardDescription>
                Manage incoming token requests and issuance.
              </CardDescription>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search token, mobile..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Tabs */}
              <Tabs
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as StatusFilter)
                }
              >
                <TabsList>
                  <TabsTrigger value="REQUESTED">Pending</TabsTrigger>
                  <TabsTrigger value="ISSUED">Issued</TabsTrigger>
                  <TabsTrigger value="ALL">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Token</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Yandex Code</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                      Created <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[100px]">Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading Skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-red-500"
                    >
                      Failed to load data. Please try again.
                    </TableCell>
                  </TableRow>
                ) : paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No orders found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium font-mono text-primary">
                        {order.tokenCode}
                      </TableCell>
                      <TableCell>{order.mobileNumber}</TableCell>
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.orderCode}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex flex-col">
                          <span>
                            {format(new Date(order.createdAt), "MMM d, yyyy")}
                          </span>
                          <span className="text-xs">
                            {format(new Date(order.createdAt), "h:mm a")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          defaultValue={order.quantity}
                          onBlur={(e) =>
                            handleQuantityChange(order.id, e.target.value)
                          }
                          disabled={order.tokenStatus === "ISSUED"}
                          className="w-16 h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            order.tokenStatus === "REQUESTED"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100"
                              : "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
                          }
                        >
                          {order.tokenStatus === "REQUESTED"
                            ? "Pending"
                            : "Issued"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {order.tokenStatus === "REQUESTED" ? (
                          <Button
                            size="sm"
                            onClick={() => handleIssueOrder(order)}
                            disabled={
                              !order.quantity ||
                              order.quantity <= 0 ||
                              updateOrderMutation.isPending
                            }
                          >
                            Issue
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Issued{" "}
                            {order.receivedAt
                              ? format(new Date(order.receivedAt), "p")
                              : ""}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {!isLoading && filteredOrders.length > 0 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong>{" "}
                to{" "}
                <strong>
                  {Math.min(currentPage * itemsPerPage, filteredOrders.length)}
                </strong>{" "}
                of <strong>{filteredOrders.length}</strong> results
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
