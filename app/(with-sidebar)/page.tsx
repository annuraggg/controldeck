import Link from "next/link";
import { ArrowRight, BookOpen, Settings2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const quickLinks = [
  {
    href: "/services",
    title: "Service Catalog",
    description: "Manage service config, runtime controls, and deployment intent.",
    icon: Settings2,
  },
  {
    href: "/users",
    title: "Access Management",
    description: "Control user roles, credentials, and service scopes.",
    icon: Users,
  },
  {
    href: "/docs",
    title: "Operations Docs",
    description: "Review runbooks, security model, and change control process.",
    icon: BookOpen,
  },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <Badge className="mb-3" variant="secondary">Enterprise Control Plane</Badge>
        <h2 className="text-3xl font-semibold">Welcome to ControlDeck</h2>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Operate PM2 with clean separation between desired configuration, runtime actions, and
          access governance.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-xl border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <item.icon className="mb-3 h-5 w-5 text-primary" />
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
