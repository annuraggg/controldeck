"use client";

import { useSettings } from "@/hooks/useSettings";

export function ReadOnlyBanner() {
  const { settings } = useSettings();

  if (!settings?.readOnly) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 font-semibold text-amber-700">
        !
      </span>
      <div className="space-y-1">
        <p className="font-medium">Read-only mode enabled</p>
        <p className="text-sm text-amber-800">
          Mutating controls stay visible but are temporarily disabled. Turn off read-only
          mode in Settings when you&apos;re ready to make changes.
        </p>
      </div>
    </div>
  );
}
