"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type DesiredService = {
  cwd: string;
  script: string;
  args?: string;
  port?: number;
  env?: Record<string, string>;
};

type EnvRow = { key: string; value: string };

export function ServiceConfigEditor({
  serviceName,
  service,
  readOnly,
  onSaved,
}: {
  serviceName: string;
  service: DesiredService;
  readOnly: boolean;
  onSaved: (updated: DesiredService) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    cwd: service.cwd,
    script: service.script,
    args: service.args || "",
    port: service.port ? String(service.port) : "",
  });
  const [envRows, setEnvRows] = useState<EnvRow[]>(
    Object.entries(service.env || {}).map(([key, value]) => ({
      key,
      value,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateEnvRow(index: number, key: "key" | "value", value: string) {
    setEnvRows((rows) => {
      const copy = [...rows];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  }

  function addEnvRow() {
    setEnvRows((rows) => [...rows, { key: "", value: "" }]);
  }

  function removeEnvRow(index: number) {
    setEnvRows((rows) => rows.filter((_, i) => i !== index));
  }

  const envObject = useMemo(() => {
    const entries = envRows
      .filter((row) => row.key.trim() !== "")
      .map((row) => [row.key.trim(), row.value]);
    return Object.fromEntries(entries);
  }, [envRows]);

  async function save() {
    setSaving(true);
    setError(null);

    const payload = {
      cwd: form.cwd,
      script: form.script,
      args: form.args || undefined,
      port: form.port ? Number(form.port) : undefined,
      env: envObject,
    };

    const res = await fetch(`/api/services/${serviceName}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Failed to save service");
      setSaving(false);
      return;
    }

    const updated = await res.json();
    onSaved(updated);

    setEditing(false);
    setSaving(false);
  }

  if (!editing) {
    return (
      <div className="space-y-2">
        <Button
          variant="secondary"
          onClick={() => setEditing(true)}
          disabled={readOnly}
        >
          Edit config
        </Button>
        {readOnly && (
          <p className="text-xs text-muted-foreground">
            Configuration editing is disabled by current permissions or read-only mode.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        value={form.cwd}
        onChange={(e) => updateField("cwd", e.target.value)}
        placeholder="Working directory"
        disabled={saving}
      />
      <Input
        value={form.script}
        onChange={(e) => updateField("script", e.target.value)}
        placeholder="Script"
        disabled={saving}
      />
      <Input
        value={form.args}
        onChange={(e) => updateField("args", e.target.value)}
        placeholder="Args"
        disabled={saving}
      />
      <Input
        value={form.port}
        onChange={(e) => updateField("port", e.target.value)}
        placeholder="Port"
        disabled={saving}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Environment variables</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEnvRow}
            disabled={saving}
          >
            Add variable
          </Button>
        </div>

        {envRows.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No environment variables defined.
          </p>
        )}

        <div className="space-y-2">
          {envRows.map((row, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                placeholder="KEY"
                value={row.key}
                onChange={(e) => updateEnvRow(idx, "key", e.target.value)}
                className="w-40"
                disabled={saving}
              />
              <Input
                placeholder="value"
                value={row.value}
                onChange={(e) => updateEnvRow(idx, "value", e.target.value)}
                disabled={saving}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeEnvRow(idx)}
                disabled={saving}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
