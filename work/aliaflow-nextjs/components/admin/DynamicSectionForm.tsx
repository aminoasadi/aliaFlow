"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowLeft, ArrowUp, Clock3, ExternalLink, GripVertical, ImagePlus, Plus, Save, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { FieldSchema, SectionSchema } from "@/lib/section-validation";

type SectionData = Record<string, unknown>;
type Revision = { id: string; action: string; actorEmail: string | null; createdAt: string };
function emptyValueFor(field: FieldSchema): unknown { return field.type === "list" ? [] : ""; }

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (next: string) => void }) {
  const [uploading, setUploading] = useState(false);
  async function handleFile(file: File) { setUploading(true); try { const formData=new FormData(); formData.append("file",file); const response=await fetch("/api/media",{method:"POST",body:formData}); const json=await response.json(); if(!response.ok)throw new Error(json.error??"Upload failed"); onChange(json.path); toast.success("Image uploaded"); } catch(error){toast.error(error instanceof Error?error.message:"Upload failed");} finally {setUploading(false);} }
  return <div className="grid gap-2"><Label>{label}</Label><label className="group relative grid min-h-36 cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed border-input bg-muted/40 transition-colors hover:border-primary hover:bg-accent/40">{value?<img src={value} alt="" className="h-44 w-full object-cover"/>:<span className="grid justify-items-center gap-2 p-6 text-center text-sm text-muted-foreground"><ImagePlus className="size-5" />Choose an image<small>PNG, JPG, GIF or WebP · max 5 MB</small></span>}<Input className="sr-only" type="file" accept="image/*" disabled={uploading} onChange={event=>{const file=event.target.files?.[0];if(file)void handleFile(file)}} /></label>{value?<div className="flex gap-2"><Input value={value} onChange={event=>onChange(event.target.value)} aria-label={`${label} path`} /><Button type="button" variant="outline" onClick={()=>onChange("")}>Clear</Button></div>:null}</div>;
}

function FieldEditor({ field, value, onChange }: { field: FieldSchema; value: unknown; onChange: (next: unknown) => void }) {
  if(field.type==="text") return <div className="grid gap-2"><Label>{field.label}</Label><Input value={(value as string)??""} onChange={event=>onChange(event.target.value)} /></div>;
  if(field.type==="textarea") return <div className="grid gap-2"><Label>{field.label}</Label><Textarea rows={5} value={(value as string)??""} onChange={event=>onChange(event.target.value)} /></div>;
  if(field.type==="image") return <ImageField label={field.label} value={(value as string)??""} onChange={onChange} />;
  if(field.type!=="list") return null;
  const items=Array.isArray(value)?value as Record<string,unknown>[]:[];
  const updateItem=(index:number,key:string,next:unknown)=>onChange(items.map((item,i)=>i===index?{...item,[key]:next}:item));
  const addItem=()=>{const blank:Record<string,unknown>={};for(const [key,sub] of Object.entries(field.fields))blank[key]=emptyValueFor(sub);onChange([...items,blank]);};
  const removeItem=(index:number)=>onChange(items.filter((_,i)=>i!==index));
  const moveItem=(index:number,direction:-1|1)=>{const target=index+direction;if(target<0||target>=items.length)return;const next=[...items];[next[index],next[target]]=[next[target],next[index]];onChange(next);};
  return <div className="grid gap-3"><div className="flex items-center justify-between"><Label>{field.label}</Label><Badge variant="secondary">{items.length} items</Badge></div>{items.map((item,index)=><Card key={index} className="gap-0 py-0 shadow-none"><CardHeader className="flex-row items-center gap-3 border-b px-4 py-3"><GripVertical className="size-4 text-muted-foreground"/><CardTitle className="text-sm">{field.itemLabel} {index+1}</CardTitle><div className="ml-auto flex gap-1"><Button type="button" variant="ghost" size="icon-sm" onClick={()=>moveItem(index,-1)} disabled={index===0} aria-label="Move up"><ArrowUp /></Button><Button type="button" variant="ghost" size="icon-sm" onClick={()=>moveItem(index,1)} disabled={index===items.length-1} aria-label="Move down"><ArrowDown /></Button><Button type="button" variant="ghost" size="icon-sm" className="text-destructive" onClick={()=>removeItem(index)} aria-label="Remove item"><Trash2 /></Button></div></CardHeader><CardContent className="grid gap-5 p-4">{Object.entries(field.fields).map(([key,sub])=><FieldEditor key={key} field={sub} value={item[key]} onChange={next=>updateItem(index,key,next)} />)}</CardContent></Card>)}<Button type="button" variant="outline" className="justify-self-start" onClick={addItem}><Plus /> Add {field.itemLabel}</Button></div>;
}

