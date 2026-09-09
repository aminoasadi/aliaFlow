import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { AppSidebar } from "@/components/admin/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import "../admin.css";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/admin/login");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/admin/login");

  return (
    <SidebarProvider className="admin-shell">
      <AppSidebar adminEmail={user.email} adminName={user.name} />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger />
          <div className="h-4 w-px bg-border" />
          <Badge variant="outline" className="gap-1.5 font-normal"><span className="size-1.5 rounded-full bg-emerald-500" /> Website live</Badge>
          <Button asChild variant="ghost" size="sm" className="ml-auto"><Link href="/" target="_blank">View site <ExternalLink /></Link></Button>
        </header>
        <main className="admin-main flex-1">{children}</main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
