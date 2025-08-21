"use client";

import { Home, Image } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Streams",
    url: "/streams",
    icon: Image,
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="bg-gradient-to-b from-[#e0e7ff] to-[#f8f9fc] shadow-lg border-r border-gray-200">
      <SidebarContent>
        <SidebarHeader className="flex items-center justify-center py-6">
          <span className="text-2xl font-bold text-indigo-600 tracking-tight">
            Moderation Tool
          </span>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-indigo-100 hover:text-indigo-700 transition-colors rounded-lg px-3 py-2 flex items-center gap-3"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
