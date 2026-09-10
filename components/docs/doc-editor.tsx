'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, RefreshCw, Copy, Download, Search, Eye, Edit3, Check } from 'lucide-react';
export function DocEditor({ doc, projectId, onChanged }: { doc: { id:string; title:string; type:string; content:string }; projectId:string; onChanged?:()=>void }){
  const [content,setContent]=useState(doc.content);
  const [preview,setPreview]=useState(false);
  const [saving,setSaving]=useState(false);
  const [regen,setRegen]=useState(false);
  const [q,setQ]=useState('');
  const [copied,setCopied]=useState(false);
  const handleSave=async()=>{
    setSaving(true);
    try{
      const { error } = await (supabase as any).from('documentation').update({ content, updated_at: new Date().toISOString(), status:'edited' }).eq('id', doc.id);
      if(error) throw error;
      await (supabase as any).from('documentation_versions').insert({ documentation_id: doc.id, content, version: Date.now() });
      onChanged?.();
    }catch(e:any){ alert(e.message); } finally{ setSaving(false); }
  };
  const handleRegen=async()=>{
    setRegen(true);
    try{
      const res=await fetch('/api/docs/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId, types:[doc.type]})});
      const j=await res.json();
      if(!res.ok) throw new Error(j.error||'failed');
      const { data } = await (supabase as any).from('documentation').select('content').eq('id',doc.id).maybeSingle();
      if(data?.content) setContent(data.content);
      onChanged?.();
    }catch(e:any){ alert(e.message); } finally{ setRegen(false); }
  };
  const handleCopy=async()=>{ await navigator.clipboard.writeText(content); setCopied(true); setTimeout(()=>setCopied(false),1500); };
  const handleExport=()=>{
    const blob=new Blob([content],{type:'text/markdown'}); const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download=`${doc.type}.md`; a.click(); URL.revokeObjectURL(url);
  };
  const highlight=(t:string)=> q? t.replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`,'gi'), '<<<$1>>>') : t;
  const display= highlight(content);
  return (
    <div className="rounded-[20px] border bg-white overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-3 border-b bg-zinc-50/60">
        <div className="flex items-center gap-1.5">
          <button onClick={()=>setPreview(false)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${!preview?'bg-zinc-900 text-white border-zinc-900':'bg-white border-zinc-200'}`}><Edit3 className="w-3.5 h-3.5" /> Edit</button>
          <button onClick={()=>setPreview(true)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${preview?'bg-zinc-900 text-white border-zinc-900':'bg-white border-zinc-200'}`}><Eye className="w-3.5 h-3.5" /> Preview</button>
        </div>
        <div className="flex items-center gap-1.5 relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5" />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search in doc…" className="pl-8 pr-3 py-1.5 rounded-full border bg-white text-xs w-[160px] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={handleCopy} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border bg-white text-xs hover:bg-zinc-50"><Copy className="w-3.5 h-3.5" />{copied?'Copied':'Copy'}</button>
          <button onClick={handleExport} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border bg-white text-xs hover:bg-zinc-50"><Download className="w-3.5 h-3.5" /> Export</button>
          <button onClick={handleRegen} disabled={regen} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border text-xs hover:bg-zinc-50 disabled:opacity-50"><RefreshCw className={`w-3.5 h-3.5 ${regen?'animate-spin':''}`} /> Regenerate</button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 disabled:opacity-50"><Save className="w-3.5 h-3.5" />{saving?'Saving…':'Save'}</button>
        </div>
      </div>
      {!preview ? (
        <textarea value={content} onChange={e=>setContent(e.target.value)} className="w-full min-h-[420px] p-4 font-mono text-sm leading-6 focus:outline-none resize-y" placeholder="Markdown…" />
      ) : (
        <div className="p-5 prose prose-sm max-w-none prose-zinc">
          <div className="whitespace-pre-wrap text-sm leading-6 text-zinc-800">{display.split('<<<').map((part,i)=> i===0? part : (()=>{ const [hl,rest]=part.split('>>>'); return <span key={i}><mark className="bg-yellow-200 px-0.5 rounded">{hl}</mark>{rest}</span> as any })())}</div>
        </div>
      )}
      {copied && <div className="px-4 py-2 bg-emerald-50 border-t text-xs text-emerald-700 flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Copied to clipboard</div>}
    </div>
  );
}
export function DocTypeSelector({ projectId, onGenerated }: { projectId:string; onGenerated:()=>void }){
  const TYPES=[{id:'project_overview',label:'Project Overview'},{id:'architecture',label:'Architecture'},{id:'module',label:'Modules'},{id:'api',label:'API Documentation'},{id:'database',label:'Database'},{id:'developer_guide',label:'Developer Guide'},{id:'setup_guide',label:'Setup Guide'}] as const;
  const [sel,setSel]=useState<Record<string,boolean>>({project_overview:true,architecture:true,api:true,database:true});
  const [loading,setLoading]=useState(false);
  const gen=async()=>{
    const types=Object.keys(sel).filter(k=>sel[k]);
    if(types.length===0) return;
    setLoading(true);
    try{ const r=await fetch('/api/docs/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId,types})}); const j=await r.json(); if(!r.ok) throw new Error(j.error); onGenerated(); }catch(e:any){ alert(e.message);} finally{ setLoading(false); }
  };
  return (
    <div className="rounded-[20px] bg-white border p-5">
      <h3 className="font-semibold tracking-tight text-sm">Generate Documentation</h3>
      <p className="text-xs text-zinc-500 mt-1">Pilih tipe, lalu generate via AI (OpenRouter). Sudah ada akan di-update.</p>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {TYPES.map(t=>(
          <label key={t.id} className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border cursor-pointer transition ${sel[t.id]?'bg-zinc-900 text-white border-zinc-900':'bg-zinc-50 border-zinc-200 hover:bg-white'}`}>
            <input type="checkbox" checked={!!sel[t.id]} onChange={e=>setSel(s=>({...s,[t.id]:e.target.checked}))} className="accent-zinc-900" />
            <span className="text-sm font-medium">{t.label}</span>
          </label>
        ))}
      </div>
      <button onClick={gen} disabled={loading} className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 disabled:opacity-50">{loading?'Generating…':'Generate Documentation'}</button>
    </div>
  );
}
