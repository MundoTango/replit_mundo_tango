// Life CEO: Elasticsearch Configuration
import { Client } from '@elastic/elasticsearch';

// Initialize Elasticsearch client
export const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  auth: process.env.ELASTICSEARCH_USER && process.env.ELASTICSEARCH_PASSWORD ? {
    username: process.env.ELASTICSEARCH_USER,
    password: process.env.ELASTICSEARCH_PASSWORD,
  } : undefined,
  maxRetries: 5,
  requestTimeout: 30000,
  sniffOnStart: true,
});

// Index definitions
export const indices = {
  posts: 'mundotango_posts',
  users: 'mundotango_users',
  events: 'mundotango_events',
  memories: 'mundotango_memories',
  groups: 'mundotango_groups',
  recommendations: 'mundotango_recommendations',
};

// Index mappings
const postMapping = {
  properties: {
    id: { type: 'keyword' },
    content: { 
      type: 'text',
      analyzer: 'standard',
      fields: {
        spanish: {
          type: 'text',
          analyzer: 'spanish',
        },
        english: {
          type: 'text',
          analyzer: 'english',
        },
      },
    },
    userId: { type: 'integer' },
    userName: { type: 'text' },
    createdAt: { type: 'date' },
    location: { type: 'geo_point' },
    tags: { type: 'keyword' },
    emotionTags: { type: 'keyword' },
    mentions: { type: 'keyword' },
    likesCount: { type: 'integer' },
    commentsCount: { type: 'integer' },
  },
};

const userMapping = {
  properties: {
    id: { type: 'integer' },
    name: { 
      type: 'text',
      fields: {
        keyword: { type: 'keyword' },
      },
    },
    username: { type: 'keyword' },
    email: { type: 'keyword' },
    bio: { type: 'text' },
    city: { type: 'keyword' },
    country: { type: 'keyword' },
    tangoRoles: { type: 'keyword' },
    yearsOfDancing: { type: 'integer' },
    createdAt: { type: 'date' },
    isVerified: { type: 'boolean' },
    followersCount: { type: 'integer' },
    followingCount: { type: 'integer' },
  },
};

const eventMapping = {
  properties: {
    id: { type: 'integer' },
    title: { 
      type: 'text',
      analyzer: 'standard',
    },
    description: { type: 'text' },
    location: { type: 'text' },
    geoLocation: { type: 'geo_point' },
    startDate: { type: 'date' },
    endDate: { type: 'date' },
    eventType: { type: 'keyword' },
    price: { type: 'float' },
    maxAttendees: { type: 'integer' },
    attendeeCount: { type: 'integer' },
    tags: { type: 'keyword' },
    city: { type: 'keyword' },
    country: { type: 'keyword' },
  },
};

// Initialize indices
export const initializeIndices = async () => {
  try {
    // Check if indices exist
    const postIndexExists = await esClient.indices.exists({ index: indices.posts });
    const userIndexExists = await esClient.indices.exists({ index: indices.users });
    const eventIndexExists = await esClient.indices.exists({ index: indices.events });
    
    // Create indices if they don't exist
    if (!postIndexExists) {
      await esClient.indices.create({
        index: indices.posts,
        body: {
          mappings: postMapping,
          settings: {
            number_of_shards: 1,
            number_of_replicas: 1,
            analysis: {
              analyzer: {
                custom_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'stop', 'snowball'],
                },
              },
            },
          },
        },
      });
      console.log('✅ Life CEO: Posts index created');
    }
    
    if (!userIndexExists) {
      await esClient.indices.create({
        index: indices.users,
        body: {
          mappings: userMapping,
          settings: {
            number_of_shards: 1,
            number_of_replicas: 1,
          },
        },
      });
      console.log('✅ Life CEO: Users index created');
    }
    
    if (!eventIndexExists) {
      await esClient.indices.create({
        index: indices.events,
        body: {
          mappings: eventMapping,
          settings: {
            number_of_shards: 1,
            number_of_replicas: 1,
          },
        },
      });
      console.log('✅ Life CEO: Events index created');
    }
    
    console.log('🔍 Life CEO: Elasticsearch indices initialized');
  } catch (error) {
    console.error('❌ Life CEO: Error initializing Elasticsearch indices:', error);
  }
};

