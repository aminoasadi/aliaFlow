import { ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function UsersPage() { const users=await prisma.user.findMany({orderBy:{createdAt:"asc"}}); return <div className="admin-page"><PageHeader kicker="Access control" title="Team" description="People who can access the Aliaflow content workspace and their permission level." /><Card className="gap-0 py-0"><CardContent className="p-0"><table className="admin-table"><thead><tr><th>Member</th><th>Role</th><th>Status</th><th>Last sign in</th></tr></thead><tbody>{users.map(user=><tr key={user.id}><td><b>{user.name}</b><small className="block text-muted-foreground">{user.email}</small></td><td><span className="flex items-center gap-2 capitalize"><ShieldCheck className="size-4 text-primary" />{user.role}</span></td><td><Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">{user.status}</Badge></td><td className="text-muted-foreground">{user.lastLoginAt?.toLocaleString("en-GB")??"Never"}</td></tr>)}</tbody></table></CardContent></Card><p className="m-0 text-xs text-muted-foreground">New team members are provisioned by an administrator to keep access controlled.</p></div>; }
