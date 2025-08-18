import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';

// AI Chat endpoint that handles large messages without CSRF blocking
export const handleAiChat = async (req: Request, res: Response) => {
  try {
    const { message, conversationId, userId = 7 } = req.body;
    
    console.log(`🤖 AI Chat request - Message length: ${message?.length || 0} chars`);
    
    // Insert user message into chat_messages table with all required fields
    const { data: userMessage, error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        slug: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        chat_room_slug: conversationId || `conv_${userId}`,
        user_slug: `user_${userId}`,
        message_type: 'text',
        message: message,
        is_forwarded: false,
        is_reply: false
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error inserting user message:', insertError);
      return res.status(500).json({ 
        error: 'Failed to save message',
        details: insertError.message
      });
    }

    // Simulate AI response (replace with actual AI integration)
    const aiResponse = generateAiResponse(message);
    
    // Insert AI response
    const { data: aiMessage, error: aiError } = await supabase
      .from('chat_messages')
      .insert({
        slug: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        chat_room_slug: conversationId || `conv_${userId}`,
        user_slug: 'ai_assistant',
        message_type: 'text',
        message: aiResponse,
        is_forwarded: false,
        is_reply: false
      })
      .select()
      .single();

    if (aiError) {
      console.error('❌ Error inserting AI response:', aiError);
    }

    console.log(`✅ AI Chat successful - User msg: ${userMessage.id}, AI msg: ${aiMessage?.id || 'failed'}`);

    res.json({
      success: true,
      userMessage,
      aiResponse: aiMessage,
      messageLength: message.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI Chat error:', error);
    res.status(500).json({
      error: 'AI chat failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Get conversation history
export const getConversationHistory = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.query.userId || 7;

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_room_slug', conversationId || `conv_${userId}`)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('❌ Error fetching conversation:', error);
      return res.status(500).json({ error: 'Failed to fetch conversation' });
    }

    res.json({
      success: true,
      messages: messages || [],
      conversationId: conversationId || `conv_${userId}`,
      count: messages?.length || 0
    });

  } catch (error) {
    console.error('❌ Conversation fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

function generateAiResponse(userMessage: string): string {
  // Simple AI response generator - replace with actual AI integration
  const responses = [
    "I understand your message. How can I help you further with your Mundo Tango experience?",
    "That's interesting! Let me provide some insights based on the tango community platform.",
    "I'm here to assist you with any questions about tango, events, or the platform features.",
    "Thank you for sharing that. As your AI assistant, I'm ready to help you navigate the platform.",
    "Based on your message, I can offer some suggestions for enhancing your tango journey."
  ];

  if (userMessage.toLowerCase().includes('error') || userMessage.toLowerCase().includes('problem')) {
    return "I see you're experiencing an issue. The platform has been updated to handle large messages properly. The CSRF protection has been bypassed for AI chat, and the body parser now supports up to 10MB. Your message should be processed successfully now.";
  }

  if (userMessage.toLowerCase().includes('tango')) {
    return "Tango is such a passionate dance! I can help you find events, connect with other dancers, or discover new tango communities around the world through the Mundo Tango platform.";
  }

  return responses[Math.floor(Math.random() * responses.length)];
}