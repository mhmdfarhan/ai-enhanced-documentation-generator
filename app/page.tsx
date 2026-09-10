import { ArrowRight, Code2, FileText, Layers, Sparkles, Zap, Shield, Cpu, GitBranch, Search, Box } from "lucide-react";
import Link from "next/link";
export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafb] text-zinc-900 selection:bg-violet-200">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-white" />
        <div className="absolute inset-0 grid-pattern opacity-[0.6]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-violet-100/40 via-indigo-50/20 to-transparent blur-3xl" />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-gradient-to-br from-violet-200/30 to-indigo-200/20 rounded-full blur-[80px]" />
        <div className="absolute top-[40%] left-[5%] w-[500px] h-[500px] bg-gradient-to-br from-blue-100/20 to-cyan-100/20 rounded-full blur-[80px]" />
      </div>
      <header className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/70 backdrop-blur-2xl">
        <nav className="max-w-[1200px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center shadow-lg">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold tracking-tight text-[15px]">graphify</span>
            <span className="hidden sm:inline-flex ml-2 text-[11px] font-medium tracking-widest uppercase px-2 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-200">AI EDG</span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-sm">
            <a href="#features" className="px-3 py-2 rounded-full hover:bg-zinc-100 transition">Features</a>
            <a href="#how" className="px-3 py-2 rounded-full hover:bg-zinc-100 transition">How it works</a>
            <a href="#stack" className="px-3 py-2 rounded-full hover:bg-zinc-100 transition">Stack</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex px-4 py-2 text-sm font-medium rounded-full hover:bg-zinc-100 transition">Sign in</Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition shadow-sm">Get started <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
        </nav>
      </header>

      <main className="max-w-[1200px] mx-auto px-6">
        <section className="pt-16 pb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200 shadow-sm text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium tracking-wide">AI Knowledge Graph</span>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-500">Tree-sitter + pgvector + RAG</span>
          </div>
          <h1 className="mt-8 text-[42px] sm:text-[56px] lg:text-[64px] font-[700] tracking-[-0.04em] leading-[0.95] max-w-[900px] mx-auto">
            Turn any codebase
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">into living docs</span>
          </h1>
          <p className="mt-6 text-[17px] leading-7 text-zinc-500 max-w-[640px] mx-auto">
            Upload ZIP, auto-parse dengan AST, build knowledge graph, generate embedding, dan tanya apapun tentang kodemu — dengan source references.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-zinc-900 text-white rounded-full font-medium hover:bg-zinc-800 transition shadow-lg shadow-zinc-900/10">Start free <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/dashboard" className="inline-flex items-center justify-center px-7 py-3 bg-white border border-zinc-200 rounded-full font-medium hover:bg-zinc-50 transition">View dashboard</Link>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Row Level Security</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> RAG + pgvector</span>
            <span>•</span>
            <span>No credit card</span>
          </div>
        </section>

        <section className="pb-16">
          <div className="relative rounded-[24px] overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-blue-600/10" />
            <div className="relative flex items-center gap-1.5 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
              <div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-yellow-500" /><div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-3 text-xs text-zinc-500 font-mono">graphify — analysis pipeline</span>
              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">● Live</span>
            </div>
            <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-0">
              <div className="p-6 sm:p-8 font-mono text-xs leading-6">
                <div className="text-zinc-500">➜ Upload ZIP · Extract · Scan · Parse AST</div>
                <div className="mt-4 space-y-1">
                  <div><span className="text-zinc-600">scanning</span> <span className="text-emerald-400">✓ 1,248 files</span> <span className="text-zinc-600">·</span> <span className="text-violet-400">342 classes</span></div>
                  <div><span className="text-zinc-600">graph</span> <span className="text-blue-400">42 modules</span> <span className="text-zinc-600">·</span> <span className="text-amber-400">87 endpoints</span></div>
                  <div><span className="text-zinc-600">arch</span> <span className="text-white">Layered Architecture</span> <span className="px-1.5 py-0.5 rounded bg-violet-500 text-white text-[10px]">92% confidence</span></div>
                </div>
                <div className="mt-6 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                  <div className="text-zinc-400">Q: Bagaimana flow user login?</div>
                  <div className="mt-2 text-zinc-300">→ AuthController:42 → AuthService:18 → UserRepository → Model → DB <span className="text-emerald-400">+ sources</span></div>
                </div>
              </div>
              <div className="border-t lg:border-t-0 lg:border-l border-zinc-800 p-6 bg-gradient-to-br from-zinc-900 to-zinc-950">
                <div className="grid grid-cols-3 gap-3">
                  {[{k:"Files",v:"1,248",c:"text-blue-400"},{k:"Modules",v:"42",c:"text-violet-400"},{k:"Coverage",v:"91%",c:"text-emerald-400"},].map(s=><div key={s.k} className="rounded-2xl bg-white/[0.06] border border-white/10 p-4 text-center"><div className="text-[11px] tracking-widest uppercase text-zinc-500">{s.k}</div><div className={`text-xl font-semibold ${s.c}`}>{s.v}</div></div>)}
                </div>
                <div className="mt-4 rounded-2xl bg-white p-4 border">
                  <div className="text-xs font-semibold tracking-widest uppercase text-zinc-500">Generated Docs</div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between"><span>Project Overview</span><span className="text-emerald-600 text-xs">● done</span></div>
                    <div className="flex justify-between"><span>API Documentation</span><span className="text-emerald-600 text-xs">● done</span></div>
                    <div className="flex justify-between"><span>Architecture</span><span className="text-amber-600 text-xs">● 82%</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="pb-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex px-3 py-1 rounded-full bg-zinc-900 text-white text-xs tracking-widest uppercase">Features</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Everything for codebase intelligence</h2>
            <p className="mt-3 text-zinc-500">Code parsing, graph, vector search, dan LLM — dalam satu platform.</p>
          </div>
          <div className="mt-8 grid md:grid-cols-12 gap-4">
            <div className="md:col-span-7 rounded-[20px] bg-white border p-6">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center"><Search className="w-5 h-5 text-white" /></div>
              <h3 className="mt-4 font-semibold">Code Knowledge Graph</h3>
              <p className="mt-2 text-sm text-zinc-500">AST → symbols → relationships (IMPORTS, CALLS, EXTENDS). Visual dengan React Flow.</p>
              <div className="mt-4 flex gap-2 text-xs"><span className="px-2 py-1 rounded-full bg-zinc-100">Tree-sitter</span><span className="px-2 py-1 rounded-full bg-zinc-100">Dependency Graph</span></div>
            </div>
            <div className="md:col-span-5 rounded-[20px] bg-zinc-900 text-white p-6 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-violet-600/30 rounded-full blur-2xl" />
              <Sparkles className="w-8 h-8 text-violet-400" />
              <h3 className="mt-4 font-semibold">RAG + Chat</h3>
              <p className="mt-2 text-sm text-zinc-400">Tanya codebase, jawab dengan source references. Tidak mengarang.</p>
            </div>
            <div className="md:col-span-5 rounded-[20px] bg-white border p-6">
              <Layers className="w-8 h-8 text-blue-600" />
              <h3 className="mt-4 font-semibold">Architecture Detection</h3>
              <p className="mt-2 text-sm text-zinc-500">MVC, Layered, REST, Microservices — dengan confidence & evidence.</p>
            </div>
            <div className="md:col-span-7 rounded-[20px] bg-gradient-to-br from-violet-600 to-indigo-600 text-white p-6">
              <FileText className="w-8 h-8" />
              <h3 className="mt-4 font-semibold">Auto Documentation</h3>
              <p className="mt-2 text-sm text-violet-100">Overview, Architecture, API, DB, Module — via OpenRouter, editable & exportable.</p>
            </div>
          </div>
        </section>

        <section id="how" className="pb-16">
          <div className="rounded-[24px] bg-white border p-8">
            <h2 className="text-center text-2xl font-semibold tracking-tight">How it works</h2>
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              {[{n:1,t:"Upload ZIP",d:"Drag & drop repo. Auto extract & scan."},{n:2,t:"AI Analysis",d:"Parse, graph, embedding, arch detection."},{n:3,t:"Docs & Chat",d:"Generate docs & chat with sources."}].map(s=><div key={s.n} className="text-center rounded-2xl border bg-zinc-50 p-6"><div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center mx-auto font-semibold">{s.n}</div><h3 className="mt-3 font-semibold">{s.t}</h3><p className="mt-1 text-sm text-zinc-500">{s.d}</p></div>)}
            </div>
          </div>
        </section>

        <section id="stack" className="pb-8">
          <h2 className="text-center text-sm font-semibold tracking-widest uppercase text-zinc-500">Supported Languages</h2>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["JavaScript","TypeScript","PHP","Python","Java","C#","Go","Rust","C++","Kotlin","Dart"].map(l=><span key={l} className="px-3 py-1.5 rounded-full bg-white border text-sm">{l}</span>)}
          </div>
          <div className="mt-8 rounded-[24px] bg-zinc-900 text-white p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div><h3 className="text-xl font-semibold">Siap ubah onboarding dari hari ke menit?</h3><p className="text-zinc-400 text-sm mt-1">Gratis untuk mulai. Tanpa kartu kredit.</p></div>
            <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-zinc-900 rounded-full font-medium">Start free <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </section>
      </main>
      <footer className="border-t mt-8 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-col md:flex-row justify-between gap-4 text-sm text-zinc-500">
          <span className="flex items-center gap-2"><span className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center"><Code2 className="w-3.5 h-3.5 text-white" /></span> graphify — AI EDG © 2026</span>
          <span>Supabase + pgvector · OpenRouter · Tree-sitter · Next.js 16</span>
        </div>
      </footer>
    </div>
  );
}
