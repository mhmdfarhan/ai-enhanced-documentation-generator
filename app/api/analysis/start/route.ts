import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { RepositoryScanner } from '@/lib/repository-scanner';

function isUUID(v: any){ return typeof v==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v); }

export async function POST(req: NextRequest){
  try{
    let body: any = {};
    try{ body = await req.json(); } catch{ return NextResponse.json({error:'Invalid JSON body'},{status:400}); }
    let { projectId, analysisRunId } = body;
    if(!isUUID(projectId)) return NextResponse.json({error:'projectId must be UUID'},{status:400});

    const admin = createAdminClient();
    if(!process.env.SUPABASE_SERVICE_ROLE_KEY) console.warn('[analysis/start] SUPABASE_SERVICE_ROLE_KEY not set — RLS will fail for anon client');

    const { data: project, error: pe } = await (admin as any).from('projects').select('id').eq('id', projectId).maybeSingle();
    if(pe) return NextResponse.json({error:'DB error: '+pe.message, details: pe},{status:500});
    if(!project) return NextResponse.json({error:'Project not found. Jalankan supabase-fix-403.sql lalu buat project baru.'},{status:404});

    const { data: repo } = await (admin as any).from('repositories').select('zip_path').eq('project_id', projectId).order('created_at',{ascending:false}).limit(1).maybeSingle();
    if(!repo?.zip_path) return NextResponse.json({error:'Repository ZIP belum ada. Upload ZIP dulu.'},{status:404});

    if(!analysisRunId || !isUUID(analysisRunId)){
      const { data: run, error: re } = await (admin as any).from('analysis_runs').insert({ project_id: projectId, status:'extracting', progress:5 }).select('id').maybeSingle();
      if(re) return NextResponse.json({error:'Gagal buat analysis_runs: '+re.message+' — jalankan supabase-fix-403.sql'},{status:500});
      analysisRunId = (run as any)?.id;
      if(!analysisRunId) return NextResponse.json({error:'Gagal buat analysis run (empty id)'},{status:500});
    } else {
      await (admin as any).from('analysis_runs').update({status:'extracting',progress:5}).eq('id', analysisRunId);
    }

    // fire-and-forget after response
    setTimeout(()=>{ startAnalysisBackground(projectId, analysisRunId, repo.zip_path, admin).catch(e=>console.error('background',e)); }, 50);

    return NextResponse.json({success:true, message:'Analysis started', projectId, analysisRunId, zip_path: repo.zip_path});
  }catch(e:any){
    console.error('[analysis/start] 500', e);
    return NextResponse.json({error: e?.message || 'Internal server error'},{status:500});
  }
}

async function startAnalysisBackground(projectId:string, analysisRunId:string, zipPath:string, db:any){
  try{
    const scanner = new RepositoryScanner(projectId, analysisRunId);
    await scanner.processZip(zipPath);
    await (db as any).from('projects').update({analysis_status:'completed',documentation_status:'completed',last_analysis_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',projectId);
  }catch(err:any){
    console.error('Background analysis failed', err?.message, err);
    try{ await (db as any).from('analysis_runs').update({status:'failed',error_message:String(err?.message||err).slice(0,500)}).eq('id',analysisRunId); }catch{}
    try{ await (db as any).from('projects').update({analysis_status:'failed',updated_at:new Date().toISOString()}).eq('id',projectId);}catch{}
  }
}