export function DynamicSectionForm({ sectionKey, schema, initialData, status, updatedAt, updatedBy, revisions }: { sectionKey:string; schema:SectionSchema; initialData:SectionData; status:string; updatedAt:string; updatedBy:string|null; revisions:Revision[] }) {
  const [data,setData]=useState(initialData); const [saving,setSaving]=useState<"save"|"publish"|null>(null); const router=useRouter();
  const dirty=useMemo(()=>JSON.stringify(data)!==JSON.stringify(initialData),[data,initialData]);
  const updateField=(key:string,next:unknown)=>setData(prev=>({...prev,[key]:next}));
  async function submit(intent:"save"|"publish") { setSaving(intent); try { const response=await fetch(`/api/sections/${sectionKey}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({data,intent})}); const json=await response.json(); if(!response.ok)throw new Error(json.error??"Save failed"); toast.success(intent==="publish"?"Published to the live website":"Draft saved"); router.refresh(); } catch(error){toast.error(error instanceof Error?error.message:"Save failed");} finally{setSaving(null);} }
  return <div className="admin-page"><header className="admin-page-header"><div><Button asChild variant="ghost" size="sm" className="-ml-3 mb-3"><Link href="/admin/content"><ArrowLeft /> All content</Link></Button><p className="admin-kicker">Section editor</p><h1 className="admin-title">{schema.label}</h1><p className="admin-description">Update structured fields without touching the website code.</p></div><div className="flex shrink-0 items-center gap-2"><Button variant="outline" onClick={()=>submit("save")} disabled={Boolean(saving)||!dirty}><Save />{saving==="save"?"Saving…":"Save draft"}</Button><Button onClick={()=>submit("publish")} disabled={Boolean(saving)}><Send />{saving==="publish"?"Publishing…":"Publish"}</Button></div></header>
    <div className="editor-grid"><Card className="gap-0 py-0"><CardHeader className="border-b py-5"><CardTitle>Content fields</CardTitle><CardDescription>Changes are kept as a draft until you publish.</CardDescription></CardHeader><CardContent className="grid gap-7 py-6">{Object.entries(schema.fields).map(([key,field])=><FieldEditor key={key} field={field} value={data[key]} onChange={next=>updateField(key,next)} />)}</CardContent></Card>
      <aside className="admin-rail"><Card className="gap-4"><CardHeader><CardTitle className="text-sm">Publishing</CardTitle></CardHeader><CardContent className="grid gap-4"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Status</span><StatusBadge status={dirty?"draft":status}/></div><div><p className="m-0 text-xs text-muted-foreground">Last updated</p><p className="mb-0 mt-1 text-sm">{new Date(updatedAt).toLocaleString("en-GB")}</p><small className="text-muted-foreground">{updatedBy??"System"}</small></div><Button asChild variant="outline"><Link href="/" target="_blank">View website <ExternalLink /></Link></Button></CardContent></Card><Card className="gap-4"><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Clock3 className="size-4"/>Recent versions</CardTitle></CardHeader><CardContent className="grid gap-3">{revisions.length?revisions.map(revision=><div key={revision.id} className="border-l-2 border-border pl-3"><p className="m-0 text-xs font-medium capitalize">{revision.action}</p><small className="text-muted-foreground">{new Date(revision.createdAt).toLocaleString("en-GB")}<br/>{revision.actorEmail??"System"}</small></div>):<p className="m-0 text-xs text-muted-foreground">Version history begins after your first save.</p>}</CardContent></Card></aside>
    </div>
  </div>;
}
