"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ServiceConfigEditor({
  service,
  onSaved,
}: {
  service: any;
  onSaved: (updated: any) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...service });
  const [saving, setSaving] = useState(false);

  function update(key: string, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);

    const res = await fetch(`/api/services/${service.name}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cwd: form.cwd,
        script: form.script,
        args: form.args,
        port: form.port,
        env: form.env,
      }),
    });

    const updated = await res.json();
    onSaved(updated);

    setEditing(false);
    setSaving(false);
  }

  if (!editing) {
    return (
      <Button variant="secondary" onClick={() => setEditing(true)}>
        Edit config
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        value={form.cwd}
        onChange={(e) => update("cwd", e.target.value)}
        placeholder="Working directory"
      />
      <Input
        value={form.script}
        onChange={(e) => update("script", e.target.value)}
        placeholder="Script"
      />
      <Input
        value={form.args || ""}
        onChange={(e) => update("args", e.target.value)}
        placeholder="Args"
      />
      <Input
        value={form.port || ""}
        onChange={(e) => update("port", e.target.value)}
        placeholder="Port"
      />

      <div className="flex gap-2">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
