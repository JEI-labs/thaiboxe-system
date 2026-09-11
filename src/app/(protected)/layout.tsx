import { BreadcrumbContainer } from '@/components/layout/BreadcrumbContainer';
import { UserProfileContainer } from '@/components/layout/UserProfileContainer';
import { SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebarProvider from '@/providers/sidebarProvider';

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppSidebarProvider>
      <div className="bg-background flex h-full w-full flex-col md:px-8">
        <div className="min-h-[calc(100vh-2rem)]">
          <div className="bg-muted/40 flex items-center justify-between border-b px-4 py-2 md:mt-6 md:rounded-md md:border md:px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="hidden md:flex">
                <BreadcrumbContainer />
              </div>
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
