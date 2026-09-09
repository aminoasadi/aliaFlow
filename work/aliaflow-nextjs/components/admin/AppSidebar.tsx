"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Activity, ExternalLink, FileText, ImageIcon, LayoutDashboard, LogOut, Settings, Users } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

const navigation = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Media library", href: "/admin/media", icon: ImageIcon },
]
const management = [
  { label: "Activity", href: "/admin/activity", icon: Activity },
  { label: "Team", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

export function AppSidebar({ adminEmail, adminName }: { adminEmail: string; adminName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname.startsWith(href)
  async function handleLogout() { await fetch("/api/auth/logout", { method: "POST" }); router.replace("/admin/login"); router.refresh() }
  function NavItems({ items }: { items: typeof navigation }) {
    return items.map((item) => <SidebarMenuItem key={item.href}><SidebarMenuButton asChild isActive={isActive(item.href, item.exact)} tooltip={item.label}><Link href={item.href}><item.icon /><span>{item.label}</span></Link></SidebarMenuButton></SidebarMenuItem>)
  }
  return <Sidebar collapsible="icon" variant="sidebar">
    <SidebarHeader className="border-b border-sidebar-border px-3 py-3"><Link href="/admin" className="flex h-9 items-center gap-3 overflow-hidden px-1 no-underline"><span className="grid size-8 shrink-0 place-items-center rounded-md bg-sidebar-primary text-xs font-black tracking-tighter text-sidebar-primary-foreground">AF</span><span className="min-w-0 leading-tight"><b className="block truncate text-sm">Aliaflow</b><small className="block truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Content studio</small></span></Link></SidebarHeader>
    <SidebarContent className="gap-0 py-2">
      <SidebarGroup><SidebarGroupLabel>Workspace</SidebarGroupLabel><SidebarGroupContent><SidebarMenu><NavItems items={navigation} /></SidebarMenu></SidebarGroupContent></SidebarGroup>
      <SidebarGroup><SidebarGroupLabel>Manage</SidebarGroupLabel><SidebarGroupContent><SidebarMenu><NavItems items={management} /></SidebarMenu></SidebarGroupContent></SidebarGroup>
      <SidebarGroup className="mt-auto"><SidebarGroupContent><SidebarMenu><SidebarMenuItem><SidebarMenuButton asChild tooltip="View website"><Link href="/" target="_blank"><ExternalLink /><span>View website</span></Link></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarGroupContent></SidebarGroup>
    </SidebarContent>
    <SidebarFooter className="border-t border-sidebar-border p-2"><SidebarMenu><SidebarMenuItem><DropdownMenu><DropdownMenuTrigger asChild><SidebarMenuButton size="lg"><Avatar size="sm"><AvatarFallback>{adminName.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><span className="min-w-0 flex-1 text-left leading-tight"><b className="block truncate text-xs">{adminName}</b><small className="block truncate text-[10px] text-muted-foreground">{adminEmail}</small></span></SidebarMenuButton></DropdownMenuTrigger><DropdownMenuContent side="top" align="start" className="w-56"><DropdownMenuItem onClick={handleLogout}><LogOut /> Log out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></SidebarMenuItem></SidebarMenu></SidebarFooter>
  </Sidebar>
}
