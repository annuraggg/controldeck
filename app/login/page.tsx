"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || "Invalid credentials");
      }

      toast.success("Signed in");
      const next = searchParams.get("next") || "/system-monitor";
      router.push(next);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-primary/10 via-secondary/10 to-primary/5 px-4">
      <Card className="w-full max-w-md border-muted/60 shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="font-mono text-3xl font-bold italic">
            {process.env.NEXT_PUBLIC_SERVER_NAME} ControlDeck
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Secure sign-in with role-based access and per-service scopes.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={signIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="johndoe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2 text-center text-xs text-muted-foreground">
          <p className="opacity-80">
            Made with ❤️ by{" "}
            <a
              href="https://anuragsawant.in"
              className="underline transition hover:text-primary"
            >
              Anurag Sawant
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
