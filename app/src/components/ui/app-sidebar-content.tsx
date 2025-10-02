"use client";

import * as React from "react";
import Image from "next/image";
import { useSidebar } from "@/components/ui/sidebar";
import { NavUser } from "@/components/ui/nav-user";

import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useProfile } from "@/hooks/react-queries/auth";
import Link from "next/link";
interface AppSidebarContentProps {
  data?: any;
}

export function AppSidebarContent({ data }: AppSidebarContentProps) {
  const { state } = useSidebar();
  const { data: profile } = useProfile(data);
  return (
    <div className="transition-all duration-300 ease-in-out">
      <SidebarHeader className="transition-all duration-300 ease-in-out">
        <Link href="/tasks">
          {state === "expanded" ? (
            <Image
              src="/images/lbta-app.png"
              alt="Image"
              className="object-cover transition-all duration-300 ease-in-out rounded-md"
              width={300}
              height={50}
            />
          ) : (
            <Image
              src="/images/lbta-app-min.png"
              alt="App Icon"
              className="object-cover transition-all duration-300 ease-in-out rounded-md"
              width={30}
              height={10}
            />
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent className="transition-all duration-300 ease-in-out">
        <SidebarGroup>
          <SidebarMenu>{/* TODO: add navigation items */}</SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="transition-all duration-300 ease-in-out">
        <NavUser initialData={profile || null} />
      </SidebarFooter>
      <SidebarRail />
    </div>
  );
}
