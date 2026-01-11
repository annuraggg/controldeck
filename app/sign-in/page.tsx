"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

function Page() {
  const [loading, setLoading] = useState(false);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      // empty placeholder logic
      await new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Not implemented")), 1000)
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-linear-to-br from-primary/20  via-secondary to-primary/10 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-bold text-3xl text-center font-mono italic">
            {process.env.NEXT_PUBLIC_SERVER_NAME} ControlDeck
          </CardTitle>
          <CardDescription>
            Enter your username below to login to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={signIn}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <p className="text-center text-xs mt-3 opacity-85">
            Made with ❤️ by{" "}
            <a
              href="https://anuragsawant.in"
              className="hover:text-primary underline transition-all"
            >
              Anurag Sawant
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Page;
