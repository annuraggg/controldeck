const sections = [
  { id: "overview", title: "Overview" },
  { id: "architecture", title: "Architecture" },
  { id: "drift", title: "Drift & Apply" },
  { id: "pm2-controls", title: "PM2 Controls" },
  { id: "rbac", title: "RBAC & Security" },
  { id: "readonly", title: "Read-only mode" },
];

export default function DocsPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
      <div className="rounded-xl border bg-background/50 p-4 shadow-sm lg:sticky lg:top-24 h-fit">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Docs</p>
        <ul className="mt-3 space-y-2 text-sm">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="flex items-center gap-2 rounded-md px-2 py-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary/80" />
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-10 rounded-xl border bg-background p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">ControlDeck Docs</h1>
          <p className="text-sm text-muted-foreground">
            Practical guidance for operators running PM2 under enterprise guardrails.
          </p>
        </div>

        <section id="overview" className="space-y-3">
          <h2 className="text-xl font-semibold">Overview</h2>
          <p className="text-muted-foreground">
            ControlDeck is a single-server control plane for PM2. Desired intent lives in
            MongoDB, is rendered into an ecosystem file on demand, and is only pushed to PM2
            when an operator explicitly applies. Live controls stay deliberate and scoped by RBAC.
          </p>
        </section>

        <section id="architecture" className="space-y-3">
          <h2 className="text-xl font-semibold">Architecture</h2>
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              <strong>Intent store (MongoDB):</strong> canonical data for services, settings, and
              user accounts.
            </li>
            <li>
              <strong>Generated ecosystem:</strong> written to the configured path when you apply.
              It mirrors intent but is never mutated implicitly.
            </li>
            <li>
              <strong>PM2 runtime:</strong> processes currently running. Runtime controls do not
              change stored intent.
            </li>
            <li>
              <strong>Metrics sampler:</strong> background cron captures CPU and memory every 30s
              with a 24h TTL for historical views.
            </li>
          </ul>
        </section>

        <section id="drift" className="space-y-3">
          <h2 className="text-xl font-semibold">Drift & Apply</h2>
          <p className="text-muted-foreground">
            Drift highlights when the last applied hash no longer matches stored intent. Apply
            regenerates the ecosystem file only; Apply & Reload PM2 regenerates and reloads the
            runtime. Neither action is automated to keep change control explicit.
          </p>
        </section>

        <section id="pm2-controls" className="space-y-3">
          <h2 className="text-xl font-semibold">PM2 Controls</h2>
          <p className="text-muted-foreground">
            Start/stop/restart target the PM2 runtime for the scoped service. They respect service
            permissions, per-service scopes, and read-only mode. Bulk controls follow the same
            guardrails.
          </p>
        </section>

        <section id="rbac" className="space-y-3">
          <h2 className="text-xl font-semibold">RBAC & Security</h2>
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Admins have full access and can create users.</li>
            <li>Operators can manage services and runtime within their service scopes.</li>
            <li>Viewers are read-only across assigned scopes.</li>
            <li>
              Sessions are cookie-based; passwords are stored with bcrypt; every API checks role,
              permission, and scope.
            </li>
          </ul>
        </section>

        <section id="readonly" className="space-y-3">
          <h2 className="text-xl font-semibold">Read-only mode</h2>
          <p className="text-muted-foreground">
            Enabling read-only forces all write actions to short-circuit—service edits, PM2
            runtime controls, applies, and user management. UI buttons will disable and backend
            APIs enforce the lock until read-only is turned off.
          </p>
        </section>
      </div>
    </div>
  );
}
