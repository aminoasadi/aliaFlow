import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

const allowed = new Set(["siteName","siteUrl","locale","timezone"]);
export async function PATCH(request:NextRequest){const body=await request.json().catch(()=>null) as Record<string,unknown>|null;if(!body)return NextResponse.json({error:"Invalid request"},{status:400});const entries=Object.entries(body).filter(([key,value])=>allowed.has(key)&&typeof value==="string");if(!entries.length)return NextResponse.json({error:"No valid settings"},{status:400});const userId=await getSessionUserId();const user=userId?await prisma.user.findUnique({where:{id:userId},select:{email:true}}):null;await prisma.$transaction(async tx=>{for(const [key,value] of entries)await tx.setting.upsert({where:{key},update:{value:value as string},create:{key,value:value as string}});await tx.activity.create({data:{action:"Updated",entityType:"settings",entityKey:"general",actorEmail:user?.email}})});return NextResponse.json({ok:true})}
