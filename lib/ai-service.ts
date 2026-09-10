import { aiProvider } from '@/lib/ai-provider';
export interface AIResponse { content: string; sources: Array<{file:string; line?:number; content:string}>; confidence:number }
export interface ChatMessage { role:'user'|'assistant'|'system'; content:string }
export class AIService {
  private model = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';
  async generateDocumentation(context: string, docType: 'project_overview'|'architecture'|'api'|'database'|'module'|'developer_guide'|'setup_guide'): Promise<string>{
    const prompts: Record<string,string>={
      project_overview:`Generate comprehensive project overview. Include: 1. Description & purpose 2. Tech stack 3. Architecture overview 4. Main modules 5. Key features\n\nContext:\n${context}\n\nReturn well-formatted markdown.`,
      architecture:`Analyze codebase and provide architecture docs. Include: 1. Pattern (MVC/Layered/etc with confidence) 2. Components 3. Data flow 4. Dependencies 5. Design patterns\n\nContext:\n${context}\n\nMarkdown only.`,
      api:`Generate API documentation. Include: endpoints, HTTP methods, params, auth, request/response examples\n\nContext:\n${context}\nMarkdown.`,
      database:`Generate Database documentation. Include: tables, columns, relationships, indexes, foreign keys inferred from models/migrations\n\nContext:\n${context}\nMarkdown.`,
      module:`Generate Module documentation. Include: responsibilities, components, dependencies, important functions per module\n\nContext:\n${context}\nMarkdown.`,
      developer_guide:`Generate Developer Guide. Include: setup, project structure, coding conventions, how to contribute\n\nContext:\n${context}\nMarkdown.`,
      setup_guide:`Generate Setup Guide. Include: prerequisites, installation steps, env vars, how to run & test\n\nContext:\n${context}\nMarkdown.`,
    };
    const prompt = prompts[docType] || prompts.project_overview;
    try{
      const c = await aiProvider.chat(this.model, [{role:'system',content:'You are an expert software documentation writer. Be accurate, structured, and cite files when possible. If evidence insufficient, say "insufficient evidence".'}, {role:'user',content:prompt}], {temperature:0.3,max_tokens:2200});
      return c || `# ${docType} Documentation\n\nUnable to generate.`;
    }catch(e){ console.error(e); return `# ${docType.replaceAll('_',' ')} Documentation\n\nUnable to generate at this time.`; }
  }
  async chatWithCodebase(question:string, context:string[], history:ChatMessage[]=[]): Promise<AIResponse>{
    const systemPrompt=`You are an expert codebase assistant. ONLY use provided context. Cite file:line. If not found, say "I couldn't find specific information about this in the analyzed codebase." Be concise, markdown.\n\nContext snippets:\n${context.map((c,i)=>`[${i+1}] ${c}`).join('\n\n')}`;
    try{
      const content = await aiProvider.chat(this.model, [{role:'system',content:systemPrompt}, ...history, {role:'user',content:question}], {temperature:0.2,max_tokens:1600});
      const sources=this.extractSources(content||'',context);
      return { content: content||'No response', sources, confidence: this.calcConfidence(content||'',context)};
    }catch(e){ console.error(e); return { content:'Sorry, error processing question.', sources:[], confidence:0 }; }
  }
  private extractSources(content:string, context:string[]): AIResponse['sources']{
    const sources:AIResponse['sources']=[]; const re=/\[(\d+)\]/g; const matches=content.match(re);
    if(!matches) return [];
    const seen=new Set<number>();
    for(const m of matches){
      const n=parseInt(m.replace(/\D/g,'')); if(seen.has(n)||n<1||n>context.length) continue; seen.add(n);
      const t=context[n-1]; const fm=t.match(/File:\s*(.+?)(?:\n|$)/); const lm=t.match(/Lines?:\s*(\d+)/i);
      sources.push({ file: fm?fm[1].trim():`Context ${n}`, line: lm?parseInt(lm[1]):undefined, content: t.slice(0,220)+'...' });
    }
    return sources;
  }
  private calcConfidence(content:string, ctx:string[]): number{
    let c=70; const u=["i don't know","i'm not sure","couldn't find","unclear","unknown","probably","might be"]; const low=content.toLowerCase();
    for(const p of u) if(low.includes(p)) c-=10;
    if(content.includes('[')&&content.includes(']')) c+=15;
    if(content.includes('```')) c+=10;
    return Math.max(0,Math.min(100,c));
  }
  async analyzeArchitecture(codeContext:string, symbols:Array<{name:string;type:string}>): Promise<{pattern:string;confidence:number;evidence:string[];description:string}>{
    const prompt=`Analyze codebase and determine architecture pattern from [MVC, Layered, Microservices, Monolith, REST API, Clean, Hexagonal, Event-driven].\n\nContext: ${codeContext}\nSymbols: ${JSON.stringify(symbols.slice(0,20),null,2)}\n\nReturn JSON: {"pattern":string,"confidence":number,"evidence":[string],"description":string}`;
    try{
      const raw=await aiProvider.chat(this.model, [{role:'system',content:'You are expert software architect. Return JSON only.'},{role:'user',content:prompt}], {temperature:0.1,max_tokens:800,jsonMode:true} as any);
      const r=JSON.parse(raw||'{}'); return { pattern:r.pattern||'UNKNOWN', confidence:r.confidence||0, evidence:r.evidence||['Insufficient evidence'], description:r.description||'Unable to analyze.' };
    }catch{ return { pattern:'UNKNOWN', confidence:0, evidence:['Error during analysis'], description:'Failed' }; }
  }
}
