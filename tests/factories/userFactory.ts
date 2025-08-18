import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import type { InsertUser, User } from '../../shared/schema';

export const createTestUser = (overrides: Partial<InsertUser> = {}): InsertUser => {
  return {
    name: faker.person.fullName(),
    username: faker.internet.userName().toLowerCase(),
    email: faker.internet.email().toLowerCase(),
    password: bcrypt.hashSync('testPassword123!', 10),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    country: faker.location.country(),
    city: faker.location.city(),
    bio: faker.lorem.paragraph(),
    tangoRoles: ['dancer', 'follower'],
    languages: ['english'],
    yearsOfDancing: faker.number.int({ min: 1, max: 20 }),
    leaderLevel: faker.number.int({ min: 1, max: 10 }),
    followerLevel: faker.number.int({ min: 1, max: 10 }),
    isOnboardingComplete: true,
    codeOfConductAccepted: true,
    termsAccepted: true,
    ...overrides
  };
};

export const createAuthenticatedUser = (): User => {
  return {
    id: 1,
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    password: bcrypt.hashSync('testPassword123!', 10),
    mobileNo: '+1234567890',
    profileImage: null,
    backgroundImage: null,
    bio: 'Test bio',
    firstName: 'Test',
    lastName: 'User',
    country: 'USA',
    city: 'New York',
    facebookUrl: null,
    isVerified: true,
    isActive: true,
    suspended: false,
    deviceType: null,
    deviceToken: null,
    apiToken: null,
    replitId: '12345',
    nickname: null,
    languages: ['english'],
    tangoRoles: ['dancer'],
    leaderLevel: 5,
    followerLevel: 5,
    yearsOfDancing: 5,
    startedDancingYear: 2019,
    state: 'NY',
    countryCode: 'US',
    stateCode: 'NY',
    formStatus: 2,
    isOnboardingComplete: true,
    codeOfConductAccepted: true,
    occupation: 'Software Developer',
    termsAccepted: true,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: null,
    subscriptionTier: 'free',
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const createAdminUser = (): User => {
  return {
    ...createAuthenticatedUser(),
    id: 2,
    username: 'admin',
    email: 'admin@example.com',
    replitId: '54321'
  };
};