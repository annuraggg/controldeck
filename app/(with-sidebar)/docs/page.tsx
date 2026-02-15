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
    <div className="gap-6 flex">
      <aside className="rounded-xl border bg-card/95 p-4 shadow-sm lg:sticky lg:top-6 h-full min-w-64">
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

      <article className="space-y-8 rounded-xl border bg-card p-6 shadow-sm h-[78vh] overflow-y-auto">
        <div className="space-y-2 border-b pb-4">
          <h2 className="text-3xl font-semibold">ControlDeck Operating Guide</h2>
          <p className="text-sm text-muted-foreground">
            Enterprise-friendly runbook for safely operating service lifecycle and change control.
          </p>
        </div>

        <section id="overview" className="space-y-2">
          <h3 className="text-xl font-semibold">Overview</h3>
          <p className="text-muted-foreground">
            ControlDeck is a control panel for people who need to keep software services running
            without having to remember complicated command-line workflows. Think of it like a
            &quot;mission control&quot; screen: you define what you want the system to look like, review
            what is currently happening, then decide when to push changes live.
          </p>
          <p className="text-muted-foreground">
            This separation is important. The app stores your <strong>intent</strong> (what you
            want), generates deployment files from that intent (the written instructions your
            server can read), and controls running services separately (what is currently alive on
            the machine). By keeping these layers separate, ControlDeck reduces accidental changes,
            creates clearer approvals, and makes troubleshooting less stressful.
          </p>
          <p className="text-muted-foreground">
            If you are non-technical, here is the simplest mental model:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>
              <strong>Plan:</strong> Fill in service settings and save them.
            </li>
            <li>
              <strong>Compare:</strong> Check whether the live environment matches your plan.
            </li>
            <li>
              <strong>Apply:</strong> Confirm the change so your server follows the latest plan.
            </li>
            <li>
              <strong>Operate:</strong> Start/stop/restart services safely when needed.
            </li>
          </ul>
          <p className="text-muted-foreground">
            Why this matters: when systems grow, small mistakes can cause outages. ControlDeck
            helps teams work in a deliberate, review-first way so each change has a clear reason,
            a clear owner, and a clear result.
          </p>
        </section>

        <section id="architecture" className="space-y-2">
          <h3 className="text-xl font-semibold">Architecture</h3>
          <p className="text-muted-foreground">
            &quot;Architecture&quot; means how all the moving parts are organized. You do not need to be an
            engineer to understand it. Imagine an office with records, instructions, workers, and
            security checks. Each has one job and passes information to the next step.
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>
              <strong>MongoDB:</strong> This is the database, like a digital filing cabinet.
              ControlDeck uses it to store users, roles, settings, and service definitions. It is
              the source-of-truth, meaning this is where official records live.
            </li>
            <li>
              <strong>Service definitions:</strong> A service is an app/process you run (for
              example, a web API, worker, or scheduled task). A definition contains its name,
              command, environment variables, and startup behavior.
            </li>
            <li>
              <strong>Ecosystem config:</strong> A generated file that tells PM2 exactly how to run
              your services. It is generated from the saved records, which lowers human typo risk.
            </li>
            <li>
              <strong>PM2 runtime:</strong> PM2 is the process manager (the service supervisor).
              It keeps apps running, restarts failed processes, and handles start/stop commands.
            </li>
            <li>
              <strong>Metrics snapshotter:</strong> A background collector that stores CPU, memory,
              and system health snapshots over time, so teams can spot trends before problems
              become outages.
            </li>
          </ul>
          <p className="text-muted-foreground">
            Why the generation flow is useful: instead of manually editing operational files,
            ControlDeck builds them from approved data. This makes behavior more repeatable,
            especially when multiple people manage production systems.
          </p>
        </section>

        <section id="drift" className="space-y-2">
          <h3 className="text-xl font-semibold">Drift & Apply</h3>
          <p className="text-muted-foreground">
            <strong>Drift</strong> means the live system no longer matches your saved plan. This
            can happen after manual server edits, partial deployments, or missed reloads.
            ControlDeck checks for this mismatch using a hash (a fingerprint) to compare what is
            running versus what should be running.
          </p>
          <p className="text-muted-foreground">
            <strong>Apply</strong> writes a fresh ecosystem configuration file from your saved
            settings, but does not force an immediate process restart. Use this when you want to
            update deployment instructions first and schedule live restarts later.
          </p>
          <p className="text-muted-foreground">
            <strong>Apply & Reload</strong> does both actions together:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>Regenerates the configuration file from your latest saved intent.</li>
            <li>Instructs PM2 to reload/restart affected services with that new configuration.</li>
            <li>Requires explicit confirmation to reduce accidental production impact.</li>
          </ul>
          <p className="text-muted-foreground">
            A practical non-technical workflow is: save service edits, check drift status, review
            who approved the change, apply when ready, and monitor logs/metrics right after reload.
            This gives you clear checkpoints and safer change windows.
          </p>
        </section>

        <section id="pm2-controls" className="space-y-2">
          <h3 className="text-xl font-semibold">PM2 Controls</h3>
          <p className="text-muted-foreground">
            PM2 controls are the day-to-day operational buttons. They change the live state of
            services but do not edit your stored long-term configuration. In simple terms, these
            controls are like power buttons and reset buttons for running apps.
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>
              <strong>Start:</strong> Launches a service that is currently not running.
            </li>
            <li>
              <strong>Stop:</strong> Gracefully shuts down a running service.
            </li>
            <li>
              <strong>Restart/Reload:</strong> Stops then starts the service so new runtime state or
              code changes can take effect.
            </li>
            <li>
              <strong>Bulk actions:</strong> Applies one command to many services at once, useful
              during maintenance windows.
            </li>
            <li>
              <strong>Logs:</strong> Real-time text output that explains what each service is doing
              and why failures might happen.
            </li>
          </ul>
          <p className="text-muted-foreground">
            Why separate controls from configuration? Because emergency operations (like
            restarting a frozen service) should not silently rewrite official definitions. This
            helps teams recover quickly while preserving audit clarity.
          </p>
        </section>

        <section id="rbac" className="space-y-2">
          <h3 className="text-xl font-semibold">RBAC & Security</h3>
          <p className="text-muted-foreground">
            <strong>RBAC</strong> means Role-Based Access Control. This is a permission system that
            decides who can view, change, or operate parts of the platform. Non-technical summary:
            not everyone gets every button.
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>
              <strong>Admin:</strong> Full authority. Can manage users, roles, platform settings,
              and operational actions.
            </li>
            <li>
              <strong>Operator:</strong> Operational authority. Can run service lifecycle actions
              (start/stop/restart/apply) within assigned scope.
            </li>
            <li>
              <strong>Viewer:</strong> Observation authority. Can see data and status but cannot
              trigger changes.
            </li>
          </ul>
          <p className="text-muted-foreground">
            Security principles behind RBAC:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>
              <strong>Least privilege:</strong> People only receive permissions needed for their
              job.
            </li>
            <li>
              <strong>Accountability:</strong> Sensitive actions can be traced to authenticated
              users.
            </li>
            <li>
              <strong>Separation of duties:</strong> Critical workflows can require different roles
              so one mistake does less damage.
            </li>
          </ul>
          <p className="text-muted-foreground">
            Result: fewer accidental changes, better compliance posture, and clearer governance for
            production systems.
          </p>
        </section>

        <section id="readonly" className="space-y-2">
          <h3 className="text-xl font-semibold">Read-only Mode</h3>
          <p className="text-muted-foreground">
            Read-only mode is a platform-wide safety lock. When enabled, the system allows viewing
            but blocks any action that would change data or service state.
          </p>
          <p className="text-muted-foreground">
            What gets blocked:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>Creating, editing, or deleting service definitions.</li>
            <li>Applying/reloading configuration changes.</li>
            <li>Starting, stopping, or restarting services.</li>
            <li>User and settings modifications.</li>
          </ul>
          <p className="text-muted-foreground">
            How it behaves in practice:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>Buttons and action controls appear disabled in the UI.</li>
            <li>
              Even if someone tries to bypass the UI, backend APIs still reject write attempts.
            </li>
            <li>
              Responses include clear status messages so users understand that lock mode is active.
            </li>
          </ul>
          <p className="text-muted-foreground">
            Common reasons to enable read-only mode include audits, incident stabilization windows,
            freeze periods before major launches, and high-risk maintenance intervals. It is a
            simple but powerful guardrail.
          </p>
        </section>
      </article>
    </div>
  );
}
