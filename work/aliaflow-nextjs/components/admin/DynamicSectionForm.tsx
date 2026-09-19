"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Clock3,
  ExternalLink,
  GripVertical,
  ImagePlus,
  Plus,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { FieldSchema, SectionSchema } from "@/lib/section-validation";
import type { LocalizedSectionData, SiteLocale } from "@/lib/locales";

type Revision = { id: string; action: string; actorEmail: string | null; createdAt: string };

function emptyValueFor(field: FieldSchema): unknown {
  return field.type === "list" ? [] : "";
}

function FieldHelp({ id, children }: { id: string; children?: string }) {
  return children ? <p id={id} className="m-0 text-xs text-muted-foreground">{children}</p> : null;
}

function ImageField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/media", { method: "POST", body: formData });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Upload failed");
      onChange(json.path);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={inputId}>{label}</Label>
      <FieldHelp id={helpId}>{description}</FieldHelp>
      <label
        htmlFor={inputId}
        className="group relative grid min-h-36 cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed border-input bg-muted/40 transition-colors hover:border-primary hover:bg-accent/40 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20"
        aria-busy={uploading}
      >
        {value ? (
          <img src={value} alt="" className="h-44 w-full object-contain" />
        ) : (
          <span className="grid justify-items-center gap-2 p-6 text-center text-sm text-muted-foreground">
            <ImagePlus className="size-5" aria-hidden="true" />
            {uploading ? "Uploading image…" : "Choose an image"}
            <small>PNG, JPG, GIF or WebP · max 5 MB</small>
          </span>
        )}
        <Input
          id={inputId}
          className="sr-only"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          disabled={uploading}
          aria-describedby={description ? helpId : undefined}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />
      </label>
      {value ? (
        <div className="flex gap-2">
          <Input value={value} onChange={(event) => onChange(event.target.value)} aria-label={`${label} path`} />
          <Button type="button" variant="outline" onClick={() => onChange("")}>Clear</Button>
        </div>
      ) : null}
    </div>
  );
}

function FieldEditor({ field, value, onChange }: { field: FieldSchema; value: unknown; onChange: (next: unknown) => void }) {
  const inputId = useId();
  const helpId = `${inputId}-help`;

  if (field.type === "text") {
    return (
      <div className="grid gap-2">
        <Label htmlFor={inputId}>{field.label}</Label>
        <FieldHelp id={helpId}>{field.description}</FieldHelp>
        <Input id={inputId} value={(value as string) ?? ""} aria-describedby={field.description ? helpId : undefined} onChange={(event) => onChange(event.target.value)} />
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="grid gap-2">
        <Label htmlFor={inputId}>{field.label}</Label>
        <FieldHelp id={helpId}>{field.description}</FieldHelp>
        <Textarea id={inputId} rows={5} value={(value as string) ?? ""} aria-describedby={field.description ? helpId : undefined} onChange={(event) => onChange(event.target.value)} />
      </div>
    );
  }

  if (field.type === "image") {
    return <ImageField label={field.label} description={field.description} value={(value as string) ?? ""} onChange={onChange} />;
  }

  const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
  const updateItem = (index: number, key: string, next: unknown) => onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: next } : item));
  const addItem = () => {
    const blank: Record<string, unknown> = {};
    for (const [key, subField] of Object.entries(field.fields)) blank[key] = emptyValueFor(subField);
    onChange([...items, blank]);
  };
  const removeItem = (index: number) => onChange(items.filter((_, itemIndex) => itemIndex !== index));
  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <section className="grid gap-3" aria-labelledby={`${inputId}-title`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <Label id={`${inputId}-title`} className="text-sm font-semibold">{field.label}</Label>
          <FieldHelp id={helpId}>{field.description}</FieldHelp>
        </div>
        <Badge variant="secondary">{items.length} {items.length === 1 ? "item" : "items"}</Badge>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-7 text-center text-sm text-muted-foreground">
          No {field.itemLabel.toLowerCase()} items yet.
        </div>
      ) : null}

      {items.map((item, index) => {
        const itemName = Object.values(item).find((entry) => typeof entry === "string" && entry.trim());
        return (
          <Card key={index} className="gap-0 py-0 shadow-none">
            <CardHeader className="flex-row items-center gap-3 border-b px-4 py-3">
              <GripVertical className="size-4 text-muted-foreground" aria-hidden="true" />
              <CardTitle className="text-sm">
                {field.itemLabel} {index + 1}
                {typeof itemName === "string" ? <span className="ml-2 font-normal text-muted-foreground">· {itemName}</span> : null}
              </CardTitle>
              <div className="ml-auto flex gap-1">
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => moveItem(index, -1)} disabled={index === 0} aria-label={`Move ${field.itemLabel} ${index + 1} up`}><ArrowUp aria-hidden="true" /></Button>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} aria-label={`Move ${field.itemLabel} ${index + 1} down`}><ArrowDown aria-hidden="true" /></Button>
                <Button type="button" variant="ghost" size="icon-sm" className="text-destructive" onClick={() => removeItem(index)} aria-label={`Remove ${field.itemLabel} ${index + 1}`}><Trash2 aria-hidden="true" /></Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5 p-4">
              {Object.entries(field.fields).map(([key, subField]) => <FieldEditor key={key} field={subField} value={item[key]} onChange={(next) => updateItem(index, key, next)} />)}
            </CardContent>
          </Card>
        );
      })}

      <Button type="button" variant="outline" className="justify-self-start" onClick={addItem}><Plus aria-hidden="true" /> Add {field.itemLabel}</Button>
    </section>
  );
}

