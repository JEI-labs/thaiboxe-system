import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AppSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="bg-background">
      <AppSidebar />
      {children}
    </SidebarProvider>
  );
}
