import { BreadcrumbContainer } from '@/components/layout/BreadcrumbContainer';
import { UserProfileContainer } from '@/components/layout/UserProfileContainer';
import { SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebarProvider from '@/providers/sidebarProvider';

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppSidebarProvider>
      <div className="flex h-full w-full flex-col bg-background md:px-8">
        <div className="min-h-[calc(100vh-2rem)]">
          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2 md:mt-6 md:rounded-md md:border md:px-6">
            <div className="flex md:hidden">
              <SidebarTrigger />
            </div>
            <div className="hidden md:flex">
              <BreadcrumbContainer />
            </div>
            <div className="flex items-center">
              <UserProfileContainer />
            </div>
          </div>
          <div className="mt-6 flex justify-center max-md:px-6">{children}</div>
        </div>
      </div>
    </AppSidebarProvider>
  );
}
