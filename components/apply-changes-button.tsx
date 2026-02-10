"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/rbac";

export function ApplyChangesButton({
  setDrifted,
}: {
  setDrifted: (drifted: boolean) => void;
}) {
  const [applying, setApplying] = useState(false);
  const { settings } = useSettings();
  const readOnly = settings?.readOnly;
  const { user } = useAuth();
  const canApply = hasPermission(user, "pm2:apply");

  async function apply() {
    setApplying(true);

    await fetch("/api/apply", { method: "POST" });

    setApplying(false);
    setDrifted(false);
  }

  return (
    <div className="mt-2">
      <Button
        onClick={apply}
        disabled={applying || readOnly || !canApply}
        variant={"outline"}
      >
        {readOnly
          ? "Read-only mode"
          : !canApply
          ? "Insufficient permission"
          : applying
          ? "Applying…"
          : "Apply changes"}
      </Button>
    </div>
  );
}
