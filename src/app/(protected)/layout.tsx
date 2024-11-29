import { Suspense } from "react";
import { Footer } from "~/components/footer/footer.component";
import { Header } from "~/components/header/header.component";
import { SidebarMobile } from "~/components/layout/sidebarMobile";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Sidebar, SidebarProvider } from "~/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-col">
      <div className="flex w-full items-center justify-between pt-2">
        <div className="flex lg:hidden">
          <SidebarMobile />
        </div>
        <div className="flex items-center gap-4">
          <ScrollArea className="hidden lg:flex">
            <Suspense fallback={"Loading..."}>
              <SidebarProvider>
                <Sidebar />
              </SidebarProvider>
            </Suspense>
          </ScrollArea>
        </div>
        <Header />
      </div>
      <div className="flex justify-center">{children}</div>
      <Footer />
    </div>
  );
}
