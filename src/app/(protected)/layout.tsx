import { ScrollArea } from '@/components/ui/scroll-area';
import { AppSidebar } from '@/components/layout/sidebar';
import { BreadcrumbContainer } from '@/components/layout/BreadcrumbContainer';
import { UserProfileContainer } from '@/components/layout/UserProfileContainer';
import { SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebarProvider from '@/providers/sidebarProvider';

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppSidebarProvider>
      <div className="flex h-full w-full flex-col bg-background">
        <ScrollArea className="hidden h-full w-full lg:flex">
          <AppSidebar />
        </ScrollArea>
        <ScrollArea>
          <div className="min-h-[calc(100vh-2rem)]">
            <div className="mb-4 flex items-center justify-between border-b bg-muted/40 px-4 py-2 lg:m-4 lg:mb-0 lg:rounded-lg lg:border lg:px-6">
              <div className="flex lg:hidden">
                <SidebarTrigger />
              </div>
              <div className="hidden lg:flex">
                <BreadcrumbContainer />
              </div>
              <div className="flex items-center">
                <UserProfileContainer />
              </div>
            </div>
            <div className="flex justify-center px-4 py-6 lg:px-6">
              {children}
            </div>
          </div>
        </ScrollArea>
      </div>
    </AppSidebarProvider>
  );
}
