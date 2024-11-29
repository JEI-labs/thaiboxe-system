import { Suspense } from "react";
import { Footer } from "@/components/footer/footer.component";
import { Header } from "@/components/header/header.component";
import { SidebarMobile } from "@/components/layout/sidebarMobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/layout/sidebar";
import { BreadcrumbContainer } from "@/components/layout/BreadcrumbContainer";
import { UserProfileContainer } from "@/components/layout/UserProfileContainer";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen w-screen flex-col bg-muted/40 lg:grid lg:grid-cols-[200px_auto]">
      <ScrollArea className="hidden h-screen w-full lg:flex">
        <Suspense fallback={"Loading..."}>
          <Sidebar />
        </Suspense>
      </ScrollArea>
      <ScrollArea>
        <div className="min-h-screen bg-background lg:mx-2 lg:my-4 lg:rounded-xl lg:border">
          <div className="mb-4 flex items-center justify-between border-b bg-muted/40 px-4 py-2 lg:m-4 lg:mb-0 lg:rounded-lg lg:border lg:px-6">
            <div className="flex lg:hidden">
              <SidebarMobile />
            </div>
            <div className="hidden lg:flex">
              <BreadcrumbContainer />
            </div>
            <div className="flex items-center">
              {/* <AccountBalance /> */}
              {/* <Separator orientation="vertical" className="mx-4 h-6" /> */}
              <UserProfileContainer />
            </div>
          </div>
          <div className="flex justify-center px-4 py-6 lg:px-6">
            {children}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
