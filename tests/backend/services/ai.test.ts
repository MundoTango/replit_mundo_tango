import { jest } from '@jest/globals';

// Mock OpenAI
jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    },
    embeddings: {
      create: jest.fn()
    }
  }))
}));

describe('AI Service Tests', () => {
  let aiService: any;
  let mockOpenAI: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Import after mocking
    const { AIService } = await import('../../../services/ai');
    aiService = new AIService();
    
    // Get mocked OpenAI instance
    mockOpenAI = aiService.openai;
  });

  describe('Chat Completions', () => {
    it('should generate text responses', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Generated response'
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await aiService.generateResponse('Test prompt');

      expect(result).toBe('Generated response');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4o',
        messages: expect.arrayContaining([
          expect.objectContaining({ content: 'Test prompt' })
        ])
      });
    });

    it('should handle AI errors gracefully', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error('API rate limit exceeded')
      );

      await expect(aiService.generateResponse('Test'))
        .rejects.toThrow('AI service temporarily unavailable');
    });

    it('should apply content filtering', async () => {
      const inappropriateContent = 'Some inappropriate content';
      
      // Mock filter detection
      const result = await aiService.filterContent(inappropriateContent);
      
      expect(result.isAppropriate).toBe(false);
      expect(result.reason).toContain('inappropriate');
    });
  });

  describe('Embeddings', () => {
    it('should generate text embeddings', async () => {
      const mockEmbedding = {
        data: [{
          embedding: [0.1, 0.2, 0.3, 0.4]
        }]
      };

      mockOpenAI.embeddings.create.mockResolvedValue(mockEmbedding);

      const result = await aiService.generateEmbedding('Test text');

      expect(result).toEqual([0.1, 0.2, 0.3, 0.4]);
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'Test text'
      });
    });

    it('should batch embed multiple texts', async () => {
      const texts = ['Text 1', 'Text 2', 'Text 3'];
      const mockEmbeddings = {
        data: texts.map((_, i) => ({
          embedding: [0.1 * i, 0.2 * i, 0.3 * i]
        }))
      };

      mockOpenAI.embeddings.create.mockResolvedValue(mockEmbeddings);

      const results = await aiService.batchEmbed(texts);

      expect(results).toHaveLength(3);
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('Semantic Search', () => {
    it('should find similar content', async () => {
      const query = 'tango events in Buenos Aires';
      const documents = [
        { id: 1, text: 'Milonga at Salon Canning in Buenos Aires' },
        { id: 2, text: 'Salsa dancing in New York' },
        { id: 3, text: 'Tango workshop in Buenos Aires' }
      ];

      // Mock embeddings
      mockOpenAI.embeddings.create
        .mockResolvedValueOnce({ data: [{ embedding: [0.9, 0.8, 0.7] }] }) // Query
        .mockResolvedValueOnce({ 
          data: documents.map((_, i) => ({
            embedding: i === 0 || i === 2 ? [0.8, 0.7, 0.6] : [0.1, 0.2, 0.3]
          }))
        });

      const results = await aiService.semanticSearch(query, documents);

      expect(results[0].text).toContain('Buenos Aires');
      expect(results[0].score).toBeGreaterThan(0.5);
    });
  });

  describe('Content Moderation', () => {
    it('should detect and flag inappropriate content', async () => {
      const testCases = [
        { text: 'Normal tango event', expected: true },
        { text: 'Spam spam spam buy now!', expected: false },
        { text: 'Offensive content here', expected: false }
      ];

      for (const testCase of testCases) {
        const result = await aiService.moderateContent(testCase.text);
        expect(result.isAppropriate).toBe(testCase.expected);
      }
    });

    it('should provide moderation reasons', async () => {
      const spamContent = 'Buy now! Limited offer! Click here!';
      const result = await aiService.moderateContent(spamContent);

      expect(result.isAppropriate).toBe(false);
      expect(result.categories).toContain('spam');
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('Summarization', () => {
    it('should summarize long text', async () => {
      const longText = 'Very long article about tango history...'.repeat(100);
      
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: 'Tango originated in Buenos Aires and evolved through various cultural influences.'
          }
        }]
      });

      const summary = await aiService.summarize(longText);

      expect(summary).toBeTruthy();
      expect(summary.length).toBeLessThan(longText.length / 10);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ 
              content: expect.stringContaining('summarize')
            })
          ])
        })
      );
    });

    it('should summarize with specific length', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: { content: 'Short summary.' }
        }]
      });

      const summary = await aiService.summarize('Long text', { maxWords: 50 });

      expect(summary.split(' ').length).toBeLessThanOrEqual(50);
    });
  });

  describe('Translation', () => {
    it('should translate text between languages', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: { content: 'Hola, ¿cómo estás?' }
        }]
      });

      const translated = await aiService.translate(
        'Hello, how are you?',
        'en',
        'es'
      );

      expect(translated).toBe('Hola, ¿cómo estás?');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining('translate')
            })
          ])
        })
      );
    });

    it('should detect source language if not provided', async () => {
      mockOpenAI.chat.completions.create
        .mockResolvedValueOnce({
          choices: [{ message: { content: 'es' } }] // Language detection
        })
        .mockResolvedValueOnce({
          choices: [{ message: { content: 'Hello' } }] // Translation
        });

      const translated = await aiService.translate(
        'Hola',
        null,
        'en'
      );

      expect(translated).toBe('Hello');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('Recommendation Engine', () => {
    it('should generate personalized recommendations', async () => {
      const userProfile = {
        interests: ['milonga', 'traditional tango'],
        location: 'Buenos Aires',
        level: 'intermediate'
      };

      const events = [
        { id: 1, type: 'milonga', level: 'all' },
        { id: 2, type: 'workshop', level: 'advanced' },
        { id: 3, type: 'milonga', level: 'intermediate' }
      ];

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify([1, 3])
          }
        }]
      });

      const recommendations = await aiService.recommendEvents(userProfile, events);

      expect(recommendations).toHaveLength(2);
      expect(recommendations[0].id).toBe(1);
      expect(recommendations[1].id).toBe(3);
    });
  });

  describe('Sentiment Analysis', () => {
    it('should analyze text sentiment', async () => {
      const texts = [
        { text: 'I love this milonga!', expected: 'positive' },
        { text: 'The event was terrible', expected: 'negative' },
        { text: 'It was okay, nothing special', expected: 'neutral' }
      ];

      for (const testCase of texts) {
        mockOpenAI.chat.completions.create.mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                sentiment: testCase.expected,
                confidence: 0.9
              })
            }
          }]
        });

        const result = await aiService.analyzeSentiment(testCase.text);
        
        expect(result.sentiment).toBe(testCase.expected);
        expect(result.confidence).toBeGreaterThan(0.5);
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should respect API rate limits', async () => {
      // Configure rate limiter
      aiService.setRateLimit(5, 60000); // 5 requests per minute

      // Make 5 quick requests
      const promises = [];
      for (let i = 0; i < 5; i++) {
        mockOpenAI.chat.completions.create.mockResolvedValue({
          choices: [{ message: { content: 'Response' } }]
        });
        promises.push(aiService.generateResponse(`Test ${i}`));
      }

      await Promise.all(promises);

      // 6th request should be rate limited
      await expect(aiService.generateResponse('Test 6'))
        .rejects.toThrow('Rate limit exceeded');
    });

    it('should queue requests when rate limited', async () => {
      aiService.enableQueueing(true);
      aiService.setRateLimit(1, 1000); // 1 request per second

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Response' } }]
      });

      // Make 3 requests rapidly
      const start = Date.now();
      const results = await Promise.all([
        aiService.generateResponse('Test 1'),
        aiService.generateResponse('Test 2'),
        aiService.generateResponse('Test 3')
      ]);

      const duration = Date.now() - start;

      expect(results).toHaveLength(3);
      expect(duration).toBeGreaterThanOrEqual(2000); // Should take at least 2 seconds
    });
  });

  describe('Caching', () => {
    it('should cache repeated requests', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Cached response' } }]
      });

      // First request
      const result1 = await aiService.generateResponse('Test prompt', { cache: true });
      
      // Second identical request
      const result2 = await aiService.generateResponse('Test prompt', { cache: true });

      expect(result1).toBe(result2);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
    });

    it('should expire cache after TTL', async () => {
      jest.useFakeTimers();

      mockOpenAI.chat.completions.create
        .mockResolvedValueOnce({
          choices: [{ message: { content: 'First response' } }]
        })
        .mockResolvedValueOnce({
          choices: [{ message: { content: 'Second response' } }]
        });

      // First request
      await aiService.generateResponse('Test', { cache: true, ttl: 60000 });

      // Advance time past TTL
      jest.advanceTimersByTime(61000);

      // Second request should hit API again
      const result = await aiService.generateResponse('Test', { cache: true });

      expect(result).toBe('Second response');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });
  });
});