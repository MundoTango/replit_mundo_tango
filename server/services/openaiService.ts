import OpenAI from 'openai';

class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Create an embedding for text
   */
  async createEmbedding(text: string) {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      return response;
    } catch (error) {
      console.error('OpenAI embedding error:', error);
      throw error;
    }
  }

  /**
   * Generate a completion using GPT-4
   */
  async createCompletion(messages: any[], model: string = "gpt-4o") {
    try {
      const response = await this.openai.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });
      return response;
    } catch (error) {
      console.error('OpenAI completion error:', error);
      throw error;
    }
  }

  /**
   * Generate a streaming completion
   */
  async createStreamingCompletion(messages: any[], model: string = "gpt-4o") {
    try {
      const stream = await this.openai.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      });
      return stream;
    } catch (error) {
      console.error('OpenAI streaming error:', error);
      throw error;
    }
  }
}

export const openaiService = new OpenAIService();