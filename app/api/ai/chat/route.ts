import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai-service';
import { RAGPipeline } from '@/lib/rag-pipeline';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { projectId, question, conversationId } = await request.json();

    if (!projectId || !question) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let conversationHistory: any[] = [];
    if (conversationId) {
      const { data: messages } = await (supabase as any)
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      conversationHistory = (messages as any[])?.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })) || [];
    }

    // Search for relevant code chunks using RAG
    const ragPipeline = new RAGPipeline();
    const relevantChunks = await ragPipeline.searchRelevantChunks(projectId, question);
    
    // Build context from relevant chunks
    const context = await ragPipeline.buildRAGContext(projectId, question, relevantChunks);

    // Generate AI response
    const aiService = new AIService();
    const response = await aiService.chatWithCodebase(
      question,
      relevantChunks.map(c => c.content),
      conversationHistory
    );

    // Store conversation if conversationId exists
    if (conversationId) {
      await (supabase as any)
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content: question,
          context_files: relevantChunks.map((c: any) => ({ 
            file: c.file, 
            line: c.line,
            symbol: c.symbol 
          })),
        });
      await (supabase as any)
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: response.content,
          context_files: response.sources.map((s: any) => ({
            file: s.file,
            line: s.line,
          })),
        });
      if (conversationHistory.length === 0) {
        const title = question.length > 50 ? question.substring(0, 47) + '...' : question;
        await (supabase as any)
          .from('ai_conversations')
          .update({ title } as any)
          .eq('id', conversationId);
      }
    }

    return NextResponse.json({
      success: true,
      response: {
        content: response.content,
        sources: response.sources,
        confidence: response.confidence,
        relevant_chunks_count: relevantChunks.length,
      },
    });

  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}