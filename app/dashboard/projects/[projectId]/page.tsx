'use client';
import { DashboardNav } from "@/components/dashboard/nav";
import { supabase } from "@/lib/supabase";
import { CodeExplorer } from "@/components/code/code-explorer";
import { DocEditor, DocTypeSelector } from "@/components/docs/doc-editor";
import { Activity, Code2, Database, FileText, Globe, Layers, Settings, ArrowLeft, Sparkles, FileStack, Boxes, Rocket, MessageCircle, Network, Download, RefreshCw, Shield, Trash2, Search } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
interface Project { id:string; name:string; description:string|null; programming_language:string|null; framework:string|null; analysis_status:string; documentation_status:string; files_count:number; modules_count:number; api_endpoints_count:number; documentation_coverage:number; last_analysis_at:string|null; created_at:string; }
interface Documentation { id:string; title:string; type:string; content:string; status:string; }
function DeleteProjectForm({ projectId, projectName }: { projectId: string; projectName: string }) {
  const router = useRouter(); const [val, setVal] = useState(''); const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    if (val !== 'DELETE') return; if (!confirm(`Hapus "${projectName}" permanen?`)) return; setLoading(true);
    try{ const {data:repos}=await (supabase as any).from('repositories').select('zip_path').eq('project_id',projectId); const {error}=await (supabase as any).from('projects').delete().eq('id',projectId); if(error) throw error; if(repos) for(const r of repos as any) if(r.zip_path) await supabase.storage.from('repository-zips').remove([r.zip_path]); router.push('/dashboard'); } catch(e:any){ alert('Gagal hapus: '+(e?.message||'unknown')); setLoading(false); }
  };
  return (<div className="flex gap-2"><input value={val} onChange={e=>setVal(e.target.value)} placeholder="Ketik DELETE" className="flex-1 px-3.5 py-2.5 bg-white border border-red-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20" /><button onClick={handleDelete} disabled={val!=='DELETE'||loading} className="px-5 py-2.5 bg-red-600 text-white rounded-full text-sm font-medium disabled:opacity-40 inline-flex items-center gap-1.5"><Trash2 className="w-4 h-4" />{loading?'Menghapus…':'Hapus'}</button></div>);
}
export default function ProjectDetailPage(){
  const {projectId}=useParams<{projectId:string}>(); const router=useRouter();
  const [project,setProject]=useState<Project|null>(null); const [documentation,setDocumentation]=useState<Documentation[]>([]); const [loading,setLoading]=useState(true); const [activeTab,setActiveTab]=useState('overview'); const [isAnalyzing,setIsAnalyzing]=useState(false);
  const [analysisRun,setAnalysisRun]=useState<any>(null); const [editingDoc,setEditingDoc]=useState<Documentation|null>(null);
  const isUUID=(v:any)=>typeof v==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
  const refresh=async()=>{
    if(!isUUID(projectId)) return;
    const [{data:proj},{data:docs}] = await Promise.all([
      (supabase as any).from('projects').select('*').eq('id',projectId as string).maybeSingle(),
      (supabase as any).from('documentation').select('*').eq('project_id',projectId as string).order('type'),
    ]);
    if(proj) setProject(proj as any); setDocumentation((docs as any)||[]);
    const {data:run}=await (supabase as any).from('analysis_runs').select('*').eq('project_id',projectId as string).order('created_at',{ascending:false}).limit(1).maybeSingle();
    if(run) setAnalysisRun(run);
  };
  useEffect(()=>{ if(!isUUID(projectId)){ setLoading(false); return;} let cancelled=false; (async()=>{ await refresh(); if(!cancelled) setLoading(false); })(); return()=>{cancelled=true;}; },[projectId]);
  useEffect(()=>{
    if(!isUUID(projectId) || !isAnalyzing) return;
    const id=setInterval(refresh,1500);
    return()=>clearInterval(id);
  },[isAnalyzing, projectId]);
  useEffect(()=>{
    if(!isUUID(projectId)) return;
    const ch=(supabase as any).channel(`proj-${projectId}`)
      .on('postgres_changes',{event:'*',schema:'public',table:'analysis_runs',filter:`project_id=eq.${projectId}`},(p:any)=>{ setAnalysisRun(p.new); if(p.new?.status==='completed'||p.new?.status==='failed'){ setIsAnalyzing(false); refresh(); } })
      .on('postgres_changes',{event:'*',schema:'public',table:'documentation',filter:`project_id=eq.${projectId}`},()=>refresh())
      .subscribe();
    return()=>{ (supabase as any).removeChannel(ch); };
  },[projectId]);
  const fetchProject=async()=>{ const {data}=await (supabase as any).from('projects').select('*').eq('id',projectId!).maybeSingle(); if(data) setProject(data as any); };
  const fetchDocumentation=async()=>{ const {data}=await (supabase as any).from('documentation').select('*').eq('project_id',projectId!).order('type'); setDocumentation((data as any)||[]); };
  const handleReanalyze=async()=>{
    if(!isUUID(projectId)) return; setIsAnalyzing(true);
    try{
      let analysisRunId: string | undefined;
      try{
        const {data:ar,error}=await (supabase as any).from('analysis_runs').insert({project_id:projectId,status:'extracting',progress:5}).select('id').maybeSingle();
        if(!error && ar?.id) analysisRunId=(ar as any).id;
      }catch{}
      const res=await fetch('/api/analysis/start',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId,analysisRunId})});
      const text=await res.text();
      let j:any={}; try{ j=text? JSON.parse(text):{}; }catch{ j={error:text.slice(0,300)}; }
      if(!res.ok) throw new Error(j.error||`Failed (${res.status})`);
    }catch(e:any){ alert(e.message); setIsAnalyzing(false); }
  };
  const dot=(s:string)=> s==='completed'?'bg-emerald-500':s==='analyzing'||s==='extracting'||s==='scanning'||s==='parsing'||s==='generating_docs'?'bg-amber-500':s==='failed'?'bg-red-500':'bg-zinc-400';
  const covFor=(type:string)=>{
    const d=documentation.find(x=>x.type===type);
    if(!d) return 0;
    if(d.content.length<80) return 35;
    if(d.content.length<300) return 62;
    if(d.content.length<800) return 78;
    return Math.min(96, 84+Math.floor(d.content.length/600));
  };
  const covItems=[
    {label:'Project', type:'project_overview'},
    {label:'API', type:'api'},
    {label:'Modules', type:'module'},
    {label:'Database', type:'database'},
    {label:'Architecture', type:'architecture'},
  ];
  const tabs=[
    {id:'overview',label:'Overview',icon:Activity},
    {id:'code',label:'Code',icon:Code2},
    {id:'documentation',label:'Docs',icon:FileText},
    {id:'architecture',label:'Architecture',icon:Layers},
    {id:'api',label:'API',icon:Globe},
    {id:'database',label:'Database',icon:Database},
    {id:'settings',label:'Settings',icon:Settings},
  ];
  if(loading) return <div className="min-h-screen bg-[#fafafb]"><DashboardNav/><div className="max-w-[1200px] mx-auto px-6 py-8"><div className="animate-pulse space-y-4"><div className="h-40 bg-white border rounded-[24px]" /><div className="grid grid-cols-3 gap-4">{[1,2,3].map(i=><div key={i} className="h-24 bg-white border rounded-2xl" />)}</div></div></div></div>;
  if(!project) return <div className="min-h-screen bg-[#fafafb]"><DashboardNav/><div className="max-w-[1200px] mx-auto px-6 py-10 text-center"><div className="rounded-[24px] bg-white border p-10"><h2 className="text-xl font-semibold">Project not found</h2><p className="text-sm text-zinc-500 mt-1">ID: {String(projectId)}</p><button onClick={()=>router.push('/dashboard')} className="mt-4 px-5 py-2.5 bg-zinc-900 text-white rounded-full text-sm font-medium">Back to Dashboard</button></div></div></div>;
  const cov=project.documentation_coverage||0;
  const showProgress = isAnalyzing || (analysisRun && !['completed','failed'].includes(analysisRun.status));
  const steps=[
    {k:'extracting',label:'Extracting ZIP'},
    {k:'scanning',label:'Scanning Files'},
    {k:'parsing',label:'Parsing Code'},
    {k:'analyzing',label:'Building Graph'},
    {k:'generating_docs',label:'Generating Docs'},
    {k:'completed',label:'Done'},
  ];
  return (
    <div className="min-h-screen bg-[#fafafb]">
      <DashboardNav />
      <main className="max-w-[1200px] mx-auto px-6 py-6">
        <button onClick={()=>router.push('/dashboard')} className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900"><ArrowLeft className="w-4 h-4" /> Back to projects</button>

        {showProgress && (
          <div className="mt-4 rounded-[20px] bg-white border p-4">
            <div className="flex items-center gap-2 text-sm font-medium"><RefreshCw className="w-4 h-4 animate-spin text-violet-600" /> Repository Analysis — {analysisRun?.status || 'pending'} {analysisRun?.progress!=null?`· ${analysisRun.progress}%`:''}</div>
            <div className="mt-3 h-2 rounded-full bg-zinc-100 overflow-hidden"><div className="h-full bg-zinc-900 transition-all" style={{width:`${analysisRun?.progress|| (isAnalyzing?18:0)}%`}} /></div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {steps.map(s=>{
                const active = (analysisRun?.status===s.k) || (s.k==='completed' && analysisRun?.status==='completed');
                const done = (analysisRun?.progress||0) > (s.k==='extracting'?10:s.k==='scanning'?20:s.k==='parsing'?40:s.k==='analyzing'?60:s.k==='generating_docs'?80:100);
                return <span key={s.k} className={`text-[11px] px-2 py-1 rounded-full border ${active?'bg-zinc-900 text-white border-zinc-900': done?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-white text-zinc-500 border-zinc-200'}`}>{s.label} {done?'✓':''}</span>
              })}
            </div>
            {analysisRun?.error_message && <div className="mt-2 text-xs text-red-600">{analysisRun.error_message}</div>}
          </div>
        )}

        <div className="mt-4 rounded-[24px] bg-zinc-900 text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-[420px] h-[420px] bg-gradient-to-br from-violet-600/20 to-indigo-600/15 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,.06)_1px,transparent_0)] bg-[size:24px_24px] opacity-40" />
          <div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/10"><Sparkles className="w-3.5 h-3.5 text-violet-300" /> {project.programming_language || 'Auto-detect'} {project.framework?`• ${project.framework}`:''}</div>
              <h1 className="mt-3 text-[28px] font-semibold tracking-tight leading-none truncate">{project.name}</h1>
              <p className="mt-2 text-sm text-zinc-400 max-w-[640px] line-clamp-2">{project.description || 'No description — tell your team what this workspace is for.'}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-zinc-900 text-xs font-medium"><span className={`w-2 h-2 rounded-full ${dot(project.analysis_status)}`} />{project.analysis_status}</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs"><Shield className="w-3.5 h-3.5" /> RLS isolated</span>
                <span className="text-xs text-zinc-500">{project.last_analysis_at? 'Updated '+ new Date(project.last_analysis_at).toLocaleDateString('id-ID'): 'Never analyzed'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/dashboard/projects/${projectId}/chat`} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100"><MessageCircle className="w-4 h-4" /> Ask AI</Link>
              <button onClick={handleReanalyze} disabled={isAnalyzing} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${isAnalyzing?'animate-spin':''}`} />{isAnalyzing?'Analyzing…':'Re-analyze'}</button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-[20px] bg-white border p-4"><div className="flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-zinc-500"><FileStack className="w-3.5 h-3.5" /> Files</div><div className="mt-1 text-2xl font-semibold tracking-tight">{project.files_count}</div><div className="text-xs text-zinc-500">indexed</div></div>
          <div className="rounded-[20px] bg-white border p-4"><div className="flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-zinc-500"><Boxes className="w-3.5 h-3.5" /> Modules</div><div className="mt-1 text-2xl font-semibold tracking-tight">{project.modules_count}</div><div className="text-xs text-zinc-500">detected</div></div>
          <div className="rounded-[20px] bg-white border p-4"><div className="flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-zinc-500"><Globe className="w-3.5 h-3.5" /> APIs</div><div className="mt-1 text-2xl font-semibold tracking-tight">{project.api_endpoints_count}</div><div className="text-xs text-zinc-500">endpoints</div></div>
          <div className="rounded-[20px] bg-white border p-4"><div className="text-[11px] tracking-widest uppercase text-zinc-500">Coverage</div><div className="mt-1 flex items-baseline gap-2"><span className="text-2xl font-semibold tracking-tight">{cov}%</span><span className="text-xs text-zinc-500">docs</span></div><div className="mt-2 h-1.5 rounded-full bg-zinc-100 overflow-hidden"><div className="h-full bg-zinc-900 rounded-full" style={{width:`${cov}%`}} /></div></div>
        </div>

        <div className="mt-4 rounded-[20px] bg-white border p-4">
          <div className="flex items-center gap-2"><h3 className="text-sm font-semibold">Documentation Coverage</h3><span className="text-xs text-zinc-500">per category — PRD §26</span></div>
          <div className="mt-3 grid sm:grid-cols-5 gap-3">
            {covItems.map(item=>{
              const v=covFor(item.type);
              return (
                <div key={item.type} className="rounded-2xl bg-zinc-50 border p-3">
                  <div className="text-[11px] tracking-widest uppercase text-zinc-500">{item.label}</div>
                  <div className="mt-1 flex items-baseline gap-1.5"><span className="text-lg font-semibold">{v}%</span></div>
                  <div className="mt-2 h-1.5 rounded-full bg-white border overflow-hidden"><div className="h-full bg-zinc-900" style={{width:`${v}%`}} /></div>
                  <div className="mt-1 text-[11px] text-zinc-500">{v===0?'not generated':'generated'}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map(t=>{ const I=t.icon; const active=activeTab===t.id; return <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition ${active ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}><I className="w-4 h-4" />{t.label}</button> })}
        </div>

        <div className="rounded-[20px] bg-white border overflow-hidden">
          {activeTab==='overview' && (
            <div className="p-6 sm:p-7">
              <div className="flex items-center gap-2"><h2 className="text-base font-semibold tracking-tight">Overview</h2><span className="text-xs px-2 py-1 rounded-full bg-zinc-100 border text-zinc-600">AI generated</span></div>
              {documentation.find(d=>d.type==='project_overview') ? (
                <div className="mt-4 prose prose-sm max-w-none prose-zinc"><div className="whitespace-pre-wrap text-sm leading-6 text-zinc-700">{documentation.find(d=>d.type==='project_overview')!.content}</div></div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed p-8 text-center"><Rocket className="w-8 h-8 mx-auto text-zinc-400" /><p className="mt-3 text-sm font-medium">No overview yet</p><p className="text-xs text-zinc-500">Generate docs untuk melihat ringkasan stack & arsitektur.</p><button onClick={handleReanalyze} className="mt-4 px-5 py-2.5 bg-zinc-900 text-white rounded-full text-sm font-medium">Generate</button></div>
              )}
              <div className="mt-6 grid sm:grid-cols-3 gap-3">
                <Link href={`/dashboard/projects/${projectId}/chat`} className="rounded-2xl border bg-zinc-50 p-4 hover:bg-white transition"><div className="w-8 h-8 rounded-xl bg-violet-600 text-white grid place-items-center"><MessageCircle className="w-4 h-4" /></div><div className="mt-3 font-medium text-sm">Ask AI</div><div className="text-xs text-zinc-500">Tanya flow, auth, API — dengan sources</div></Link>
                <Link href={`/dashboard/projects/${projectId}/architecture`} className="rounded-2xl border bg-zinc-50 p-4 hover:bg-white transition"><div className="w-8 h-8 rounded-xl bg-zinc-900 text-white grid place-items-center"><Network className="w-4 h-4" /></div><div className="mt-3 font-medium text-sm">Architecture</div><div className="text-xs text-zinc-500">Lihat graph & dependencies</div></Link>
                <div className="rounded-2xl border bg-zinc-50 p-4"><div className="w-8 h-8 rounded-xl bg-white border grid place-items-center"><Download className="w-4 h-4" /></div><div className="mt-3 font-medium text-sm">Export</div><div className="text-xs text-zinc-500">Markdown — coming soon</div></div>
              </div>
            </div>
          )}
          {activeTab==='code' && (
            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3"><h2 className="text-base font-semibold tracking-tight">Code Explorer</h2><span className="text-xs px-2 py-1 rounded-full bg-zinc-900 text-white">Monaco</span><span className="text-xs text-zinc-500">Files | Code | AI Insight — PRD §37</span></div>
              <CodeExplorer projectId={projectId as string} />
            </div>
          )}
          {activeTab==='documentation' && (
            <div className="p-6 sm:p-7">
              <h2 className="text-base font-semibold tracking-tight">Documentation</h2>
              <p className="text-sm text-zinc-500 mt-1">Pilih tipe → Generate via AI (OpenRouter) → Edit dengan Markdown editor.</p>
              <div className="mt-4"><DocTypeSelector projectId={projectId as string} onGenerated={refresh} /></div>
              <div className="mt-6">
                {editingDoc ? (
                  <div>
                    <button onClick={()=>setEditingDoc(null)} className="mb-3 inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-zinc-100 border"><ArrowLeft className="w-4 h-4" /> Back to list</button>
                    <div className="mb-2 flex items-center gap-2"><h3 className="font-medium">{editingDoc.title}</h3><span className="text-xs px-2 py-1 rounded-full bg-zinc-900 text-white">{editingDoc.type}</span></div>
                    <DocEditor doc={editingDoc} projectId={projectId as string} onChanged={refresh} />
                  </div>
                ) : documentation.length>0 ? (
                  <div className="grid gap-3">{documentation.map(doc=>(
                    <div key={doc.id} className="rounded-2xl border p-4 hover:bg-zinc-50 transition">
                      <div className="flex items-start justify-between gap-3"><h3 className="font-medium text-sm leading-tight">{doc.title}</h3><span className="shrink-0 text-[11px] px-2 py-1 rounded-full bg-zinc-900 text-white">{doc.type.replaceAll('_',' ')}</span></div>
                      <p className="mt-2 text-sm text-zinc-600 line-clamp-3 leading-relaxed">{doc.content.slice(0,220)}…</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-zinc-500">Status: <span className="font-medium text-zinc-700">{doc.status}</span></span>
                        <button onClick={()=>setEditingDoc(doc)} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-medium">Edit / Preview</button>
                      </div>
                    </div>
                  ))}</div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed p-8 text-center"><FileText className="w-8 h-8 mx-auto text-zinc-400" /><p className="mt-3 text-sm font-medium">Belum ada docs</p><p className="text-xs text-zinc-500">Pilih tipe di atas lalu Generate.</p></div>
                )}
              </div>
            </div>
          )}
          {activeTab==='architecture' && (
            <div className="p-6 sm:p-7">
              <h2 className="text-base font-semibold tracking-tight">Architecture</h2><p className="text-sm text-zinc-500 mt-1">Visualisasi lengkap ada di halaman Architecture.</p>
              <Link href={`/dashboard/projects/${projectId}/architecture`} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-full text-sm font-medium">Open graph <Layers className="w-4 h-4" /></Link>
            </div>
          )}
          {activeTab==='api' && (
            <div className="p-6 sm:p-7">
              <h2 className="text-base font-semibold tracking-tight">API</h2>
              <p className="text-sm text-zinc-500 mt-1">Dokumentasi API tergenerate akan muncul di sini setelah analysis selesai.</p>
              <div className="mt-4 rounded-2xl bg-zinc-50 border p-4 text-sm text-zinc-600 whitespace-pre-wrap leading-6">{documentation.find(d=>d.type==='api') ? documentation.find(d=>d.type==='api')!.content.slice(0,1200) : 'Belum ada — Generate di tab Docs (pilih API Documentation) atau klik Re-analyze.'}</div>
              {documentation.find(d=>d.type==='api') && <button onClick={()=>{ const d=documentation.find(x=>x.type==='api')!; setEditingDoc(d); setActiveTab('documentation'); }} className="mt-3 inline-flex px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-medium">Edit API docs</button>}
            </div>
          )}
          {activeTab==='database' && (
            <div className="p-6 sm:p-7"><h2 className="text-base font-semibold tracking-tight">Database</h2><p className="text-sm text-zinc-500 mt-1">Skema & relasi akan terdeteksi dari models & migrations.</p>
              <div className="mt-4 rounded-2xl bg-zinc-50 border p-4 text-sm text-zinc-600 whitespace-pre-wrap leading-6">{documentation.find(d=>d.type==='database') ? documentation.find(d=>d.type==='database')!.content.slice(0,1200) : 'Belum ada — Generate Database Documentation di tab Docs.'}</div>
              {documentation.find(d=>d.type==='database') && <button onClick={()=>{ const d=documentation.find(x=>x.type==='database')!; setEditingDoc(d); setActiveTab('documentation'); }} className="mt-3 inline-flex px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-medium">Edit DB docs</button>}
            </div>
          )}
          {activeTab==='settings' && (
            <div className="p-6 sm:p-7">
              <h2 className="text-base font-semibold tracking-tight">Settings</h2>
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border p-4"><div className="text-sm font-medium">Project</div><div className="mt-2 text-sm text-zinc-600"><div><span className="text-zinc-500">Name:</span> {project.name}</div><div><span className="text-zinc-500">ID:</span> <span className="font-mono text-xs">{project.id}</span></div><div><span className="text-zinc-500">Created:</span> {new Date(project.created_at).toLocaleDateString('id-ID')}</div></div></div>
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4"><h4 className="font-medium text-red-800 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Danger zone</h4><p className="text-sm text-red-600 mt-1">Ketik <b>DELETE</b> untuk konfirmasi. Tidak bisa dikembalikan.</p><div className="mt-3"><DeleteProjectForm projectId={projectId!} projectName={project.name} /></div></div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
