"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/rbac";

type UserRole = "admin" | "operator" | "viewer";
type UserRow = {
  id: string;
  username: string;
  role: UserRole;
  serviceScopes: string[];
};

type EditState = {
  role: UserRole;
  serviceScopes: string;
  password: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const roleVariant: Record<UserRole, "default" | "success" | "secondary"> = {
  admin: "default",
  operator: "success",
  viewer: "secondary",
};

export default function UsersPage() {
  const { data, error, isLoading, mutate } = useSWR<UserRow[]>("/api/users", fetcher);
  const { settings } = useSettings();
  const { user, isLoading: authLoading } = useAuth();
  const readOnly = settings?.readOnly;
  const canManage = hasPermission(user, "users:manage");

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "operator" as UserRole,
    serviceScopes: "",
  });
  const [drafts, setDrafts] = useState<Record<string, EditState>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const users = useMemo(() => data ?? [], [data]);
  const disabled = readOnly || !canManage;

  function getDraft(u: UserRow): EditState {
    return (
      drafts[u.id] ?? {
        role: u.role,
        serviceScopes: u.serviceScopes.join(", "),
        password: "",
      }
    );
  }

  function setDraft(id: string, base: EditState, next: Partial<EditState>) {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? base),
        ...next,
      },
    }));
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setCreating(true);
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
      setMessage("User created successfully");
      await mutate();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  async function saveUser(id: string, fallback: UserRow) {
    if (disabled) return;
    const draft = getDraft(fallback);
    setBusyId(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: draft.role,
          serviceScopes: draft.serviceScopes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          password: draft.password.trim() || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Update failed");

      setMessage(`Updated ${fallback.username}`);
      setDraft(id, draft, { password: "" });
      await mutate();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  if (authLoading) {
    return <div className="rounded-lg border bg-muted/30 p-6">Loading…</div>;
  }

  if (!canManage) {
    return (
      <div className="rounded-lg border bg-muted/30 p-6">
        <h1 className="text-xl font-semibold">User Management</h1>
        <p className="text-sm text-muted-foreground">You do not have permission to manage users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Create User</h2>
            <p className="text-sm text-muted-foreground">Provision account access with explicit role and scope.</p>
          </div>
          {readOnly && <Badge variant="warning">Read-only mode enabled</Badge>}
        </div>

        <form onSubmit={createUser} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} required disabled={disabled || creating} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required disabled={disabled || creating} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(role: UserRole) => setForm((f) => ({ ...f, role }))} disabled={disabled || creating}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="serviceScopes">Service scopes</Label>
            <Input id="serviceScopes" placeholder="comma-separated, leave empty for all" value={form.serviceScopes} onChange={(e) => setForm((f) => ({ ...f, serviceScopes: e.target.value }))} disabled={disabled || creating} />
          </div>

          <div className="md:col-span-2 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{message ?? "Use scoped access for least privilege."}</p>
            <Button type="submit" disabled={disabled || creating}>{creating ? "Creating…" : "Create User"}</Button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Manage Existing Users</h2>
          {isLoading && <span className="text-xs text-muted-foreground">Loading…</span>}
        </div>

        {error && <p className="text-sm text-destructive">Failed to load users. Refresh to retry.</p>}

        <div className="space-y-3">
          {users.map((u) => {
            const draft = getDraft(u);
            const rowBusy = busyId === u.id;

            return (
              <article key={u.id} className="rounded-lg border bg-background/60 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{u.username}</p>
                    <p className="text-xs text-muted-foreground">User ID: {u.id}</p>
                  </div>
                  <Badge variant={roleVariant[draft.role]}>{draft.role}</Badge>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={draft.role} onValueChange={(role: UserRole) => setDraft(u.id, draft, { role })} disabled={disabled || rowBusy}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="operator">Operator</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Service scopes</Label>
                    <Input value={draft.serviceScopes} onChange={(e) => setDraft(u.id, draft, { serviceScopes: e.target.value })} disabled={disabled || rowBusy} />
                  </div>

                  <div className="space-y-2">
                    <Label>Reset password</Label>
                    <Input type="password" placeholder="optional" value={draft.password} onChange={(e) => setDraft(u.id, draft, { password: e.target.value })} disabled={disabled || rowBusy} />
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <Button type="button" onClick={() => saveUser(u.id, u)} disabled={disabled || rowBusy}>
                    {rowBusy ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </article>
            );
          })}

          {users.length === 0 && !isLoading && <p className="text-sm text-muted-foreground">No users found.</p>}
        </div>
      </section>
    </div>
  );
}
