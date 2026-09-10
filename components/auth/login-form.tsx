'use client';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
export function LoginForm(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [isLoading,setIsLoading]=useState(false); const [error,setError]=useState<string|null>(null);
  const {signIn}=useAuth(); const router=useRouter();
  const handleSubmit=async(e:React.FormEvent)=>{ e.preventDefault(); setIsLoading(true); setError(null); try{ await signIn(email,password);}catch(err){ setError(err instanceof Error?err.message:'An error occurred'); } finally{ setIsLoading(false);} };
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error&&<div className="p-3.5 text-sm bg-red-50 border border-red-200 text-red-700 rounded-2xl">{error}</div>}
      <div>
        <label className="text-sm font-medium">Email</label>
        <div className="mt-1.5 relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" className="w-full pl-10 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition placeholder:text-zinc-400 text-sm" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Password</label>
        <div className="mt-1.5 relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition placeholder:text-zinc-400 text-sm" />
        </div>
      </div>
      <button type="submit" disabled={isLoading} className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-zinc-900 text-white rounded-full font-medium hover:bg-zinc-800 disabled:opacity-50 transition shadow-lg shadow-zinc-900/10">
        {isLoading?<><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>:<>Sign in <ArrowRight className="w-4 h-4" /></>}
      </button>
      <p className="text-center text-sm text-zinc-500">Don&apos;t have an account? <button type="button" onClick={()=>router.push('/register')} className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900">Create account</button></p>
    </form>
  );
}
