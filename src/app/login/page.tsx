"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Atom,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  X,
} from "lucide-react";

const formSchema = z.object({
  mobile: z
    .string()
    .regex(/^\+7\d{10}$/, "Please enter a valid 10-digit mobile number."),
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters.",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    }),
});

export default function LoginPage() {
  const [error, setError] = React.useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);

  // Default to "/" or "/dashboard" if no callback is present
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mobile: "+7",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    const { mobile, password } = values;
    const mobileNumber = mobile.substring(2);

    try {
      const res = await signIn("credentials", {
        mobile: mobileNumber,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (res?.error) {
        console.log(res?.error);
        throw new Error(res?.error);
      } else {
        // Successful login -> Redirect manually to the callbackUrl
        router.push(callbackUrl);
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred.");
    }
  }

  const handleMobileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldOnChange: (...event: any[]) => void,
  ) => {
    let value = e.target.value;
    // Ensure it starts with +7 and only contains digits after that
    if (!value.startsWith("+7")) {
      value = "+7";
    }
    // Allow only numbers after the prefix
    const numericPart = value.substring(2).replace(/[^0-9]/g, "");
    // Limit to 10 digits
    const limitedNumericPart = numericPart.substring(0, 10);
    const newValue = `+7${limitedNumericPart}`;

    fieldOnChange(newValue);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Atom className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Enter your mobile number and password to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 relative pr-10">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setError(null)}
                className="absolute top-2 right-2  h-8 w-8"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="+7 (___) ___-__-__"
                          {...field}
                          onChange={(e) =>
                            handleMobileChange(e, field.onChange)
                          }
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          {...field}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
