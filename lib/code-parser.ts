export interface CodeSymbol {
  name: string;
  type: 'class' | 'function' | 'method' | 'property' | 'variable' | 'import';
  startLine: number;
  endLine: number;
  signature?: string;
  documentation?: string;
}

let TreeSitter: any = null;
let langs: Record<string, any> = {};
let available = false;
try {
  const req: any = eval('require');
  TreeSitter = req('tree-sitter');
  try { langs.javascript = req('tree-sitter-javascript'); } catch {}
  try { langs.typescript = req('tree-sitter-typescript')?.typescript || req('tree-sitter-typescript'); } catch {}
  try { langs.python = req('tree-sitter-python'); } catch {}
  available = !!TreeSitter;
} catch {
  available = false;
}

export class CodeParser {
  private parser: any = null;
  constructor() {
    if (available && TreeSitter) {
      try { this.parser = new TreeSitter(); } catch { this.parser = null; available = false; }
    }
  }
  async parseFile(content: string, language: string): Promise<CodeSymbol[]> {
    if (!available || !this.parser) return this.fallbackParse(content);
    try {
      const lang = this.getLanguage(language);
      if (!lang) return this.fallbackParse(content);
      this.parser.setLanguage(lang);
      const tree = this.parser.parse(content);
      return this.extractSymbols(tree.rootNode, content);
    } catch {
      return this.fallbackParse(content);
    }
  }
  private getLanguage(language: string): any {
    const n = (language||'').toLowerCase();
    if (n.includes('javascript') || n==='js') return langs.javascript || null;
    if (n.includes('typescript') || n==='ts') return langs.typescript || null;
    if (n.includes('python') || n==='py') return langs.python || null;
    return null;
  }
  private extractSymbols(node: any, content: string): CodeSymbol[] {
    const symbols: CodeSymbol[] = [];
    if (node.type === 'class_declaration') {
      const name = node.childForFieldName('name')?.text || 'AnonymousClass';
      symbols.push({ name, type: 'class', startLine: node.startPosition.row+1, endLine: node.endPosition.row+1 });
    }
    if (node.type === 'function_declaration' || node.type === 'method_definition') {
      const name = node.childForFieldName('name')?.text || 'anonymous';
      symbols.push({ name, type: 'function', startLine: node.startPosition.row+1, endLine: node.endPosition.row+1 });
    }
    if (node.type === 'import_statement' || node.type === 'import') {
      symbols.push({ name: node.text.slice(0,200), type: 'import', startLine: node.startPosition.row+1, endLine: node.endPosition.row+1 });
    }
    if (node.type === 'variable_declaration') {
      const name = node.childForFieldName('name')?.text;
      if(name) symbols.push({ name, type: 'variable', startLine: node.startPosition.row+1, endLine: node.endPosition.row+1 });
    }
    for(const child of node.children || []) symbols.push(...this.extractSymbols(child, content));
    return symbols;
  }
  private fallbackParse(content: string): CodeSymbol[] {
    const symbols: CodeSymbol[] = [];
    const lines = content.split('\n');
    lines.forEach((line, idx)=>{
      const l=line.trim();
      let m;
      m = l.match(/^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/); if(m) symbols.push({name:m[1],type:'class',startLine:idx+1,endLine:idx+1});
      m = l.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)/); if(m) symbols.push({name:m[1],type:'function',startLine:idx+1,endLine:idx+1});
      m = l.match(/(?:^|\s)(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(/); if(m) symbols.push({name:m[1],type:'function',startLine:idx+1,endLine:idx+1});
      m = l.match(/^\s*(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\(.*\)\s*\{/); if(m && !['if','for','while','switch','catch'].includes(m[1])) symbols.push({name:m[1],type:'method',startLine:idx+1,endLine:idx+1});
      m = l.match(/^\s*(?:import\s+.*from|from)\s+['"]([^'"]+)['"]/); if(m) symbols.push({name:m[1],type:'import',startLine:idx+1,endLine:idx+1});
      m = l.match(/^\s*import\s+['"]([^'"]+)['"]/); if(m) symbols.push({name:m[1],type:'import',startLine:idx+1,endLine:idx+1});
    });
    return symbols;
  }
  detectLanguage(filename: string): string {
    const ext=(filename.split('.').pop()||'').toLowerCase();
    switch(ext){
      case 'js': case 'jsx': return 'javascript';
      case 'ts': case 'tsx': return 'typescript';
      case 'py': return 'python';
      case 'php': return 'php';
      case 'java': return 'java';
      case 'cs': return 'csharp';
      case 'go': return 'go';
      case 'rs': return 'rust';
      case 'cpp': case 'c': case 'h': case 'hpp': return 'c++';
      case 'kt': return 'kotlin';
      case 'dart': return 'dart';
      default: return 'unknown';
    }
  }
  analyzeArchitecture(symbols: CodeSymbol[]): { pattern: string; confidence: number; evidence: string[] } {
    const evidence:string[]=[]; let mvc=0, layered=0, rest=0;
    const hasControllers=symbols.some(s=>/controller|ctrl/i.test(s.name));
    const hasModels=symbols.some(s=>/model|entity/i.test(s.name));
    const hasViews=symbols.some(s=>/view|component|template/i.test(s.name));
    if(hasControllers){ mvc+=30; evidence.push('✓ Found controller components'); }
    if(hasModels){ mvc+=30; evidence.push('✓ Found model components'); }
    if(hasViews){ mvc+=30; evidence.push('✓ Found view components'); }
    const hasServices=symbols.some(s=>/service/i.test(s.name));
    const hasRepos=symbols.some(s=>/repository|repo/i.test(s.name));
    if(hasServices){ layered+=25; evidence.push('✓ Found service layer'); }
    if(hasRepos){ layered+=25; evidence.push('✓ Found repository layer'); }
    if(hasControllers) layered+=25;
    if(hasModels) layered+=25;
    const hasApi=symbols.some(s=>/route|endpoint|api/i.test(s.name));
    if(hasApi){ rest+=50; evidence.push('✓ Found API routes'); }
    const scores=[{pattern:'MVC',score:mvc},{pattern:'LAYERED',score:layered},{pattern:'REST',score:rest}];
    const best=scores.reduce((a,b)=> b.score>a.score?b:a);
    return { pattern: best.score>0?best.pattern:'UNKNOWN', confidence: Math.min(Math.floor(best.score),100), evidence: evidence.length?evidence:['Insufficient evidence'] };
  }
}
