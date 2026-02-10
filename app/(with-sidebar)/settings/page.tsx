"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/rbac";

export default function SettingsPage() {
  const [ecosystemPath, setEcosystemPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const canReadSettings = hasPermission(user, "settings:read");
  const canWriteSettings = hasPermission(user, "settings:write");

  useEffect(() => {
    if (!canReadSettings) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setEcosystemPath(data.ecosystemPath);
        setReadOnly(!!data.readOnly);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [canReadSettings]);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ecosystemPath, readOnly }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Failed to save settings");
      setSaving(false);
      return;
    }

    setSaving(false);
    setSaved(true);
  }

  async function exportConfig() {
    setExporting(true);
    setError(null);

    const res = await fetch("/api/export");
    const data = await res.json();

    const timestamp = data.timestamp || new Date().toISOString();

    const servicesBlob = new Blob(
      [JSON.stringify(data.services ?? [], null, 2)],
      {
        type: "application/json",
      }
    );
    const ecosystemBlob = new Blob(
      [data.ecosystem ?? "// Ecosystem file not found"],
      { type: "text/javascript" }
    );

    const servicesLink = document.createElement("a");
    servicesLink.href = URL.createObjectURL(servicesBlob);
    servicesLink.download = `controldeck-services-${timestamp}.json`;
    servicesLink.click();

    const ecosystemLink = document.createElement("a");
    ecosystemLink.href = URL.createObjectURL(ecosystemBlob);
    ecosystemLink.download = `ecosystem-${timestamp}.js`;
    ecosystemLink.click();

    setExporting(false);
  }

  if (authLoading || loading) return <div>Loading…</div>;
  if (!canReadSettings) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4">
        You do not have permission to view settings.
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Global configuration for ControlDeck.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Ecosystem path */}
      <div className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="ecosystemPath">PM2 ecosystem file path</Label>
          <Input
            id="ecosystemPath"
            value={ecosystemPath}
            onChange={(e) => setEcosystemPath(e.target.value)}
            placeholder="/home/apsit/ecosystem.config.js"
            disabled={saving || loading || readOnly || !canWriteSettings}
          />
          <p className="text-xs text-muted-foreground">
            Absolute path to the PM2 ecosystem file. Changing this does not
            affect running services until Apply Changes. ControlDeck will
            generate and manage this file; if it does not exist, it will be
            created automatically.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="readOnly"
            type="checkbox"
            checked={readOnly}
            onChange={(e) => setReadOnly(e.target.checked)}
            disabled={saving || loading || !canWriteSettings}
          />
          <Label htmlFor="readOnly">Enable read-only mode</Label>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving || loading || !canWriteSettings}>
            {saving ? "Saving…" : "Save settings"}
          </Button>

          {saved && <span className="text-sm text-green-600">Saved</span>}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Backup / Export</h2>
        <p className="text-sm text-muted-foreground">
          Download the current intent (MongoDB) and generated ecosystem file as
          timestamped archives. This does not modify any files.
        </p>
        <Button onClick={exportConfig} disabled={exporting}>
          {exporting ? "Preparing…" : "Export config"}
        </Button>
      </div>
    </div>
  );
}
