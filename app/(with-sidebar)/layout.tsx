import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReadOnlyBanner } from "@/components/read-only-banner";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-muted/40">
        <div className="mx-auto w-full space-y-6 py-8 px-8">
          <ReadOnlyBanner />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
