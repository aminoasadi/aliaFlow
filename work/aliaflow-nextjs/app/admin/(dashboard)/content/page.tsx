import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { listSectionsMeta } from "@/lib/sections";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function ContentPage() {
  const sections = await listSectionsMeta();
  return <div className="admin-page"><PageHeader kicker="Website content" title="Content" description="Edit every structured section of the public website. Save safely as a draft, then publish when it is ready." actions={<Button asChild variant="outline"><Link href="/" target="_blank">Preview website <ArrowUpRight /></Link></Button>} />
    <Card className="gap-0 py-0"><CardContent className="p-0"><table className="admin-table"><thead><tr><th>Content section</th><th>Status</th><th>Last editor</th><th>Last updated</th><th /></tr></thead><tbody>{sections.map(section=><tr key={section.key}><td><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-md bg-muted"><FileText className="size-4" /></span><div><b>{section.label}</b><small className="block text-muted-foreground">{section.key}</small></div></div></td><td><StatusBadge status={section.status} /></td><td className="text-muted-foreground">{section.updatedBy ?? "—"}</td><td className="text-muted-foreground">{section.updatedAt.getTime() ? section.updatedAt.toLocaleDateString("en-GB") : "—"}</td><td className="text-right"><Button asChild size="sm" variant="outline"><Link href={`/admin/sections/${section.key}`}>Open editor</Link></Button></td></tr>)}</tbody></table></CardContent></Card>
  </div>;
}
