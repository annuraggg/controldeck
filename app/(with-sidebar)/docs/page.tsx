import { BookText, Lock, Radar, Rocket, ServerCog, Shield } from "lucide-react";

const sections = [
  { id: "overview", title: "Overview", icon: BookText },
  { id: "architecture", title: "Architecture", icon: ServerCog },
  { id: "drift", title: "Drift & Apply", icon: Radar },
  { id: "pm2-controls", title: "PM2 Controls", icon: Rocket },
  { id: "rbac", title: "RBAC & Security", icon: Shield },
  { id: "readonly", title: "Read-only Mode", icon: Lock },
];

export default function DocsPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px,minmax(0,1fr)]">
      <aside className="h-fit rounded-xl border bg-card/95 p-4 shadow-sm lg:sticky lg:top-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Documentation Index
        </p>
        <nav className="mt-3 space-y-1.5">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              <section.icon className="h-4 w-4" />
              {section.title}
            </a>
          ))}
        </nav>
      </aside>

      <article className="space-y-8 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-2 border-b pb-4">
          <h2 className="text-3xl font-semibold">ControlDeck Operating Guide</h2>
          <p className="text-sm text-muted-foreground">
            Enterprise-friendly runbook for safely operating service lifecycle and change control.
          </p>
        </div>

        <section id="overview" className="space-y-2">
          <h3 className="text-xl font-semibold">Overview</h3>
          <p className="text-muted-foreground">
            ControlDeck separates desired state, generated deployment configuration, and runtime
            process controls. Operators explicitly apply changes and can audit drift at any point.
          </p>
        </section>

        <section id="architecture" className="space-y-2">
          <h3 className="text-xl font-semibold">Architecture</h3>
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>MongoDB stores source-of-truth settings, users, and services.</li>
            <li>Ecosystem config is generated on demand from intent.</li>
            <li>PM2 runtime actions remain isolated from config persistence.</li>
            <li>Metrics snapshotter stores system history for trend analysis.</li>
          </ul>
        </section>

        <section id="drift" className="space-y-2">
          <h3 className="text-xl font-semibold">Drift & Apply</h3>
          <p className="text-muted-foreground">
            Drift indicates applied configuration hash mismatch. Apply updates the ecosystem file;
            Apply & Reload updates both file and PM2 runtime with explicit operator confirmation.
          </p>
        </section>

        <section id="pm2-controls" className="space-y-2">
          <h3 className="text-xl font-semibold">PM2 Controls</h3>
          <p className="text-muted-foreground">
            Start, stop, restart, and bulk actions are permission-scoped and respect read-only
            mode. Runtime actions do not rewrite configuration intent.
          </p>
        </section>

        <section id="rbac" className="space-y-2">
          <h3 className="text-xl font-semibold">RBAC & Security</h3>
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>Admin: full access, including user and settings management.</li>
            <li>Operator: service lifecycle and scoped operations.</li>
            <li>Viewer: read-only visibility across assigned scopes.</li>
          </ul>
        </section>

        <section id="readonly" className="space-y-2">
          <h3 className="text-xl font-semibold">Read-only Mode</h3>
          <p className="text-muted-foreground">
            Read-only mode blocks all mutating API operations. UI controls are disabled and backend
            requests are rejected with clear status messages.
          </p>
        </section>
      </article>
    </div>
  );
}
