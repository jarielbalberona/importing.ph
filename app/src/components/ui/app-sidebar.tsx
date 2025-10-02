import * as React from "react";
import { cookies } from "next/headers";
import { getMeAPI } from "@/api/auth";

import { Sidebar } from "@/components/ui/sidebar";
import { AppSidebarContent } from "./app-sidebar-content";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const cookieStore = await cookies();
  const data = await getMeAPI(undefined, {
    Cookie: await cookieStore.toString(),
  });
  if (!data) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <AppSidebarContent data={data || null} />
      </Sidebar>
    );
  } else {
    return (
      <Sidebar collapsible="icon" {...props}>
        <AppSidebarContent data={null} />
      </Sidebar>
    );
  }
}
