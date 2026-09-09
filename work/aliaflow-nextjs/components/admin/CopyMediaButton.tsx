"use client";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
export function CopyMediaButton({url}:{url:string}){return <Button variant="ghost" size="icon-sm" aria-label="Copy media URL" onClick={async()=>{await navigator.clipboard.writeText(url);toast.success("Media URL copied")}}><Copy /></Button>}
