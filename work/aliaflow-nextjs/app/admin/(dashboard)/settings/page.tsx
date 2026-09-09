import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function SettingsPage(){const rows=await prisma.setting.findMany();const settings=Object.fromEntries(rows.map(row=>[row.key,row.value]));return <div className="admin-page"><PageHeader kicker="Workspace configuration" title="Settings" description="Core identity, locale and publishing defaults for the Aliaflow website."/><Card className="max-w-3xl"><CardHeader><CardTitle>General</CardTitle><CardDescription>These values describe the site and how content dates are presented.</CardDescription></CardHeader><CardContent><SettingsForm initial={settings}/></CardContent></Card></div>}
