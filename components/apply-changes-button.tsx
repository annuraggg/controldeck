"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";

export function ApplyChangesButton({
  setDrifted,
}: {
  setDrifted: (drifted: boolean) => void;
}) {
  const [applying, setApplying] = useState(false);
  const { settings } = useSettings();
  const readOnly = settings?.readOnly;

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
        disabled={applying || readOnly}
        variant={"outline"}
      >
        {readOnly ? "Read-only mode" : applying ? "Applying…" : "Apply changes"}
      </Button>
    </div>
  );
}
