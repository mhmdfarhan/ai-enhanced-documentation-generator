export interface ChatMessage { role: 'user'|'assistant'|'system'; content: string }
export interface AIProvider {
  name: string
  chat(model: string, messages: ChatMessage[], opts?: { temperature?: number; max_tokens?: number; jsonMode?: boolean }): Promise<string>
  embedding?(text: string): Promise<number[]>
}
import OpenAI from 'openai'
export class OpenRouterProvider implements AIProvider {
  name = 'openrouter'
  private client: OpenAI
  constructor(){
    this.client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY || 'dummy',
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: { 'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', 'X-Title': 'graphify' } as any,
    })
  }
  async chat(model: string, messages: ChatMessage[], opts?: any): Promise<string>{
    const res = await this.client.chat.completions.create({
      model,
      messages: messages as any,
      temperature: opts?.temperature ?? 0.3,
      max_tokens: opts?.max_tokens ?? 2000,
      ...(opts?.jsonMode ? { response_format: { type: 'json_object' } as any } : {}),
    })
    return res.choices[0]?.message?.content || ''
  }
  async embedding(text: string): Promise<number[]>{
    try{
      const r = await (this.client as any).embeddings.create({ model: 'text-embedding-3-small', input: text })
      return r.data[0]?.embedding || fallbackEmbedding(text)
    }catch{ return fallbackEmbedding(text) }
  }
}
export class OpenAIProvider implements AIProvider {
  name='openai'
  private c: OpenAI
  constructor(apiKey: string){ this.c=new OpenAI({apiKey}) }
  async chat(m:string,msgs:ChatMessage[],o?:any){ const r=await this.c.chat.completions.create({model:m,messages:msgs as any,temperature:o?.temperature??0.3,max_tokens:o?.max_tokens??2000}); return r.choices[0]?.message?.content||'' }
}
export class AnthropicProvider implements AIProvider { name='anthropic'; async chat(_m:string,_msgs:ChatMessage[],_o?:any): Promise<string>{ throw new Error('Anthropic not configured') } }
export class GeminiProvider implements AIProvider { name='gemini'; async chat(_m:string,_msgs:ChatMessage[],_o?:any): Promise<string>{ throw new Error('Gemini not configured') } }
export class LocalLLMProvider implements AIProvider { name='local'; async chat(_m:string,_msgs:ChatMessage[],_o?:any): Promise<string>{ throw new Error('Local LLM not configured') } }
export function getAIProvider(): AIProvider {
  const p = (process.env.AI_PROVIDER || 'openrouter').toLowerCase()
  if(p==='openai' && process.env.OPENAI_API_KEY) return new OpenAIProvider(process.env.OPENAI_API_KEY)
  if(p==='anthropic') return new AnthropicProvider()
  if(p==='gemini') return new GeminiProvider()
  if(p==='local') return new LocalLLMProvider()
  return new OpenRouterProvider()
}
function fallbackEmbedding(text:string): number[]{
  const emb=new Array(1536).fill(0)
  for(const w of text.toLowerCase().split(/\s+/)){
    let h=0; for(let i=0;i<w.length;i++){ h=((h<<5)-h)+w.charCodeAt(i); h|=0 }
    emb[Math.abs(h)%emb.length]+=0.1
  }
  const mag=Math.sqrt(emb.reduce((s,v)=>s+v*v,0))
  return mag>0? emb.map(v=>v/mag): emb
}
export const aiProvider = getAIProvider()
