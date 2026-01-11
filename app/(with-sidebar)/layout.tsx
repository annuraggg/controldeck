import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReadOnlyBanner } from "@/components/read-only-banner";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-7">
        <ReadOnlyBanner />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
