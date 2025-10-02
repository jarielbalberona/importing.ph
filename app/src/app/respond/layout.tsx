import ReactQueryProvider from "@/providers/react-query";
import { Analytics } from "@/components/analytics";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import {ModeSwitcher} from "@/components/ui/mode-switcher"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ReactQueryProvider>
        <div className="flex justify-center w-full mx-auto my-4">
          <ModeSwitcher />
        </div>
        {children}
        <Toaster />
        <Analytics />
      </ReactQueryProvider>
    </ThemeProvider>
  );
}

export const dynamic = 'force-dynamic'
