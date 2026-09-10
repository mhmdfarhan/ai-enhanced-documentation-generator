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

    // Get conversation history if conversationId provided
    let conversationHistory = [];
    if (conversationId) {
      const { data: messages } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      conversationHistory = messages?.map(msg => ({
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
      // Store user message
      await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content: question,
          context_files: relevantChunks.map(c => ({ 
            file: c.file, 
            line: c.line,
            symbol: c.symbol 
          })),
        });

      // Store AI response
      await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: response.content,
          context_files: response.sources.map(s => ({
            file: s.file,
            line: s.line,
          })),
        });

      // Update conversation title if first message
      if (conversationHistory.length === 0) {
        const title = question.length > 50 ? question.substring(0, 47) + '...' : question;
        await supabase
          .from('ai_conversations')
          .update({ title })
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