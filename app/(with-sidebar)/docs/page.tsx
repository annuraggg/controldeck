export default function DocsPage() {
  return (
    <div className="max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">ControlDeck Docs</h1>
        <p className="text-sm text-muted-foreground">
          A quick, practical guide for operators using ControlDeck to manage PM2
          services.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">What ControlDeck is</h2>
        <p className="text-muted-foreground">
          ControlDeck is a single-server control plane for managing PM2
          workloads. It keeps the desired service intent in MongoDB, generates a
          PM2 ecosystem file from that intent, and lets operators deliberately
          push those changes to the runtime.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Intent vs. ecosystem vs. PM2</h2>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>
            <strong>Intent (MongoDB):</strong> the source of truth for services,
            ports, scripts, and settings edited in the UI.
          </li>
          <li>
            <strong>Ecosystem file:</strong> the generated PM2 config written to
            the path in Settings. It mirrors the intent but is only rewritten
            when you Apply.
          </li>
          <li>
            <strong>PM2 runtime:</strong> the processes currently running. It
            changes only when you explicitly start/stop services or choose Apply
            & Reload PM2.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Apply buttons</h2>
        <div className="space-y-2 text-muted-foreground">
          <p>
            <strong>Apply Changes</strong> regenerates the ecosystem file from
            the stored intent. It does not touch running processes; PM2 keeps
            running whatever is currently live.
          </p>
          <p>
            <strong>Apply & Reload PM2</strong> regenerates the ecosystem file
            and then reloads PM2 with that file. Running services are updated to
            match the newly generated config.
          </p>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Why changes stay explicit</h2>
        <p className="text-muted-foreground">
          ControlDeck does not auto-apply or auto-restart anything. Edits remain
          in MongoDB until you choose to push them. This protects running
          tenants from accidental restarts and keeps operational control in the
          hands of the operator.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Read-only mode</h2>
        <p className="text-muted-foreground">
          When read-only mode is enabled, configuration edits and applies are
          blocked. The UI remains view-only; you can still inspect services and
          status, but no write actions will execute until read-only mode is
          disabled.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Safety philosophy</h2>
        <p className="text-muted-foreground">
          The platform favors calm, deliberate operations: no background workers
          making changes, no surprise restarts, and clear confirmation for
          impactful actions. Keep Apply and Apply & Reload PM2 explicit, review
          drift before reloading, and treat the ecosystem path as a controlled
          interface to PM2.
        </p>
      </section>
    </div>
  );
}
