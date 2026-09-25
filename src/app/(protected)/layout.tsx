import { BreadcrumbContainer } from '@/components/layout/BreadcrumbContainer';
import { UserProfileContainer } from '@/components/layout/UserProfileContainer';
import { ThemeToggler } from '@/components/theme/theme-toggler';
import { SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebarProvider from '@/providers/sidebarProvider';

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppSidebarProvider>
      <div className="bg-background flex h-full w-full flex-col md:px-8">
        <div className="min-h-[calc(100vh-2rem)]">
          <div className="bg-card shadow-card flex items-center justify-between px-4 py-3 md:mt-6 md:rounded-2xl md:px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="hidden md:flex">
                <BreadcrumbContainer />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggler />
              <UserProfileContainer />
            </div>
          </div>
          {/* pb-10: sem isso o último elemento de qualquer página encosta
                no fim da viewport */}
          <div className="mt-6 flex justify-center pb-10 max-md:px-6">
            {children}
          </div>
        </div>
      </div>
    </AppSidebarProvider>
  );
}
