"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { FieldSchema, SectionSchema } from "../../lib/section-validation";

type SectionData = Record<string, unknown>;

function emptyValueFor(field: FieldSchema): unknown {
  return field.type === "list" ? [] : "";
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-32 w-auto rounded border border-slate-200 object-cover" />
      ) : null}
      <Input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
}

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: FieldSchema;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  if (field.type === "text") {
    return (
      <div className="space-y-2">
        <Label>{field.label}</Label>
        <Input value={(value as string) ?? ""} onChange={(event) => onChange(event.target.value)} />
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="space-y-2">
        <Label>{field.label}</Label>
        <Textarea rows={4} value={(value as string) ?? ""} onChange={(event) => onChange(event.target.value)} />
      </div>
    );
  }

  if (field.type === "image") {
    return <ImageField label={field.label} value={(value as string) ?? ""} onChange={onChange} />;
  }

  const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];

  function updateItem(index: number, key: string, next: unknown) {
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: next } : item)));
  }

  function addItem() {
    if (field.type !== "list") return;
    const blank: Record<string, unknown> = {};
    for (const [key, subField] of Object.entries(field.fields)) blank[key] = emptyValueFor(subField);
    onChange([...items, blank]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  if (field.type !== "list") return null;

  return (
    <div className="space-y-3">
      <Label>{field.label}</Label>
      {items.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">
              {field.itemLabel} {index + 1}
            </CardTitle>
            <div className="flex gap-1">
              <Button type="button" variant="outline" size="sm" onClick={() => moveItem(index, -1)}>
                Up
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => moveItem(index, 1)}>
                Down
              </Button>
              <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(index)}>
                Remove
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(field.fields).map(([key, subField]) => (
              <FieldEditor
                key={key}
                field={subField}
                value={item[key]}
                onChange={(next) => updateItem(index, key, next)}
              />
            ))}
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="secondary" onClick={addItem}>
        Add {field.itemLabel}
      </Button>
    </div>
  );
}

export function DynamicSectionForm({
  sectionKey,
  schema,
  initialData,
}: {
  sectionKey: string;
  schema: SectionSchema;
  initialData: SectionData;
}) {
  const [data, setData] = useState<SectionData>(initialData);
  const [saving, setSaving] = useState(false);

  function updateField(key: string, next: unknown) {
    setData((prev) => ({ ...prev, [key]: next }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch(`/api/sections/${sectionKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Save failed");
      toast.success("Saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold">{schema.label}</h1>
      {Object.entries(schema.fields).map(([key, field]) => (
        <FieldEditor key={key} field={field} value={data[key]} onChange={(next) => updateField(key, next)} />
      ))}
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save changes"}
      </Button>
    </div>
  );
}
