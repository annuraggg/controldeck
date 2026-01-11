"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ApplyChangesButton({
  setDrifted,
}: {
  setDrifted: (drifted: boolean) => void;
}) {
  const [applying, setApplying] = useState(false);

  async function apply() {
    setApplying(true);

    await fetch("/api/apply", { method: "POST" });

    setApplying(false);
    setDrifted(false);
  }

  return (
    <div className="mt-2">
      <Button onClick={apply} disabled={applying} variant={"outline"}>
        {applying ? "Applying…" : "Apply changes"}
      </Button>
    </div>
  );
}
