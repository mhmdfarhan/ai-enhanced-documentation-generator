'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';
import { FileCode, Search, Sparkles, Loader2, Folder } from 'lucide-react';
const Monaco = dynamic(()=>import('@monaco-editor/react'),{ssr:false});
export function CodeExplorer({ projectId }: { projectId: string }){
  const [files,setFiles]=useState<any[]>([]);
  const [q,setQ]=useState('');
  const [selected,setSelected]=useState<any>(null);
  const [content,setContent]=useState('');
  const [symbols,setSymbols]=useState<any[]>([]);
  const [loadingFile,setLoadingFile]=useState(false);
  const [insight,setInsight]=useState('');
  const [insightLoading,setInsightLoading]=useState(false);
  useEffect(()=>{
    (async()=>{
      const { data } = await (supabase as any).from('files').select('id,path,name,language,line_count').eq('project_id',projectId).order('path').limit(500);
      setFiles((data as any[])||[]);
      if(data && (data as any[]).length) setSelected((data as any[])[0]);
    })();
  },[projectId]);
  useEffect(()=>{
    if(!selected) return;
    (async()=>{
      setLoadingFile(true); setInsight(''); setContent('');
      try{
        const res=await fetch(`/api/files/content?projectId=${projectId}&fileId=${selected.id}`);
        const j=await res.json();
        setContent(j.content||'');
        setSymbols(j.symbols||[]);
      }finally{ setLoadingFile(false); }
    })();
  },[selected,projectId]);
  const filtered = useMemo(()=> files.filter(f=> !q || f.path.toLowerCase().includes(q.toLowerCase())),[files,q]);
  const tree = useMemo(()=>{
    const root: any = {};
    for(const f of filtered){
      const parts=f.path.split('/');
      let cur=root;
      for(let i=0;i<parts.length;i++){
        const part=parts[i];
        if(i===parts.length-1){ cur[part]={__file:f}; }
        else { cur[part]=cur[part]||{}; cur=cur[part]; }
      }
    }
    return root;
  },[filtered]);
  const askInsight=async()=>{
    if(!selected) return;
    setInsightLoading(true);
    try{
      const res=await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId, question:`Jelaskan file ${selected.path}: apa tanggung jawabnya, class/function penting, dan bagaimana file ini berinteraksi dengan file lain?`, conversationId: null})});
      const j=await res.json();
      setInsight(j.response?.content || j.error || 'No insight');
    }catch(e:any){ setInsight(e.message); } finally{ setInsightLoading(false); }
  };
  const renderTree=(node:any, prefix='')=>{
    return Object.entries(node).map(([name,val]:any)=>{
      if(val.__file){
        const f=val.__file;
        const active=selected?.id===f.id;
        return <button key={f.id} onClick={()=>setSelected(f)} className={`w-full text-left flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs truncate ${active?'bg-zinc-900 text-white':'hover:bg-zinc-100 text-zinc-700'}`}><FileCode className="w-3.5 h-3.5 shrink-0" />{name}</button>
      }
      return <div key={prefix+name} className="ml-1"><div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-500"><Folder className="w-3.5 h-3.5" />{name}</div><div className="ml-3 border-l border-zinc-200 pl-1">{renderTree(val, prefix+name+'/')}</div></div>
    });
  };
  return (
    <div className="rounded-[20px] border bg-white overflow-hidden grid lg:grid-cols-[280px_1fr_320px] min-h-[560px]">
      <div className="border-r bg-zinc-50/40 flex flex-col min-h-0">
        <div className="p-3 border-b bg-white">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search files…" className="w-full pl-8 pr-3 py-2 rounded-full border bg-zinc-50 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:bg-white" />
          </div>
          <div className="mt-2 text-[11px] text-zinc-500">{filtered.length} files</div>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">{renderTree(tree)}</div>
      </div>
      <div className="flex flex-col min-h-0 border-r">
        <div className="px-3 py-2 border-b bg-zinc-50 flex items-center gap-2">
          <span className="text-xs font-mono truncate flex-1">{selected?.path || '—'}</span>
          <span className="text-[11px] px-2 py-1 rounded-full bg-zinc-900 text-white">{selected?.language || ''}</span>
        </div>
        <div className="flex-1 min-h-[420px] bg-[#1e1e1e]">
          {loadingFile ? <div className="grid place-items-center h-full text-zinc-400 text-sm"><Loader2 className="w-5 h-5 animate-spin" /> Loading…</div> :
            <Monaco height="520px" language={ (selected?.language==='typescript'?'typescript': selected?.language==='python'?'python': selected?.language==='php'?'php':'javascript') } value={content} options={{readOnly:true, minimap:{enabled:false}, fontSize:13, scrollBeyondLastLine:false}} />
          }
        </div>
        {symbols.length>0 && (
          <div className="p-2 border-t bg-zinc-50 flex flex-wrap gap-1.5 max-h-[84px] overflow-auto">
            {symbols.slice(0,20).map((s:any,i:number)=><span key={i} className="text-[11px] px-2 py-1 rounded-full bg-white border">{s.type}: {s.name} <span className="text-zinc-400">:{s.start_line}</span></span>)}
          </div>
        )}
      </div>
      <div className="flex flex-col min-h-0 bg-white">
        <div className="p-3 border-b">
          <h4 className="text-sm font-semibold flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-violet-600" /> AI Insight</h4>
          <p className="text-xs text-zinc-500">Penjelasan untuk file terpilih.</p>
          <button onClick={askInsight} disabled={!selected || insightLoading} className="mt-2 w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-full bg-zinc-900 text-white text-xs font-medium disabled:opacity-40">{insightLoading?<><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing…</>:'Explain this file'}</button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {!insight ? <div className="text-sm text-zinc-500">Pilih file di kiri lalu klik <b>Explain this file</b>. AI akan jelaskan tanggung jawab, fungsi penting, dan relasinya.</div> : <div className="prose prose-sm max-w-none prose-zinc whitespace-pre-wrap text-sm leading-6">{insight}</div>}
        </div>
      </div>
    </div>
  );
}
