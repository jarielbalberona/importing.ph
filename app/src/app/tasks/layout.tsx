import { cookies } from "next/headers";

import ReactQueryProvider from "@/providers/react-query";
import { Analytics } from "@/components/analytics";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/ui/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeSwitcher } from "@/components/ui/mode-switcher";

import "@/app/globals.css";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <SidebarProvider defaultOpen={defaultOpen}>
              <AppSidebar />
              <SidebarInset>
                <header className="sticky inset-x-0 top-0 z-10 flex items-center gap-2 bg-background isolate shrink-0">
                  <div className="flex items-center w-full gap-2 px-4 h-14">
                    <SidebarTrigger className="-ml-1.5" />
                    <div className="flex items-center gap-2 ml-auto">
                      <ModeSwitcher />
                    </div>
                  </div>
                </header>
                {children}
              </SidebarInset>
            </SidebarProvider>
            <Toaster />
            <Analytics />
          </ReactQueryProvider>
        </ThemeProvider>
  );
}

export const dynamic = 'force-dynamic'
