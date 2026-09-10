import { RegisterForm } from "@/components/auth/register-form";
import { Code2, Sparkles, Boxes, Layers, FileText } from "lucide-react";
import Link from "next/link";
export default function RegisterPage(){
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_0.95fr] bg-[#fafafb]">
      <div className="hidden lg:flex flex-col relative overflow-hidden bg-zinc-900 text-white p-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-transparent" />
        <div className="absolute -right-20 -top-20 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white text-zinc-900 grid place-items-center"><Code2 className="w-5 h-5" /></div>
          <span className="font-semibold tracking-tight">graphify</span>
          <span className="text-[10px] tracking-widest uppercase px-2 py-1 rounded-full bg-white/10 border border-white/15">AI EDG</span>
        </div>
        <div className="relative mt-auto">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/10"><Sparkles className="w-3.5 h-3.5 text-violet-300" /> Create your workspace</div>
          <h2 className="mt-4 text-[32px] font-semibold tracking-tight leading-[1.1]">Start documenting<br/>at the speed of AI.</h2>
          <p className="mt-3 text-sm text-zinc-400 max-w-[420px]">Upload ZIP, generate docs, visualize architecture, and ask anything about your code.</p>
          <div className="mt-6 space-y-3 max-w-[420px]">
            {[{icon:Boxes,t:"Knowledge Graph",d:"AST + relationships"},{icon:Layers,t:"Architecture",d:"Confidence + evidence"},{icon:FileText,t:"Auto Docs",d:"Editable & exportable"}].map(r=>{ const I=r.icon; return <div key={r.t} className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-3"><div className="w-9 h-9 rounded-xl bg-white text-zinc-900 grid place-items-center"><I className="w-4 h-4" /></div><div><div className="text-sm font-medium">{r.t}</div><div className="text-xs text-zinc-400">{r.d}</div></div></div> })}
          </div>
        </div>
        <div className="relative mt-8 text-xs text-zinc-500">© 2026 graphify — AI Enhanced Documentation Generator</div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10 bg-white lg:bg-[#fafafb]">
        <div className="w-full max-w-[440px]">
          <div className="lg:hidden flex items-center gap-2 mb-8"><div className="w-8 h-8 rounded-xl bg-zinc-900 text-white grid place-items-center"><Code2 className="w-4 h-4" /></div><span className="font-semibold tracking-tight text-sm">graphify</span></div>
          <div className="rounded-[24px] bg-white border shadow-sm p-7 sm:p-8">
            <div className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-violet-600 font-medium"><span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" /> Get started free</div>
            <h1 className="mt-2 text-[22px] font-semibold tracking-tight">Create your account</h1>
            <p className="mt-1 text-sm text-zinc-500">No credit card required. 30s setup.</p>
            <div className="mt-6"><RegisterForm /></div>
          </div>
          <p className="mt-4 text-center text-xs text-zinc-400">Already have an account? <Link href="/login" className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
