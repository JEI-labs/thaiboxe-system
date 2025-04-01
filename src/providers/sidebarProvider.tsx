import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default function AppSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="bg-background">
      <AppSidebar />
      <SidebarTrigger className="p-6 max-sm:hidden" />
      {children}
    </SidebarProvider>
  );
}
