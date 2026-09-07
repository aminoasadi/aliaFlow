import type { ReactNode } from "react";
import Link from "next/link";
import { Toaster } from "sonner";
import { sectionSchemas } from "../../../lib/sections.schema";
import { LogoutButton } from "../../../components/admin/LogoutButton";
import "../admin.css";

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white p-4">
        <p className="mb-4 text-sm font-semibold text-slate-500">Aliaflow CMS</p>
        <nav className="space-y-1">
          {Object.entries(sectionSchemas).map(([key, schema]) => (
            <Link
              key={key}
              href={`/admin/sections/${key}`}
              className="block rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              {schema.label}
            </Link>
          ))}
        </nav>
        <LogoutButton />
      </aside>
      <main className="flex-1 p-8">{children}</main>
      <Toaster />
    </div>
  );
}
