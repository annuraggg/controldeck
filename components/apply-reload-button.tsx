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
import { AlertTriangle } from "lucide-react";

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
        <Button
          variant="destructive"
          className="w-full justify-center font-semibold"
          disabled={readOnly}
        >
          <AlertTriangle className="h-4 w-4" />
          {readOnly ? "Read-only mode" : "Apply & reload PM2"}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reload all PM2 services?</AlertDialogTitle>
          <AlertDialogDescription>
            This regenerates the ecosystem file and reloads all PM2-managed services.
            Running processes may restart. No changes are applied automatically—this is
            an explicit, disruptive action.
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
