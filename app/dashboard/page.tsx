'use client';
import { useAuth } from "@/components/auth/auth-provider";
import { DashboardNav } from "@/components/dashboard/nav";
import { ProjectCard } from "@/components/projects/project-card";
import { supabase } from "@/lib/supabase";
import { Plus, Sparkles, FileStack, Layers, Boxes, Activity, ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
interface Project { id:string; name:string; description:string|null; programming_language:string|null; framework:string|null; analysis_status:string; documentation_status:string; files_count:number; modules_count:number; api_endpoints_count:number; documentation_coverage:number; last_analysis_at:string|null; created_at:string; }
export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const router = useRouter();
  useEffect(()=>{ if(authLoading) return; if(!user?.id){ setProjects([]); setLoading(false); return; } let cancelled=false; (async()=>{ setLoading(true); try{ const {data,error}=await supabase.from('projects').select('*').eq('user_id',user.id).order('created_at',{ascending:false}); if(error) throw error; if(!cancelled) setProjects(data||[]); }catch(e){ console.error(e);} finally{ if(!cancelled) setLoading(false);} })(); return()=>{cancelled=true;}; },[user?.id,authLoading]);
  useEffect(()=>{ if(!authLoading && !user) router.replace('/login'); },[user,authLoading]);
  const filtered = useMemo(()=>{ if(!q) return projects; const s=q.toLowerCase(); return projects.filter(p=>p.name.toLowerCase().includes(s) || (p.description||'').toLowerCase().includes(s)); },[projects,q]);
  const stats = useMemo(()=>({ total:projects.length, files:projects.reduce((a,b)=>a+b.files_count,0), cov: projects.length? Math.round(projects.reduce((a,b)=>a+b.documentation_coverage,0)/projects.length):0, apis:projects.reduce((a,b)=>a+b.api_endpoints_count,0)}),[projects]);
  if(authLoading || !user) return <div className="min-h-screen grid place-items-center bg-[#fafafb]"><div className="flex flex-col items-center gap-3"><div className="w-8 h-8 rounded-full border-2 border-zinc-300 border-t-zinc-900 animate-spin" /><p className="text-sm text-zinc-500">Loading workspace…</p></div></div>;
  return (
    <div className="min-h-screen bg-[#fafafb]">
      <DashboardNav />
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="rounded-[24px] bg-zinc-900 text-white p-7 sm:p-8 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-gradient-to-br from-violet-600/30 to-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,.06)_1px,transparent_0)] bg-[size:24px_24px] opacity-50" />
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur"><Sparkles className="w-3.5 h-3.5 text-violet-300" /> AI Documentation — {user.full_name || user.email}</div>
              <h1 className="mt-3 text-[28px] font-semibold tracking-tight">Projects</h1>
              <p className="mt-1 text-sm text-zinc-400 max-w-[560px]">Kelola repository, pantau coverage, dan tanya AI tentang codebase-mu. Upload ZIP dan biarkan graph + RAG bekerja.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-2 backdrop-blur">
                <Search className="w-4 h-4 text-zinc-400" />
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search projects…" className="bg-transparent outline-none text-sm placeholder:text-zinc-500 w-[180px]" />
              </div>
              <button onClick={()=>router.push('/dashboard/projects/new')} className="inline-flex items-center gap-2 px-5 py-3 bg-white text-zinc-900 rounded-full font-medium hover:bg-zinc-100 transition shadow-lg"><Plus className="w-4 h-4" /> New Project</button>
            </div>
          </div>
          {projects.length>0 && (
            <div className="relative mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {k:"Total Projects",v:stats.total,icon:Boxes,sub:"workspaces"},
                {k:"Files Analyzed",v:stats.files.toLocaleString(),icon:FileStack,sub:"indexed"},
                {k:"Avg Coverage",v:stats.cov+"%",icon:Activity,sub:"docs generated"},
                {k:"API Endpoints",v:stats.apis.toLocaleString(),icon:Layers,sub:"detected"},
              ].map(s=>{
                const I=s.icon;
                return <div key={s.k} className="rounded-2xl bg-white text-zinc-900 p-4 border"><div className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-zinc-500"><I className="w-3.5 h-3.5" />{s.k}</div><div className="mt-1 text-2xl font-semibold tracking-tight">{s.v}</div><div className="text-xs text-zinc-500">{s.sub}</div></div>
              })}
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="font-semibold tracking-tight">Your workspaces <span className="ml-2 text-xs font-medium px-2 py-1 rounded-full bg-zinc-900 text-white">{filtered.length}</span></h2>
          <button onClick={()=>router.push('/dashboard/projects/new')} className="sm:hidden inline-flex items-center gap-1.5 text-sm font-medium">New <ArrowRight className="w-4 h-4" /></button>
        </div>

        {loading ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i=><div key={i} className="animate-pulse rounded-[20px] bg-white border p-6"><div className="h-5 bg-zinc-100 rounded w-1/2 mb-3" /><div className="h-3 bg-zinc-100 rounded w-full mb-2" /><div className="h-3 bg-zinc-100 rounded w-2/3" /></div>)}
          </div>
        ) : filtered.length===0 ? (
          <div className="mt-4 rounded-[24px] bg-white border p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white grid place-items-center mx-auto"><Boxes className="w-7 h-7" /></div>
            <h3 className="mt-4 font-semibold">{q ? 'No match' : 'No projects yet'}</h3>
            <p className="mt-1 text-sm text-zinc-500 max-w-md mx-auto">{q ? 'Coba kata kunci lain.' : 'Buat workspace pertama — upload ZIP repository dan lihat docs tergenerate otomatis.'}</p>
            {!q && <button onClick={()=>router.push('/dashboard/projects/new')} className="mt-5 inline-flex items-center gap-2 px-5 py-3 bg-zinc-900 text-white rounded-full font-medium"><Plus className="w-4 h-4" /> Create First Project</button>}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p=><ProjectCard key={p.id} project={p} onDeleted={id=>setProjects(x=>x.filter(y=>y.id!==id))} />)}
          </div>
        )}
      </div>
    </div>
  );
}
