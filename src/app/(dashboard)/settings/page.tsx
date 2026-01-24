import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Settings</h1>
       <Card>
        <CardHeader>
          <CardTitle>Under Construction</CardTitle>
          <CardDescription>This section is being developed.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
            <SettingsIcon className="h-16 w-16 text-muted-foreground animate-spin-slow" />
          <h2 className="text-xl font-semibold">Coming Soon</h2>
          <p className="max-w-md text-muted-foreground">
            System-wide settings and preferences will be configurable here. We are working on bringing this feature to you.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
