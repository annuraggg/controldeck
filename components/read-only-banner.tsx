"use client";

import { useSettings } from "@/hooks/useSettings";

export function ReadOnlyBanner() {
  const { settings } = useSettings();

  if (!settings?.readOnly) return null;

  return (
    <div className="mb-4 rounded-md border border-yellow-400 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
      Read-only mode enabled. Mutating actions are disabled until read-only mode
      is turned off in Settings.
    </div>
  );
}
