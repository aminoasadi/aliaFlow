import Link from "next/link";
import { ArrowRight, FileText, ImageIcon, Plus, Sparkles } from "lucide-react";
import { listSectionsMeta } from "@/lib/sections";
import { listUploadedFiles } from "@/lib/media";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";

function relative(date: Date) { const mins=Math.max(0,Math.round((Date.now()-date.getTime())/60000)); if(mins<1)return "Just now"; if(mins<60)return `${mins} min ago`; const hrs=Math.round(mins/60); if(hrs<24)return `${hrs} hr ago`; return `${Math.round(hrs/24)} days ago`; }

export default async function AdminDashboardPage() {
  const [sections, media, activity] = await Promise.all([
    listSectionsMeta(), listUploadedFiles(), prisma.activity.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  const drafts = sections.filter((section) => section.status === "draft").length;
  const recent = [...sections].sort((a,b) => b.updatedAt.getTime()-a.updatedAt.getTime()).slice(0,6);
  return <div className="admin-page">
    <PageHeader kicker="Editorial workspace" title="Good to see you." description="Everything that shapes the Aliaflow website, in one calm publishing workspace." actions={<Button asChild><Link href="/admin/content"><Plus /> Edit content</Link></Button>} />
    <Card className="overflow-hidden border-0 bg-[#17191d] text-white shadow-sm">
      <CardContent className="grid gap-6 p-0 md:grid-cols-[1fr_auto]">
        <div className="p-7"><div className="mb-12 flex size-9 items-center justify-center rounded-md bg-white/10"><Sparkles className="size-4" /></div><p className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-blue-300">Publishing pulse</p><h2 className="m-0 max-w-xl text-2xl font-semibold tracking-tight">{drafts ? `${drafts} section${drafts===1?" is":"s are"} waiting to be published.` : "Your website content is fully published."}</h2><p className="mb-0 mt-3 text-sm text-white/60">Drafts never affect the live website until you explicitly publish them.</p></div>
        <div className="grid grid-cols-3 border-t border-white/10 md:w-[360px] md:grid-cols-1 md:border-l md:border-t-0">
          <div className="p-5"><b className="block text-2xl">{sections.length}</b><span className="text-xs text-white/55">Content sections</span></div>
          <div className="border-l border-white/10 p-5 md:border-l-0 md:border-t"><b className="block text-2xl">{drafts}</b><span className="text-xs text-white/55">Open drafts</span></div>
          <div className="border-l border-white/10 p-5 md:border-l-0 md:border-t"><b className="block text-2xl">{media.length}</b><span className="text-xs text-white/55">Media files</span></div>
        </div>
      </CardContent>
    </Card>
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="gap-0 py-0"><CardHeader className="flex-row items-center justify-between border-b py-5"><div><CardTitle>Recently edited</CardTitle><CardDescription className="mt-1">Your most recently touched content</CardDescription></div><Button asChild variant="ghost" size="sm"><Link href="/admin/content">All content <ArrowRight /></Link></Button></CardHeader><CardContent className="p-0"><table className="admin-table"><thead><tr><th>Section</th><th>Status</th><th>Updated</th><th /></tr></thead><tbody>{recent.map((section)=><tr key={section.key}><td><b>{section.label}</b><small className="mt-0.5 block text-muted-foreground">/{section.key}</small></td><td><StatusBadge status={section.status} /></td><td className="text-sm text-muted-foreground">{relative(section.updatedAt)}</td><td className="text-right"><Button asChild variant="ghost" size="sm"><Link href={`/admin/sections/${section.key}`}>Edit</Link></Button></td></tr>)}</tbody></table></CardContent></Card>
      <div className="grid gap-5"><Card><CardHeader><CardTitle>Quick actions</CardTitle><CardDescription>Common tasks, one click away.</CardDescription></CardHeader><CardContent className="grid gap-2"><Button asChild variant="outline" className="justify-start"><Link href="/admin/content"><FileText /> Browse content</Link></Button><Button asChild variant="outline" className="justify-start"><Link href="/admin/media"><ImageIcon /> Upload media</Link></Button></CardContent></Card><Card><CardHeader><CardTitle>Latest activity</CardTitle></CardHeader><CardContent className="grid gap-4">{activity.length ? activity.map(item=><div key={item.id} className="flex gap-3"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" /><div><p className="m-0 text-sm"><b>{item.action}</b> {item.entityKey}</p><small className="text-muted-foreground">{item.actorEmail ?? "System"} · {relative(item.createdAt)}</small></div></div>) : <p className="m-0 text-sm text-muted-foreground">Activity will appear after your first edit.</p>}</CardContent></Card></div>
    </div>
  </div>;
}
