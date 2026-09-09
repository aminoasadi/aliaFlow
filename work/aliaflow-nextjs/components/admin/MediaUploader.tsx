"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function MediaUploader(){const [uploading,setUploading]=useState(false);const router=useRouter();async function upload(file:File){setUploading(true);try{const body=new FormData();body.append("file",file);const response=await fetch("/api/media",{method:"POST",body});const json=await response.json();if(!response.ok)throw new Error(json.error??"Upload failed");toast.success("Media uploaded");router.refresh();}catch(error){toast.error(error instanceof Error?error.message:"Upload failed");}finally{setUploading(false)}}return <Button asChild disabled={uploading}><label className="cursor-pointer"><Upload />{uploading?"Uploading…":"Upload image"}<input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={uploading} onChange={event=>{const file=event.target.files?.[0];if(file)void upload(file)}}/></label></Button>}
