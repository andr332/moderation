"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "sonner";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isWidgetPage = pathname === "/widget";

  if (isWidgetPage) {
    return <div>{children}</div>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full min-h-screen">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
            <div className="flex items-center justify-between p-4 lg:p-6">
              <SidebarTrigger />
            </div>
          </div>
          <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
      <Toaster position="bottom-right" />
    </SidebarProvider>
  );
}
