import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
export async function GET(req: NextRequest){
  const projectId=req.nextUrl.searchParams.get('projectId');
  const fileId=req.nextUrl.searchParams.get('fileId');
  const path=req.nextUrl.searchParams.get('path');
  if(!projectId) return NextResponse.json({error:'projectId required'},{status:400});
  const admin=createAdminClient();
  let file: any = null;
  if(fileId){
    const {data}=await (admin as any).from('files').select('id,path,language').eq('id',fileId).maybeSingle();
    file=data;
  } else if(path){
    const {data}=await (admin as any).from('files').select('id,path,language').eq('project_id',projectId).eq('path',path).maybeSingle();
    file=data;
  }
  if(!file) return NextResponse.json({error:'file not found'},{status:404});
  const { data: chunks } = await (admin as any).from('code_chunks').select('content,start_line').eq('project_id',projectId).eq('file_id',file.id).order('start_line');
  let content='';
  if(chunks && chunks.length){
    content=(chunks as any[]).sort((a,b)=>a.start_line-b.start_line).map((c:any)=>c.content).join('\n');
  }
  const { data: symbols } = await (admin as any).from('code_symbols').select('name,type,start_line,end_line').eq('file_id',file.id).order('start_line');
  return NextResponse.json({ file, content: content || '// content not indexed yet — re-analyze project', symbols: symbols||[] });
}
