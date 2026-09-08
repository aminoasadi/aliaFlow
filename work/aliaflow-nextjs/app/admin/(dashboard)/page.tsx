import Link from "next/link";
import { listSectionsMeta } from "@/lib/sections";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatRelativeTime(date: Date): string {
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export default async function AdminDashboardPage() {
  const sections = await listSectionsMeta();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Aliaflow CMS</h1>
        <p className="text-muted-foreground">
          Edit any section&apos;s text and images below, or manage uploaded images in the Media Library.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle>{section.label}</CardTitle>
              <CardDescription>Last edited {formatRelativeTime(section.updatedAt)}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/sections/${section.key}`}>Edit</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
