import { LoginForm } from "@/components/auth/login-form";
import { Code2, Sparkles, Shield, Boxes, ArrowRight } from "lucide-react";
import Link from "next/link";
export default function LoginPage(){
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_0.95fr] bg-[#fafafb]">
      <div className="hidden lg:flex flex-col relative overflow-hidden bg-zinc-900 text-white p-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-transparent" />
        <div className="absolute -right-20 -top-20 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white text-zinc-900 grid place-items-center"><Code2 className="w-5 h-5" /></div>
          <span className="font-semibold tracking-tight">graphify</span>
          <span className="text-[10px] tracking-widest uppercase px-2 py-1 rounded-full bg-white/10 border border-white/15">AI EDG</span>
        </div>
        <div className="relative mt-auto">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/10"><Sparkles className="w-3.5 h-3.5 text-violet-300" /> Trusted by modern teams</div>
          <h2 className="mt-4 text-[32px] font-semibold tracking-tight leading-[1.1]">Documentation that<br/>stays in sync<br/>with your code.</h2>
          <p className="mt-3 text-sm text-zinc-400 max-w-[420px]">Parse AST, build knowledge graph, and chat with your codebase — all with source references.</p>
          <div className="mt-6 grid grid-cols-3 gap-3 max-w-[420px]">
            {[{k:"Files",v:"1,248"},{k:"Modules",v:"42"},{k:"Coverage",v:"91%"}].map(s=><div key={s.k} className="rounded-2xl bg-white/5 border border-white/10 p-4"><div className="text-[10px] tracking-widest uppercase text-zinc-400">{s.k}</div><div className="text-lg font-semibold">{s.v}</div></div>)}
          </div>
        </div>
        <div className="relative mt-8 flex items-center gap-2 text-xs text-zinc-500"><Shield className="w-4 h-4" /> Row Level Security · pgvector · OpenRouter <span className="ml-auto">© 2026</span></div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10 bg-white lg:bg-[#fafafb]">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden flex items-center gap-2 mb-8"><div className="w-8 h-8 rounded-xl bg-zinc-900 text-white grid place-items-center"><Code2 className="w-4 h-4" /></div><span className="font-semibold tracking-tight text-sm">graphify</span></div>
          <div className="rounded-[24px] bg-white border shadow-sm p-7 sm:p-8">
            <div className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-violet-600 font-medium"><span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" /> Welcome back</div>
            <h1 className="mt-2 text-[22px] font-semibold tracking-tight">Sign in to graphify</h1>
            <p className="mt-1 text-sm text-zinc-500">Access your workspaces and AI documentation.</p>
            <div className="mt-6"><LoginForm /></div>
            <div className="mt-6 flex items-center gap-3 text-xs text-zinc-400"><span className="h-px flex-1 bg-zinc-200" /> secure <span className="h-px flex-1 bg-zinc-200" /></div>
            <p className="mt-6 text-center text-xs text-zinc-500">New here? <Link href="/register" className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4">Create account <ArrowRight className="inline w-3 h-3" /></Link></p>
          </div>
          <p className="mt-4 text-center text-xs text-zinc-400">By continuing you agree to our Terms & Privacy.</p>
        </div>
      </div>
    </div>
  );
}
