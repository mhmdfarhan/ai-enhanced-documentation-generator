'use client';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
export function RegisterForm(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [confirmPassword,setConfirmPassword]=useState(''); const [fullName,setFullName]=useState(''); const [isLoading,setIsLoading]=useState(false); const [error,setError]=useState<string|null>(null);
  const {signUp}=useAuth(); const router=useRouter();
  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault();
    if(password!==confirmPassword){ setError('Passwords do not match'); return; }
    if(password.length<6){ setError('Password must be at least 6 characters'); return; }
    setIsLoading(true); setError(null);
    try{ await signUp(email,password,fullName);}catch(err){ setError(err instanceof Error?err.message:'An error occurred'); } finally{ setIsLoading(false); }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error&&<div className="p-3.5 text-sm bg-red-50 border border-red-200 text-red-700 rounded-2xl">{error}</div>}
      <div>
        <label className="text-sm font-medium">Full name</label>
        <div className="mt-1.5 relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input required value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Ada Lovelace" className="w-full pl-10 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition text-sm placeholder:text-zinc-400" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Email</label>
        <div className="mt-1.5 relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" className="w-full pl-10 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition text-sm placeholder:text-zinc-400" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Password</label>
          <div className="mt-1.5 relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition text-sm" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Confirm</label>
          <div className="mt-1.5 relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input type="password" required value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition text-sm" />
          </div>
        </div>
      </div>
      <p className="text-xs text-zinc-500">Min 6 characters. By continuing you agree to our Terms.</p>
      <button type="submit" disabled={isLoading} className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-zinc-900 text-white rounded-full font-medium hover:bg-zinc-800 disabled:opacity-50 transition shadow-lg shadow-zinc-900/10">
        {isLoading?<><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>:<>Create account <ArrowRight className="w-4 h-4" /></>}
      </button>
      <p className="text-center text-sm text-zinc-500">Already have an account? <button type="button" onClick={()=>router.push('/login')} className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900">Sign in</button></p>
    </form>
  );
}
