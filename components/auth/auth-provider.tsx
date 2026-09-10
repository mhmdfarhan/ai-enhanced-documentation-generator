'use client';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
type User = { id: string; email: string; full_name?: string };
type AuthContextType = { user: User | null; isLoading: boolean; signIn:(e:string,p:string)=>Promise<void>; signUp:(e:string,p:string,n:string)=>Promise<void>; signOut:()=>Promise<void> };
const AuthContext = createContext<AuthContextType|undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User|null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = useMemo(()=>createClient(),[]);
  const fetchingRef = useRef(false);
  useEffect(()=>{
    let mounted=true;
    const fetchProfile=async(userId:string,email?:string,meta?:any)=>{
      if(fetchingRef.current) return null;
      fetchingRef.current=true;
      try{
        const {data:profile}=await supabase.from('profiles').select('*').eq('id',userId).maybeSingle();
        if(profile) return profile;
        const {data:ins}=await supabase.from('profiles').insert({id:userId,email:email??'',full_name:meta?.full_name??''}).select().maybeSingle();
        return ins??{id:userId,email:email??''};
      } finally{ fetchingRef.current=false; }
    };
    const init=async()=>{
      const {data:{session}}=await supabase.auth.getSession();
      if(session?.user && mounted){
        const p:any=await fetchProfile(session.user.id,session.user.email!,session.user.user_metadata);
        if(mounted) setUser(p);
      }
      if(mounted) setIsLoading(false);
    };
    init();
    const {data:{subscription}}=supabase.auth.onAuthStateChange(async(_event,session)=>{
      if(!mounted) return;
      if(session?.user){
        const p:any=await fetchProfile(session.user.id,session.user.email!,session.user.user_metadata);
        if(mounted) setUser(p);
      } else setUser(null);
      if(mounted) setIsLoading(false);
    });
    return()=>{mounted=false;subscription.unsubscribe();};
  },[supabase]);
  const signIn=async(email:string,password:string)=>{
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error) throw error;
    router.push('/dashboard');
  };
  const signUp=async(email:string,password:string,fullName:string)=>{
    const {data:authData,error:signUpError}=await supabase.auth.signUp({email,password,options:{data:{full_name:fullName}}});
    if(signUpError) throw signUpError;
    if(authData.user){
      const {error}=await supabase.from('profiles').insert({id:authData.user.id,email,full_name:fullName});
      if(error && (error as any).code!=='23505' && !String(error.message).includes('duplicate')) console.warn(error.message);
    }
    if(!authData.session) throw new Error('Cek email untuk konfirmasi, atau matikan Email Confirmations di Supabase > Auth');
    router.push('/dashboard');
  };
  const signOut=async()=>{ await supabase.auth.signOut(); router.push('/'); };
  return <AuthContext.Provider value={{user,isLoading,signIn,signUp,signOut}}>{children}</AuthContext.Provider>;
}
export function useAuth(){
  const c=useContext(AuthContext);
  if(c===undefined) throw new Error('useAuth must be used within AuthProvider');
  return c;
}
