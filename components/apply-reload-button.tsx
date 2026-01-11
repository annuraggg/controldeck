"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";

export function ApplyReloadButton() {
  const [loading, setLoading] = useState(false);
  const { settings } = useSettings();
  const readOnly = settings?.readOnly;

  async function applyReload() {
    setLoading(true);
    await fetch("/api/apply-reload", { method: "POST" });
    setLoading(false);
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={readOnly}>
          {readOnly ? "Read-only mode" : "Apply & reload PM2"}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reload all PM2 services?</AlertDialogTitle>
          <AlertDialogDescription>
            This will regenerate the ecosystem file and reload all PM2-managed
            services. Running processes may restart.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={applyReload}
            disabled={loading || readOnly}
          >
            {loading ? "Reloading…" : "Reload PM2"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
