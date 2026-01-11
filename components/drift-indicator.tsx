"use client";

import { useEffect, useState } from "react";
import { ApplyChangesButton } from "./apply-changes-button";

export function DriftIndicator() {
  const [drifted, setDrifted] = useState(false);

  useEffect(() => {
    fetch("/api/drift")
      .then((res) => res.json())
      .then((d) => setDrifted(d.drifted));
  }, []);

  if (!drifted) {
    return <span className="text-green-600">In sync</span>;
  }

  return (
    <>
      <span className="text-yellow-600">Apply pending</span>
      <ApplyChangesButton setDrifted={setDrifted} />
    </>
  );
}
