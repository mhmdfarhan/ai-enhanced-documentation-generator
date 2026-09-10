import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { AIService } from '@/lib/ai-service';
export async function POST(req: NextRequest){
  try{
    const { projectId, types } = await req.json() as { projectId:string; types:string[] };
    const allowed=['project_overview','architecture','api','database','module','developer_guide','setup_guide'] as const;
    const sel = (types||[]).filter((t:string)=> (allowed as any).includes(t));
    if(!projectId || sel.length===0) return NextResponse.json({error:'projectId & types required'},{status:400});
    const admin=createAdminClient();
    const { data: files } = await (admin as any).from('files').select('path,language').eq('project_id',projectId).limit(40);
    const { data: syms } = await (admin as any).from('code_symbols').select('name,type').eq('project_id',projectId).limit(40);
    const ctx=`Project ${projectId}\nFiles:\n${(files as any[]||[]).map((f:any)=>`- ${f.path} (${f.language})`).join('\n')}\nSymbols: ${(syms as any[]||[]).map((s:any)=>`${s.type}:${s.name}`).join(', ')}\n`;
    const ai=new AIService();
    const results:any[]=[];
    for(const t of sel){
      try{
        const content=await ai.generateDocumentation(ctx, t as any);
        const { data: existing } = await (admin as any).from('documentation').select('id').eq('project_id',projectId).eq('type',t).maybeSingle();
        if(existing){
          await (admin as any).from('documentation').update({content,updated_at:new Date().toISOString(),generated_by:'ai',status:'generated'}).eq('id', existing.id);
          results.push({type:t,updated:true});
        } else {
          const titleMap:any={project_overview:'Project Overview',architecture:'Architecture',api:'API Documentation',database:'Database Documentation',module:'Module Documentation',developer_guide:'Developer Guide',setup_guide:'Setup Guide'};
          await (admin as any).from('documentation').insert({project_id:projectId,title:titleMap[t]||t,type:t,content,generated_by:'ai',status:'generated'});
          results.push({type:t,created:true});
        }
      }catch(e:any){ results.push({type:t,error:e?.message}); }
    }
    return NextResponse.json({success:true,results});
  }catch(e:any){ return NextResponse.json({error:e?.message||'failed'},{status:500}); }
}
