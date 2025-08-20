"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isWidgetPage = pathname === "/widget";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f8f9fc]`}
      >
        {isWidgetPage ? (
          <div>{children}</div>
        ) : (
          <SidebarProvider defaultOpen={true}>
            <div className="flex w-full">
              <AppSidebar />
              <main className="flex-1">
                <div className="p-4">
                  <SidebarTrigger />
                </div>
                <div className="w-full mx-auto">{children}</div>
              </main>
            </div>
          </SidebarProvider>
        )}
        <Toaster />
      </body>
    </html>
  );
}
