'use client';
import { DashboardNav } from "@/components/dashboard/nav";
import { supabase } from "@/lib/supabase";
import { Bot, Send, User, Sparkles, ArrowLeft, RefreshCw, Lightbulb, Layers, Shield, Boxes, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
interface Message { id:string; role:'user'|'assistant'; content:string; sources?:Array<{file:string; line?:number; content:string}>; created_at:string; }
export default function AIChatPage(){
  const { projectId } = useParams<{projectId:string}>();
  const [messages,setMessages]=useState<Message[]>([]); const [input,setInput]=useState(''); const [isLoading,setIsLoading]=useState(false); const [conversationId,setConversationId]=useState<string|null>(null); const [project,setProject]=useState<any>(null); const [loading,setLoading]=useState(true);
  const messagesEndRef=useRef<HTMLDivElement>(null); const inputRef=useRef<HTMLTextAreaElement>(null);
  const isUUID=(v:any)=>typeof v==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
  const startedRef=useRef(false);
  useEffect(()=>{ if(!isUUID(projectId) || startedRef.current) return; startedRef.current=true; let cancelled=false; (async()=>{ try{ const {data}=await supabase.from('projects').select('name').eq('id',projectId as string).maybeSingle(); if(!cancelled && data) setProject(data as any);} finally{ if(!cancelled) setLoading(false);} try{ const {data:conv}=await supabase.from('ai_conversations').insert({project_id:projectId as string,title:'New Conversation'}).select().maybeSingle(); if(!cancelled && conv) { setConversationId((conv as any).id); setMessages([]);} }catch{} })(); if(inputRef.current) inputRef.current.focus(); return()=>{cancelled=true;}; },[projectId]);
  useEffect(()=>{ messagesEndRef.current?.scrollIntoView({behavior:'smooth'}); },[messages]);
  const startNewConversation=async()=>{ if(!projectId) return; const {data:conv}=await supabase.from('ai_conversations').insert({project_id:projectId as string,title:'New Conversation'}).select().maybeSingle(); if(conv){ setConversationId((conv as any).id); setMessages([]);} };
  const handleSendMessage=async()=>{
    if(!input.trim() || isLoading || !conversationId) return;
    const userMessage=input.trim(); setInput(''); setIsLoading(true);
    const userMsg:Message={id:Date.now().toString(),role:'user',content:userMessage,created_at:new Date().toISOString()};
    setMessages(prev=>[...prev,userMsg]);
    try{
      const res=await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId,question:userMessage,conversationId})});
      if(!res.ok) throw new Error('Failed');
      const data=await res.json();
      const aiMsg:Message={id:(Date.now()+1).toString(),role:'assistant',content:data.response.content,sources:data.response.sources,created_at:new Date().toISOString()};
      setMessages(prev=>[...prev,aiMsg]);
    }catch{ setMessages(prev=>[...prev,{id:(Date.now()+2).toString(),role:'assistant',content:'Maaf, terjadi error. Coba lagi.',created_at:new Date().toISOString()} as Message]); } finally{ setIsLoading(false); }
  };
  const handleKeyDown=(e:any)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); handleSendMessage(); } };
  if(loading) return <div className="min-h-screen bg-[#fafafb]"><DashboardNav/><div className="max-w-[1200px] mx-auto px-6 py-8"><div className="animate-pulse rounded-[24px] bg-white border h-[640px]" /></div></div>;
  if(!isUUID(projectId)) return <div className="min-h-screen bg-[#fafafb]"><DashboardNav/><div className="max-w-[1200px] mx-auto px-6 py-10 text-center"><div className="rounded-[24px] bg-white border p-10"><h2 className="font-semibold">Invalid project</h2><p className="text-sm text-zinc-500">ID tidak valid: {String(projectId)}</p><Link href="/dashboard" className="mt-4 inline-flex px-5 py-2.5 bg-zinc-900 text-white rounded-full text-sm">Back</Link></div></div></div>;
  return (
    <div className="min-h-screen bg-[#fafafb]">
      <DashboardNav />
      <main className="max-w-[1200px] mx-auto px-6 py-6">
        <div className="flex items-center gap-2 text-sm">
          <Link href={`/dashboard/projects/${projectId}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border text-zinc-600 hover:bg-zinc-50"><ArrowLeft className="w-4 h-4" /> Back</Link>
          <span className="text-zinc-300">/</span>
          <span className="font-medium tracking-tight flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-violet-600" /> AI Assistant</span>
          <span className="text-zinc-500">· {project?.name || 'Workspace'}</span>
          <button onClick={startNewConversation} className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800"><RefreshCw className="w-4 h-4" /> New chat</button>
        </div>

        <div className="mt-4 grid lg:grid-cols-[1fr_340px] gap-6">
          <div className="rounded-[24px] bg-white border overflow-hidden flex flex-col h-[640px] shadow-sm">
            <div className="px-5 py-3 border-b bg-zinc-50/60 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-violet-600 text-white grid place-items-center"><Bot className="w-4 h-4" /></div>
              <div><div className="text-sm font-medium leading-none">graphify AI</div><div className="text-xs text-zinc-500">RAG · pgvector · source references</div></div>
              <span className="ml-auto text-[11px] tracking-widest uppercase px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Live</span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-white to-zinc-50/40">
              {messages.length===0 ? (
                <div className="py-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white grid place-items-center mx-auto"><Sparkles className="w-7 h-7" /></div>
                  <h3 className="mt-4 font-semibold tracking-tight">Tanya apapun tentang codebase</h3>
                  <p className="mt-1 text-sm text-zinc-500 max-w-[480px] mx-auto">AI akan jawab dengan konteks dari graph & vector search, lengkap dengan file & line references.</p>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-[560px] mx-auto text-left">
                    {[
                      {t:"Jelaskan arsitektur project ini",d:"Pattern + flow utama"},
                      {t:"Bagaimana auth bekerja?",d:"Flow login → middleware"},
                      {t:"Sebutkan endpoint API utama",d:"List routes & handlers"},
                      {t:"Tampilkan relasi database",d:"Tables & foreign keys"},
                    ].map(s=>(
                      <button key={s.t} onClick={()=>setInput(s.t)} className="text-left p-4 rounded-2xl bg-white border hover:border-zinc-300 hover:shadow-sm transition">
                        <div className="text-sm font-medium">{s.t}</div><div className="text-xs text-zinc-500">{s.d}</div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200"><Lightbulb className="w-3.5 h-3.5" /> Tips: sebutkan nama file/service untuk hasil lebih akurat</div>
                </div>
              ) : (
                messages.map(m=>(
                  <div key={m.id} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
                    <div className={`max-w-[78%] rounded-[20px] px-4 py-3 ${m.role==='user' ? 'bg-zinc-900 text-white rounded-br-[8px]' : 'bg-white border border-zinc-200 rounded-bl-[8px] shadow-sm'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-6 h-6 rounded-full grid place-items-center ${m.role==='user'?'bg-white/15':'bg-zinc-900 text-white'}`}>{m.role==='user'?<User className="w-3.5 h-3.5" />:<Bot className="w-3.5 h-3.5" />}</span>
                        <span className={`text-xs font-medium ${m.role==='user'?'text-zinc-300':'text-zinc-500'}`}>{m.role==='user'?'You':'graphify'}</span>
                        <span className={`ml-auto text-[11px] ${m.role==='user'?'text-zinc-400':'text-zinc-400'}`}>{new Date(m.created_at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</span>
                      </div>
                      <div className={`whitespace-pre-wrap text-sm leading-6 ${m.role==='user'?'text-white':'text-zinc-700'}`}>{m.content}</div>
                      {m.role==='assistant' && m.sources && m.sources.length>0 && (
                        <div className="mt-3 pt-3 border-t border-zinc-100">
                          <div className="text-[11px] tracking-widest uppercase font-medium text-zinc-500 mb-2">Sources</div>
                          <div className="space-y-2">
                            {m.sources.map((s,i)=>(
                              <div key={i} className="rounded-2xl bg-zinc-50 border p-3">
                                <div className="text-xs font-medium font-mono">{s.file}{s.line?`:${s.line}`:''}</div>
                                <div className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{s.content}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t bg-white">
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Tanya tentang codebase… (Enter kirim, Shift+Enter baris baru)" rows={2} className="w-full px-4 py-3 pr-4 bg-zinc-50 border border-zinc-200 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition text-sm resize-none placeholder:text-zinc-400" />
                </div>
                <button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="shrink-0 w-11 h-11 rounded-full bg-zinc-900 text-white grid place-items-center hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed shadow">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-400">
                <Shield className="w-3 h-3" /> Jawaban berbasis retrieved context — tidak mengarang.
                <span className="ml-auto hidden sm:inline">⌘ + Enter untuk kirim</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[20px] bg-zinc-900 text-white p-5 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-violet-600/20 rounded-full blur-2xl" />
              <h3 className="relative font-medium flex items-center gap-2"><Boxes className="w-4 h-4 text-violet-300" /> Workspace</h3>
              <div className="relative mt-3 text-sm"><div className="font-medium">{project?.name || '—'}</div><div className="text-xs text-zinc-400">RAG siap · tanya dengan bahasa natural</div></div>
              <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3"><div className="text-[10px] tracking-widest uppercase text-zinc-400">Chat</div><div className="font-semibold">{messages.filter(m=>m.role==='user').length}</div></div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3"><div className="text-[10px] tracking-widest uppercase text-zinc-400">Sources</div><div className="font-semibold">{messages.reduce((a,m)=>a+(m.sources?.length||0),0)}</div></div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3"><div className="text-[10px] tracking-widest uppercase text-zinc-400">Model</div><div className="font-semibold text-xs">OpenRouter</div></div>
              </div>
              <Link href={`/dashboard/projects/${projectId}`} className="relative mt-4 inline-flex w-full justify-center py-2.5 rounded-full bg-white text-zinc-900 text-sm font-medium">View overview</Link>
            </div>

            <div className="rounded-[20px] bg-white border p-5">
              <h4 className="font-medium flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500" /> Coba tanyakan</h4>
              <div className="mt-3 grid gap-2">
                {[
                  "Module apa yang bergantung pada UserService?",
                  "Jelaskan flow attendance creation",
                  "Apakah ada circular dependency?",
                  "Jika UserService diubah, apa yang terdampak?",
                ].map(q=>(
                  <button key={q} onClick={()=>setInput(q)} className="text-left px-3 py-2.5 rounded-2xl bg-zinc-50 border hover:bg-white hover:border-zinc-300 text-sm transition">{q}</button>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] bg-white border p-5">
              <h4 className="font-medium flex items-center gap-2"><Layers className="w-4 h-4 text-blue-600" /> Stack</h4>
              <p className="text-sm text-zinc-500 mt-2">Next.js · Supabase + pgvector · Tree-sitter · OpenRouter · React Flow</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
