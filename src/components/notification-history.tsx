"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface NotificationLog {
  id: string; // CHANGED: Prisma uses 'id', Mongo used '_id'
  title: string;
  body: string;
  targetType: "topic" | "token";
  target: string;
  status: "SENT" | "FAILED";
  sentAt: string;
}

export function NotificationHistory() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to refresh data
  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/notifications/history");
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []); // Run once on mount

  return (
    <Card className="mt-6">
      {/* ... Header ... */}
      <CardContent>
        <Table>
          {/* ... Table Header ... */}
          <TableBody>
            {/* ... Loading/Empty states ... */}

            {logs.map((log) => (
              <TableRow key={log.id}>
                {" "}
                {/* CHANGED: key={log.id} */}
                <TableCell>
                  {log.status === "SENT" ? (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 gap-1"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Sent
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" /> Failed
                    </Badge>
                  )}
                </TableCell>
                {/* ... Rest of the cells remain the same ... */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