export function DynamicSectionForm({
  sectionKey,
  schema,
  initialData,
  status,
  updatedAt,
  updatedBy,
  revisions,
}: {
  sectionKey: string;
  schema: SectionSchema;
  initialData: LocalizedSectionData;
  status: string;
  updatedAt: string;
  updatedBy: string | null;
  revisions: Revision[];
}) {
  const [data, setData] = useState(initialData);
  const [activeLocale, setActiveLocale] = useState<SiteLocale>("en");
  const [saving, setSaving] = useState<"save" | "publish" | null>(null);
  const router = useRouter();
  const dirty = useMemo(() => JSON.stringify(data) !== JSON.stringify(initialData), [data, initialData]);
  const updateField = (key: string, next: unknown) => setData((previous) => ({
    ...previous,
    [activeLocale]: { ...previous[activeLocale], [key]: next },
  }));

  async function submit(intent: "save" | "publish") {
    setSaving(intent);
    try {
      const response = await fetch(`/api/sections/${sectionKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, intent }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Save failed");
      toast.success(intent === "publish" ? "Published to the live website" : "Draft saved");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3"><Link href="/admin/content"><ArrowLeft aria-hidden="true" /> All content</Link></Button>
          <p className="admin-kicker">Section editor</p>
          <h1 className="admin-title">{schema.label}</h1>
          <p className="admin-description">Update structured fields without touching the website code.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" onClick={() => submit("save")} disabled={Boolean(saving) || !dirty}><Save aria-hidden="true" />{saving === "save" ? "Saving…" : "Save draft"}</Button>
          <Button onClick={() => submit("publish")} disabled={Boolean(saving)}><Send aria-hidden="true" />{saving === "publish" ? "Publishing…" : "Publish"}</Button>
        </div>
      </header>

      <div className="editor-grid">
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div><CardTitle>Content fields</CardTitle><CardDescription>English and Persian are saved and published together.</CardDescription></div>
              <div className="flex rounded-lg border border-border bg-muted/30 p-1" role="tablist" aria-label="Content language">
                <Button type="button" size="sm" variant={activeLocale === "en" ? "default" : "ghost"} role="tab" aria-selected={activeLocale === "en"} onClick={() => setActiveLocale("en")}>English</Button>
                <Button type="button" size="sm" variant={activeLocale === "fa" ? "default" : "ghost"} role="tab" aria-selected={activeLocale === "fa"} onClick={() => setActiveLocale("fa")}>فارسی</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent dir={activeLocale === "fa" ? "rtl" : "ltr"} lang={activeLocale} className="grid gap-7 py-6">{Object.entries(schema.fields).map(([key, field]) => <FieldEditor key={`${activeLocale}-${key}`} field={field} value={data[activeLocale][key]} onChange={(next) => updateField(key, next)} />)}</CardContent>
        </Card>

        <aside className="admin-rail">
          <Card className="gap-4">
            <CardHeader><CardTitle className="text-sm">Publishing</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Status</span><StatusBadge status={dirty ? "draft" : status} /></div>
              <div><p className="m-0 text-xs text-muted-foreground">Last updated</p><p className="mb-0 mt-1 text-sm">{new Date(updatedAt).toLocaleString("en-GB")}</p><small className="text-muted-foreground">{updatedBy ?? "System"}</small></div>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline"><Link href="/" target="_blank">English <ExternalLink aria-hidden="true" /></Link></Button>
                <Button asChild variant="outline"><Link href="/fa" target="_blank">فارسی <ExternalLink aria-hidden="true" /></Link></Button>
              </div>
            </CardContent>
          </Card>
          <Card className="gap-4">
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Clock3 className="size-4" aria-hidden="true" />Recent versions</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              {revisions.length ? revisions.map((revision) => <div key={revision.id} className="border-l-2 border-border pl-3"><p className="m-0 text-xs font-medium capitalize">{revision.action}</p><small className="text-muted-foreground">{new Date(revision.createdAt).toLocaleString("en-GB")}<br />{revision.actorEmail ?? "System"}</small></div>) : <p className="m-0 text-xs text-muted-foreground">Version history begins after your first save.</p>}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
