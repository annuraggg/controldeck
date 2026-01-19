"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/rbac";

type UserRow = {
  id: string;
  username: string;
  role: "admin" | "operator" | "viewer";
  serviceScopes: string[];
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UsersPage() {
  const { data, error, isLoading, mutate } = useSWR<UserRow[]>("/api/users", fetcher);
  const { settings } = useSettings();
  const { user, isLoading: authLoading } = useAuth();
  const readOnly = settings?.readOnly;
  const canManage = hasPermission(user, "users:manage");

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "operator",
    serviceScopes: "",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const disabled = busy || readOnly || !canManage;

  const users = useMemo(() => data ?? [], [data]);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
          role: form.role,
          serviceScopes: form.serviceScopes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to create user");

      setForm({ username: "", password: "", role: "operator", serviceScopes: "" });
      setMessage("User created");
      mutate();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setBusy(false);
    }
  }

  async function updateUser(
    id: string,
    payload: Partial<{ role: string; serviceScopes: string[]; password: string }>
  ) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Update failed");
      setMessage("User updated");
      mutate();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  if (authLoading) {
    return <div className="rounded-lg border bg-muted/30 p-6">Loading…</div>;
  }

  if (!canManage) {
    return (
      <div className="rounded-lg border bg-muted/30 p-6">
        <h1 className="text-xl font-semibold">User Management</h1>
        <p className="text-sm text-muted-foreground">
          You do not have permission to manage users.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <p className="text-sm text-muted-foreground">
          Create administrators and scoped operators. Passwords are stored as bcrypt hashes.
        </p>
        {readOnly && (
          <p className="text-xs text-amber-700">
            Read-only mode is enabled. Changes are blocked.
          </p>
        )}
      </div>

      <form onSubmit={createUser} className="space-y-4 rounded-lg border bg-background p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              required
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={form.role}
              onValueChange={(role) => setForm((f) => ({ ...f, role }))}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="serviceScopes">Service scopes (comma separated)</Label>
            <Input
              id="serviceScopes"
              placeholder="leave empty for all services"
              value={form.serviceScopes}
              onChange={(e) => setForm((f) => ({ ...f, serviceScopes: e.target.value }))}
              disabled={disabled}
            />
          </div>
        </div>

        {message && <p className="text-sm text-muted-foreground">{message}</p>}

        <div className="flex justify-end">
          <Button type="submit" disabled={disabled}>
            {busy ? "Saving…" : "Create user"}
          </Button>
        </div>
      </form>

      <div className="space-y-3 rounded-lg border bg-background p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Existing users</h2>
          {isLoading && <span className="text-xs text-muted-foreground">Loading…</span>}
        </div>
        {error && (
          <p className="text-sm text-destructive">
            Failed to load users. Refresh to retry.
          </p>
        )}
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="grid gap-3 rounded-md border px-3 py-2 md:grid-cols-5 md:items-center"
            >
              <div className="md:col-span-2">
                <p className="font-semibold">{u.username}</p>
                <p className="text-xs text-muted-foreground">
                  Scope: {u.serviceScopes.length ? u.serviceScopes.join(", ") : "All services"}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Role</Label>
                <Select
                  value={u.role}
                  onValueChange={(role) => updateUser(u.id, { role })}
                  disabled={disabled}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Service scopes</Label>
                <Input
                  className="mt-1"
                  defaultValue={u.serviceScopes.join(", ")}
                  disabled={disabled}
                  onBlur={(e) =>
                    updateUser(u.id, {
                      serviceScopes: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Reset password</Label>
                <Input
                  type="password"
                  placeholder="New password"
                  disabled={disabled}
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      updateUser(u.id, { password: e.target.value.trim() });
                      e.target.value = "";
                    }
                  }}
                />
              </div>
            </div>
          ))}

          {users.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">No users yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
