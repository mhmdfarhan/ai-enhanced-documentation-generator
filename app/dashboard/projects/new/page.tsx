'use client';
import { DashboardNav } from "@/components/dashboard/nav";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Upload, Sparkles, FileStack, Shield, Boxes, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function NewProjectPage(){
  const router=useRouter(); const [isLoading,setIsLoading]=useState(false); const [error,setError]=useState<string|null>(null); const [file,setFile]=useState<File|null>(null); const [dragOver,setDragOver]=useState(false);
  const [formData,setFormData]=useState({name:'',description:'',programming_language:'',framework:''});
  const handleInputChange=(e:any)=>{ const {name,value}=e.target; setFormData(p=>({...p,[name]:value})); };
  const handleFileChange=(e:any)=>{ if(e.target.files?.[0]) setFile(e.target.files[0]); };
  const handleDrop=(e:any)=>{ e.preventDefault(); setDragOver(false); const f=e.dataTransfer.files?.[0]; if(f) setFile(f); };
  const handleSubmit=async(e:any)=>{
    e.preventDefault(); setIsLoading(true); setError(null);
    try{
      if(!file) throw new Error('Please upload a ZIP file');
      const {data:{user:authUser}}=await supabase.auth.getUser(); if(!authUser) throw new Error('Not authenticated');
      const newId=(globalThis as any).crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const {error:pe}=await supabase.from('projects').insert({id:newId,user_id:authUser.id,name:formData.name,description:formData.description||null,programming_language:formData.programming_language||null,framework:formData.framework||null}); if(pe) throw pe;
      const proj={id:newId} as any;
      const fileExt=file.name.split('.').pop(); const fileName=`${proj.id}.${fileExt}`; const filePath=`repositories/${fileName}`;
      const {error:ue}=await supabase.storage.from('repository-zips').upload(filePath,file); if(ue) throw ue;
      const {error:re}=await supabase.from('repositories').insert({project_id:proj.id,name:file.name,source:'zip_upload',zip_path:filePath,status:'pending'}); if(re) throw re;
      const {error:ae}=await supabase.from('analysis_runs').insert({project_id:proj.id,status:'pending',progress:0}); if(ae) throw ae;
      router.push(`/dashboard/projects/${proj.id}`);
    }catch(err:any){ setError(err.message||'An error occurred'); } finally{ setIsLoading(false); }
  };
  const langs=["JavaScript","TypeScript","PHP","Python","Java","C#","Go","Rust","C++","Kotlin","Dart"];
  return (
    <div className="min-h-screen bg-[#fafafb]">
      <DashboardNav />
      <main className="max-w-[960px] mx-auto px-6 py-8">
        <button onClick={()=>router.back()} className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900"><ArrowLeft className="w-4 h-4" /> Back</button>
        <div className="mt-4 rounded-[24px] bg-zinc-900 text-white p-7 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-[380px] h-[380px] bg-gradient-to-br from-violet-600/25 to-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,.06)_1px,transparent_0)] bg-[size:24px_24px] opacity-40" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/10"><Sparkles className="w-3.5 h-3.5 text-violet-300" /> New workspace</div>
            <h1 className="mt-3 text-[28px] font-semibold tracking-tight">Create project</h1>
            <p className="mt-1 text-sm text-zinc-400 max-w-[560px]">Upload ZIP repository — sistem akan extract, parse AST, build graph, dan generate docs otomatis.</p>
          </div>
        </div>

        {error&&<div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="rounded-[20px] bg-white border p-6 space-y-5">
            <h2 className="font-semibold tracking-tight">Project details</h2>
            <div>
              <label className="text-sm font-medium">Project name *</label>
              <input name="name" required value={formData.name} onChange={handleInputChange} placeholder="my-awesome-app" className="mt-1.5 w-full px-3.5 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition text-sm placeholder:text-zinc-400" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea name="description" rows={3} value={formData.description} onChange={handleInputChange} placeholder="Short description for your team…" className="mt-1.5 w-full px-3.5 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition text-sm placeholder:text-zinc-400 resize-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Language</label>
                <select name="programming_language" value={formData.programming_language} onChange={handleInputChange} className="mt-1.5 w-full px-3.5 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition text-sm">
                  <option value="">Auto-detect</option>{langs.map(l=><option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Framework</label>
                <input name="framework" value={formData.framework} onChange={handleInputChange} placeholder="Next.js / Laravel / …" className="mt-1.5 w-full px-3.5 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition text-sm placeholder:text-zinc-400" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={()=>router.back()} className="px-5 py-2.5 rounded-full border border-zinc-200 bg-white text-sm font-medium hover:bg-zinc-50">Cancel</button>
              <button type="submit" disabled={isLoading || !file} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 disabled:opacity-40">
                {isLoading?<><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>:<>Create project <Check className="w-4 h-4" /></>}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[20px] bg-white border p-6">
              <h3 className="font-semibold tracking-tight">Repository</h3>
              <p className="text-xs text-zinc-500 mt-1">ZIP max 100MB. Include source + configs.</p>
              <div onDragOver={e=>{e.preventDefault(); setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={handleDrop} className={`mt-4 rounded-2xl border-2 border-dashed p-6 text-center transition ${dragOver ? 'border-violet-400 bg-violet-50' : 'border-zinc-200 bg-zinc-50 hover:bg-white hover:border-zinc-300'}`}>
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white grid place-items-center mx-auto"><Upload className="w-6 h-6" /></div>
                <label htmlFor="file-upload" className="mt-3 inline-flex px-4 py-2 bg-zinc-900 text-white rounded-full text-sm font-medium cursor-pointer hover:bg-zinc-800">Choose file</label>
                <input id="file-upload" type="file" accept=".zip,.tar.gz,.gz" onChange={handleFileChange} className="sr-only" />
                <p className="mt-2 text-xs text-zinc-500">or drag & drop here</p>
                {file&&<div className="mt-4 inline-flex items-center gap-2 text-xs px-3 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><FileStack className="w-3.5 h-3.5" /> {file.name} · {(file.size/1024/1024).toFixed(2)} MB</div>}
              </div>
              <p className="mt-3 text-xs text-zinc-500">Hapus <code className="px-1 py-0.5 rounded bg-zinc-100">node_modules</code> / build artifacts untuk upload lebih cepat.</p>
            </div>
            <div className="rounded-[20px] bg-zinc-900 text-white p-6 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-violet-600/20 rounded-full blur-2xl" />
              <h4 className="relative font-medium flex items-center gap-2"><Shield className="w-4 h-4 text-violet-300" /> Tips</h4>
              <ul className="relative mt-3 space-y-2 text-sm text-zinc-400">
                <li className="flex gap-2"><span className="text-violet-400">•</span> Struktur repo lengkap + package manifests</li>
                <li className="flex gap-2"><span className="text-violet-400">•</span> Privacy: isolated per user (RLS)</li>
                <li className="flex gap-2"><span className="text-violet-400">•</span> Auto: parsing → graph → embedding → docs</li>
              </ul>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
