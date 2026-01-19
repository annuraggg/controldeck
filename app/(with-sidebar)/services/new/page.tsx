"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/rbac";

export default function NewServicePage() {
  const router = useRouter();
  const { settings, isLoading } = useSettings();
  const { user, isLoading: authLoading } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    kind: "node",
    cwd: "",
    script: "",
    port: "",
  });

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          kind: form.kind,
          cwd: form.cwd.trim(),
          script: form.script.trim(),
          port: form.port ? Number(form.port) : undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create service");
      }

      const created = await res.json();
      router.push(`/services/${created.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create service");
      setSubmitting(false);
    }
  }

  const readOnly = settings?.readOnly;
  const canCreate = hasPermission(user, "services:write");
  const disabled = submitting || readOnly || isLoading || !canCreate || authLoading;

  return (
    <div className="max-w-2xl space-y-8">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Add Service</h1>
        <p className="text-sm text-muted-foreground">
          Register a new PM2 service in ControlDeck. This does not start the
          service automatically.
        </p>
        {readOnly && (
          <p className="text-sm text-yellow-700">
            Read-only mode enabled. Creating services is disabled.
          </p>
        )}
        {!canCreate && !authLoading && (
          <p className="text-sm text-muted-foreground">
            You do not have permission to create services.
          </p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={submit} className="space-y-6">
        {/* Service name */}
        <div className="space-y-1">
          <Label htmlFor="name">Service name</Label>
          <Input
            id="name"
            placeholder="scriptopia-server"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            disabled={disabled}
          />
        </div>

        {/* Service type */}
        <div className="space-y-1">
          <Label>Service type</Label>
          <Select
            value={form.kind}
            onValueChange={(v) => update("kind", v)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="node">Node service</SelectItem>
              <SelectItem value="static">Static frontend</SelectItem>
              <SelectItem value="python">Python (gunicorn)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Working directory */}
        <div className="space-y-1">
          <Label htmlFor="cwd">Working directory</Label>
          <Input
            id="cwd"
            placeholder="/home/apsit/app/server"
            value={form.cwd}
            onChange={(e) => update("cwd", e.target.value)}
            required
            disabled={disabled}
          />
        </div>

        {/* Script / entry */}
        <div className="space-y-1">
          <Label htmlFor="script">Script / entry</Label>
          <Input
            id="script"
            placeholder="dist/index.js or serve"
            value={form.script}
            onChange={(e) => update("script", e.target.value)}
            required
            disabled={disabled}
          />
        </div>

        {/* Port */}
        <div className="space-y-1">
          <Label htmlFor="port">Port (optional)</Label>
          <Input
            id="port"
            placeholder="3000"
            value={form.port}
            onChange={(e) => update("port", e.target.value)}
            disabled={disabled}
          />
        </div>

        {/* Error */}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="submit" disabled={disabled}>
            {submitting ? "Creating…" : "Create Service"}
          </Button>
        </div>
      </form>
    </div>
  );
}
