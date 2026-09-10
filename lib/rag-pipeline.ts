import { createAdminClient } from '@/lib/supabase';
import { aiProvider } from '@/lib/ai-provider';
const supabase = createAdminClient();
export interface Chunk { id: string; content: string; file: string; line: number; symbol: string | null; metadata: Record<string, any>; }
export class RAGPipeline {
  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const p: any = aiProvider as any;
      if (p.embedding) return await p.embedding(text);
    } catch {}
    return this.fallbackEmbedding(text);
  }
  private fallbackEmbedding(text: string): number[] {
    const emb = new Array(1536).fill(0);
    for (const w of text.toLowerCase().split(/\s+/)) {
      let h = 0; for (let i = 0; i < w.length; i++) { h = ((h << 5) - h) + w.charCodeAt(i); h |= 0; }
      emb[Math.abs(h) % emb.length] += 0.1;
    }
    const mag = Math.sqrt(emb.reduce((s, v) => s + v * v, 0));
    return mag > 0 ? emb.map(v => v / mag) : emb;
  }
  chunkCodeFile(content: string, filePath: string, language: string): Chunk[] {
    const lines = content.split('\n');
    const size = this.getChunkSize(language);
    const overlap = Math.floor(size / 4);
    const chunks: Chunk[] = [];
    for (let i = 0; i < lines.length; i += size - overlap) {
      const slice = lines.slice(i, i + size).join('\n');
      if (slice.trim().length < 15) continue;
      const sym = this.extractSymbol(slice, language);
      chunks.push({ id: `${filePath}:${i}`, content: slice, file: filePath, line: i + 1, symbol: sym, metadata: { language, file: filePath, chunk_index: Math.floor(i / (size - overlap)) } });
    }
    return chunks;
  }
  private getChunkSize(l: string) {
    switch (l) { case 'python': case 'javascript': case 'typescript': return 30; case 'java': case 'csharp': return 20; default: return 25; }
  }
  private extractSymbol(c: string, l: string): string | null {
    const pats: Record<string, RegExp> = { javascript: /(?:function|const|let|var)\s+(\w+)\s*[=(]/, typescript: /(?:function|const|let|var)\s+(\w+)\s*[=(]/, python: /def\s+(\w+)\s*\(/, java: /(?:public|private|protected)?\s*(?:static)?\s*\w+\s+(\w+)\s*\(/, php: /function\s+(\w+)\s*\(/ };
    const p = pats[l] || pats.javascript;
    for (const line of c.split('\n')) { const m = line.match(p); if (m) return m[1]; }
    const cp = /class\s+(\w+)/;
    for (const line of c.split('\n')) { const m = line.match(cp); if (m) return m[1]; }
    return null;
  }
  async searchRelevantChunks(projectId: string, query: string, limit = 8): Promise<Chunk[]> {
    try {
      const qEmb = await this.generateEmbeddings(query);
      const qStr = `[${qEmb.join(',')}]`;
      const { data, error } = await (supabase as any).rpc('search_code_chunks', { p_project_id: projectId, p_query_embedding: qStr, p_match_threshold: 0.5, p_match_count: limit });
      if (!error && data && data.length) {
        return (data as any[]).map((r: any) => ({ id: r.id, content: r.content, file: r.file_path || r.metadata?.file || 'unknown', line: r.start_line, symbol: r.symbol || r.metadata?.symbol || null, metadata: r.metadata || {} }));
      }
    } catch (e) { console.warn('vector search fallback', e); }
    return this.fallbackSearch(projectId, query, limit);
  }
  private async fallbackSearch(projectId: string, query: string, limit: number): Promise<Chunk[]> {
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
    const { data } = await (supabase as any).from('code_chunks').select('id,content,start_line,metadata,file_id').eq('project_id', projectId).limit(60);
    if (!data) return [];
    let fileMap = new Map<string, string>();
    try {
      const ids = [...new Set((data as any[]).map((r: any) => r.file_id).filter(Boolean))];
      if (ids.length) {
        const { data: files } = await (supabase as any).from('files').select('id,path').in('id', ids);
        for (const f of (files as any[] || [])) fileMap.set(f.id, f.path);
      }
    } catch {}
    const scored = (data as any[]).map(r => {
      const c = (r.content || '').toLowerCase();
      let score = 0; for (const kw of keywords) if (c.includes(kw)) score++;
      return { ...r, score, file: r.metadata?.file || fileMap.get(r.file_id) || 'unknown' };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(r => ({ id: r.id, content: r.content, file: r.file, line: r.start_line, symbol: r.metadata?.symbol || null, metadata: r.metadata || {} }));
  }
  async buildRAGContext(projectId: string, question: string, chunks: Chunk[]): Promise<string> {
    let ctx = `Project: ${projectId}\nQuestion: ${question}\n\nRelevant code:\n`;
    chunks.forEach((c, i) => { ctx += `\n[${i + 1}] File: ${c.file}${c.symbol ? ` | Symbol: ${c.symbol}` : ''} | Lines: ${c.line}\n\`\`\`${c.metadata?.language || ''}\n${c.content.slice(0, 1500)}\n\`\`\`\n`; });
    try {
      const { data: symbols } = await (supabase as any).from('code_symbols').select('name,type').eq('project_id', projectId).limit(20);
      if (symbols?.length) ctx += `\nSymbols sample: ${symbols.map((s: any) => s.name).join(', ')}\n`;
      const { data: rels } = await (supabase as any).from('code_relationships').select('relationship_type').eq('project_id', projectId).limit(20);
      if (rels?.length) ctx += `Relationships: ${rels.map((r: any) => r.relationship_type).join(', ')}\n`;
    } catch {}
    return ctx;
  }
}
