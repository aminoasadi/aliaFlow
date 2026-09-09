import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const live = status === "published";
  return <Badge variant="outline" className={live ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}><span className={live ? "size-1.5 rounded-full bg-emerald-500" : "size-1.5 rounded-full bg-amber-500"} />{live ? "Published" : status === "draft" ? "Draft" : "Not configured"}</Badge>;
}
