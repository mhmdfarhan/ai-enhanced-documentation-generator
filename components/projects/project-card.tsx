'use client';
import { supabase } from '@/lib/supabase';
import { Clock, FileStack, Layers, Globe, Trash2, ArrowUpRight, Box } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
interface ProjectCardProps { project:{id:string;name:string;description:string|null;programming_language:string|null;framework:string|null;analysis_status:string;documentation_status:string;files_count:number;modules_count:number;api_endpoints_count:number;documentation_coverage:number;last_analysis_at:string|null;created_at:string;}; onDeleted?:(id:string)=>void; }
export function ProjectCard({ project, onDeleted }: ProjectCardProps){
  const [deleting,setDeleting]=useState(false); const [confirm,setConfirm]=useState(false);
  const statusDot = project.analysis_status==='completed'?'bg-emerald-500':project.analysis_status==='analyzing'?'bg-amber-500':project.analysis_status==='failed'?'bg-red-500':'bg-zinc-300';
  const statusBg = project.analysis_status==='completed'?'bg-emerald-50 text-emerald-700 border-emerald-200':project.analysis_status==='analyzing'?'bg-amber-50 text-amber-700 border-amber-200':'bg-zinc-50 text-zinc-600 border-zinc-200';
  const cov = project.documentation_coverage||0;
  const handleDelete=async()=>{
    if(!confirm){ setConfirm(true); setTimeout(()=>setConfirm(false),3000); return; }
    setDeleting(true);
    try{
      const {data:repos}=await supabase.from('repositories').select('zip_path').eq('project_id',project.id);
      const {error}=await supabase.from('projects').delete().eq('id',project.id);
      if(error) throw error;
      if(repos) for(const r of repos as any) if(r.zip_path) await supabase.storage.from('repository-zips').remove([r.zip_path]);
      onDeleted?.(project.id);
    }catch(e:any){ alert('Gagal hapus: '+(e?.message||'unknown')); setDeleting(false); }
  };
  return (
    <div className="group relative rounded-[20px] bg-white border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-900/[0.04] transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white grid place-items-center shrink-0"><Box className="w-5 h-5" /></div>
          <div className="min-w-0">
            <h3 className="font-semibold tracking-tight leading-none truncate pr-2">{project.name}</h3>
            <p className="mt-1 text-xs text-zinc-500 line-clamp-2 leading-relaxed">{project.description || 'No description — add one in settings.'}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {project.programming_language && <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-zinc-900 text-white">{project.programming_language}{project.framework?` • ${project.framework}`:''}</span>}
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${statusBg}`}><span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />{project.analysis_status}</span>
            </div>
          </div>
        </div>
        <button onClick={handleDelete} disabled={deleting} title={confirm?'Klik lagi untuk konfirmasi':'Hapus'} className={`w-8 h-8 rounded-full grid place-items-center border transition ${confirm?'bg-red-600 border-red-600 text-white':'bg-white border-zinc-200 text-zinc-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50'}`}><Trash2 className="w-4 h-4" /></button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-3"><div className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-zinc-500"><FileStack className="w-3 h-3" /> Files</div><div className="mt-1 text-lg font-semibold tracking-tight">{project.files_count}</div></div>
        <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-3"><div className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-zinc-500"><Layers className="w-3 h-3" /> Modules</div><div className="mt-1 text-lg font-semibold tracking-tight">{project.modules_count}</div></div>
        <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-3"><div className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-zinc-500"><Globe className="w-3 h-3" /> APIs</div><div className="mt-1 text-lg font-semibold tracking-tight">{project.api_endpoints_count}</div></div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px]"><span className="tracking-widest uppercase font-medium text-zinc-500">Coverage</span><span className="font-medium">{cov}%</span></div>
        <div className="mt-1.5 h-1.5 rounded-full bg-zinc-100 overflow-hidden"><div className="h-full rounded-full bg-zinc-900 transition-all" style={{width:`${cov}%`}} /></div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500"><Clock className="w-3.5 h-3.5" />{project.last_analysis_at? new Date(project.last_analysis_at).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}):'Never analyzed'}</div>
      <div className="mt-4 flex gap-2">
        <Link href={`/dashboard/projects/${project.id}`} className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full border border-zinc-200 bg-white text-sm font-medium hover:bg-zinc-50 transition">View <ArrowUpRight className="w-4 h-4" /></Link>
        <Link href={`/dashboard/projects/${project.id}/chat`} className="flex-1 inline-flex items-center justify-center py-2.5 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition">Ask AI</Link>
      </div>
      {confirm && <p className="mt-2 text-center text-xs text-red-600">Klik hapus lagi untuk konfirmasi</p>}
    </div>
  );
}
