"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [ecosystemPath, setEcosystemPath] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setEcosystemPath(data.ecosystemPath);
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);

    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ecosystemPath }),
    });

    setSaving(false);
    setSaved(true);
  }

  if (loading) return <div>Loading…</div>;

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Global configuration for ControlDeck.
        </p>
      </div>

      {/* Ecosystem path */}
      <div className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="ecosystemPath">PM2 ecosystem file path</Label>
          <Input
            id="ecosystemPath"
            value={ecosystemPath}
            onChange={(e) => setEcosystemPath(e.target.value)}
            placeholder="/home/apsit/ecosystem.config.js"
          />
          <p className="text-xs text-muted-foreground">
            ControlDeck will generate and manage this file. If it does not
            exist, it will be created automatically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </Button>

          {saved && <span className="text-sm text-green-600">Saved</span>}
        </div>
      </div>
    </div>
  );
}
