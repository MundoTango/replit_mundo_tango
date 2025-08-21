// Shared communication protocols between Life CEO and Community platforms

import { z } from 'zod';

// API Version for protocol compatibility
export const API_VERSION = '1.0.0';

// Base message schema for cross-system communication
export const BaseMessageSchema = z.object({
  id: z.string().uuid(),
  version: z.string().default(API_VERSION),
  timestamp: z.date(),
  source: z.object({
    system: z.enum(['life-ceo', 'community']),
    communityId: z.string().optional(),
    service: z.string()
  }),
  destination: z.object({
    system: z.enum(['life-ceo', 'community']),
    communityId: z.string().optional(),
    service: z.string()
  })
});

// User activity update from community to Life CEO
export const UserActivitySchema = BaseMessageSchema.extend({
  type: z.literal('user-activity'),
  data: z.object({
    userId: z.string(),
    communityId: z.string(),
    activity: z.object({
      type: z.enum(['post', 'event', 'comment', 'like', 'share', 'join', 'leave']),
      entityId: z.string(),
      metadata: z.record(z.any()).optional()
    })
  })
});

// Life event notification from Life CEO to community
export const LifeEventSchema = BaseMessageSchema.extend({
  type: z.literal('life-event'),
  data: z.object({
    userId: z.string(),
    event: z.object({
      type: z.enum(['achievement', 'milestone', 'reminder', 'suggestion', 'alert']),
      title: z.string(),
      description: z.string(),
      priority: z.enum(['low', 'medium', 'high', 'critical']),
      agentSource: z.string(),
      metadata: z.record(z.any()).optional()
    })
  })
});

// Request for Life CEO insight from community
export const InsightRequestSchema = BaseMessageSchema.extend({
  type: z.literal('insight-request'),
  data: z.object({
    userId: z.string(),
    communityId: z.string(),
    context: z.object({
      type: z.enum(['recommendation', 'analysis', 'prediction', 'optimization']),
      domain: z.string(),
      query: z.string(),
      timeframe: z.object({
        start: z.date().optional(),
        end: z.date().optional()
      }).optional()
    })
  })
});

// Cross-community data request
export const CrossCommunityRequestSchema = BaseMessageSchema.extend({
  type: z.literal('cross-community-request'),
  data: z.object({
    userId: z.string(),
    requestingCommunityId: z.string(),
    targetCommunityIds: z.array(z.string()),
    dataType: z.enum(['profile', 'posts', 'events', 'connections']),
    filters: z.record(z.any()).optional()
  })
});

// Authentication token exchange
export const AuthTokenExchangeSchema = BaseMessageSchema.extend({
  type: z.literal('auth-token-exchange'),
  data: z.object({
    userId: z.string(),
    sourceToken: z.string(),
    requestedScopes: z.array(z.string()),
    expiresIn: z.number().optional()
  })
});

// API Response wrapper
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional()
  }).optional(),
  meta: z.object({
    requestId: z.string(),
    processingTime: z.number(),
    version: z.string()
  })
});

// Types
export type UserActivity = z.infer<typeof UserActivitySchema>;
export type LifeEvent = z.infer<typeof LifeEventSchema>;
export type InsightRequest = z.infer<typeof InsightRequestSchema>;
export type CrossCommunityRequest = z.infer<typeof CrossCommunityRequestSchema>;
export type AuthTokenExchange = z.infer<typeof AuthTokenExchangeSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;

// Error codes
export enum ErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

// API Endpoints interface
export interface ICommunicationEndpoints {
  // Life CEO endpoints
  lifeCeo: {
    receiveActivity: '/api/life-ceo/activity',
    requestInsight: '/api/life-ceo/insight',
    exchangeToken: '/api/life-ceo/auth/exchange'
  };
  
  // Community endpoints
  community: {
    receiveLifeEvent: '/api/community/life-event',
    crossCommunityData: '/api/community/cross-data',
    exchangeToken: '/api/community/auth/exchange'
  };
}