// Search helpers
export const searchPosts = async (query: string, options: any = {}) => {
  const { from = 0, size = 20, filters = {} } = options;
  
  const must: any[] = [];
  
  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['content^2', 'content.spanish', 'content.english', 'tags', 'userName'],
        type: 'best_fields',
        fuzziness: 'AUTO',
      },
    });
  }
  
  // Add filters
  if (filters.userId) {
    must.push({ term: { userId: filters.userId } });
  }
  if (filters.tags?.length) {
    must.push({ terms: { tags: filters.tags } });
  }
  if (filters.dateFrom || filters.dateTo) {
    const dateRange: any = {};
    if (filters.dateFrom) dateRange.gte = filters.dateFrom;
    if (filters.dateTo) dateRange.lte = filters.dateTo;
    must.push({ range: { createdAt: dateRange } });
  }
  
  const response = await esClient.search({
    index: indices.posts,
    body: {
      query: must.length > 0 ? { bool: { must } } : { match_all: {} },
      from,
      size,
      sort: [
        { _score: 'desc' },
        { createdAt: 'desc' },
      ],
      highlight: {
        fields: {
          content: {},
        },
      },
    },
  });
  
  return {
    total: response.hits.total,
    hits: response.hits.hits.map((hit: any) => ({
      ...hit._source,
      _score: hit._score,
      highlights: hit.highlight?.content,
    })),
  };
};

export const searchUsers = async (query: string, options: any = {}) => {
  const { from = 0, size = 20 } = options;
  
  const response = await esClient.search({
    index: indices.users,
    body: {
      query: {
        multi_match: {
          query,
          fields: ['name^2', 'username^3', 'bio', 'city', 'tangoRoles'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      },
      from,
      size,
      sort: [
        { _score: 'desc' },
        { followersCount: 'desc' },
      ],
    },
  });
  
  return {
    total: response.hits.total,
    hits: response.hits.hits.map((hit: any) => ({
      ...hit._source,
      _score: hit._score,
    })),
  };
};

export const searchEvents = async (query: string, options: any = {}) => {
  const { from = 0, size = 20, filters = {} } = options;
  
  const must: any[] = [];
  
  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['title^2', 'description', 'location', 'tags'],
        type: 'best_fields',
        fuzziness: 'AUTO',
      },
    });
  }
  
  // Add filters
  if (filters.city) {
    must.push({ term: { city: filters.city } });
  }
  if (filters.eventType) {
    must.push({ term: { eventType: filters.eventType } });
  }
  if (filters.priceRange) {
    must.push({ 
      range: { 
        price: { 
          gte: filters.priceRange.min, 
          lte: filters.priceRange.max,
        },
      },
    });
  }
  
  // Only future events by default
  must.push({
    range: {
      startDate: { gte: 'now' },
    },
  });
  
  const response = await esClient.search({
    index: indices.events,
    body: {
      query: { bool: { must } },
      from,
      size,
      sort: [
        { startDate: 'asc' },
        { _score: 'desc' },
      ],
    },
  });
  
  return {
    total: response.hits.total,
    hits: response.hits.hits.map((hit: any) => ({
      ...hit._source,
      _score: hit._score,
    })),
  };
};

// Indexing helpers
export const indexPost = async (post: any) => {
  await esClient.index({
    index: indices.posts,
    id: post.id.toString(),
    body: post,
  });
};

export const indexUser = async (user: any) => {
  await esClient.index({
    index: indices.users,
    id: user.id.toString(),
    body: user,
  });
};

export const indexEvent = async (event: any) => {
  await esClient.index({
    index: indices.events,
    id: event.id.toString(),
    body: event,
  });
};

// Bulk indexing
export const bulkIndex = async (index: string, documents: any[]) => {
  const body = documents.flatMap(doc => [
    { index: { _index: index, _id: doc.id.toString() } },
    doc,
  ]);
  
  const response = await esClient.bulk({ refresh: true, body });
  
  if (response.errors) {
    console.error('❌ Life CEO: Bulk indexing errors:', response.errors);
  }
  
  return response;
};

// Delete from index
export const deleteFromIndex = async (index: string, id: string) => {
  await esClient.delete({
    index,
    id,
  });
};