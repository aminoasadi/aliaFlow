"use client";
import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsForm({ initial }: { initial: Record<string,string> }) { const [data,setData]=useState(initial); const [saving,setSaving]=useState(false); async function save(){setSaving(true);try{const response=await fetch("/api/admin/settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});const json=await response.json();if(!response.ok)throw new Error(json.error??"Save failed");toast.success("Settings saved");}catch(error){toast.error(error instanceof Error?error.message:"Save failed");}finally{setSaving(false)}} const fields=[{key:"siteName",label:"Site name",hint:"The public name used across the workspace."},{key:"siteUrl",label:"Website URL",hint:"The canonical address of the live website."},{key:"locale",label:"Default language",hint:"Use a language code such as en or fa."},{key:"timezone",label:"Timezone",hint:"Used for publishing dates and the activity log."}]; return <div className="grid gap-6">{fields.map(field=><div key={field.key} className="grid gap-2"><Label htmlFor={field.key}>{field.label}</Label><Input id={field.key} value={data[field.key]??""} onChange={event=>setData(prev=>({...prev,[field.key]:event.target.value}))}/><small className="text-muted-foreground">{field.hint}</small></div>)}<Button className="justify-self-start" onClick={save} disabled={saving}><Save />{saving?"Saving…":"Save settings"}</Button></div>; }
