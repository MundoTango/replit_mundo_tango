import { faker } from '@faker-js/faker';
import type { InsertPost } from '../../shared/schema';

export const createTestPost = (userId: number, overrides: Partial<InsertPost> = {}): InsertPost => {
  return {
    userId,
    content: faker.lorem.paragraph(),
    plainText: faker.lorem.paragraph(),
    visibility: 'public',
    hashtags: [faker.word.noun(), faker.word.noun()],
    mentions: [],
    location: faker.location.city(),
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    isPublic: true,
    ...overrides
  };
};

export const createTestMemory = (userId: number, overrides: any = {}) => {
  return {
    userId,
    content: faker.lorem.paragraph(),
    emotionTags: ['happy', 'grateful'],
    location: {
      name: faker.location.city() + ', ' + faker.location.country()
    },
    visibility: 'public',
    memoryDate: faker.date.past(),
    ...overrides
  };
};