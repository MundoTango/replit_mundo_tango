// Jest setup file for ESA-44x21S compliant testing
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock crypto.randomUUID
if (!global.crypto) {
  global.crypto = {} as any;
}
global.crypto.randomUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// Suppress console errors in tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Global test utilities
global.waitForAsync = (fn, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(async () => {
      try {
        const result = await fn();
        if (result) {
          clearInterval(interval);
          resolve(result);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          reject(new Error('Timeout waiting for condition'));
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 100);
  });
};

// Mock fetch globally
global.fetch = jest.fn();

// Reset fetch mock before each test
beforeEach(() => {
  (global.fetch as jest.Mock).mockReset();
});

// ESA-44x21S Test Environment Configuration
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.VITE_STRIPE_PUBLIC_KEY = 'pk_test_mock';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.RESEND_API_KEY = 'test-resend-key';

// Performance monitoring for tests
let testStartTime;

beforeEach(() => {
  testStartTime = Date.now();
});

afterEach(() => {
  const testEndTime = Date.now();
  const duration = testEndTime - testStartTime;
  
  // Warn if test takes too long (> 5 seconds)
  if (duration > 5000) {
    console.warn(`Test took ${duration}ms to complete - consider optimization`);
  }
});