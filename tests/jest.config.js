module.exports = {
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverageFrom: [
    'client/src/**/*.{js,jsx,ts,tsx}',
    'server/**/*.{js,ts}',
    'services/**/*.{js,ts}',
    'shared/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/dist/**',
    '!**/coverage/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@server/(.*)$': '<rootDir>/server/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './coverage',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: 'true'
    }]
  ],
  // ESA-44x21S Compliance Settings
  testTimeout: 10000,
  maxWorkers: '50%',
  bail: false,
  verbose: true,
  // Test categorization for P0-P3 priorities
  projects: [
    {
      displayName: 'P0-Auth',
      testMatch: ['<rootDir>/tests/backend/auth/**/*.test.ts']
    },
    {
      displayName: 'P0-Payment',
      testMatch: ['<rootDir>/tests/backend/services/payment.test.ts']
    },
    {
      displayName: 'P1-APIs',
      testMatch: ['<rootDir>/tests/backend/api/**/*.test.ts']
    },
    {
      displayName: 'P1-Services',
      testMatch: ['<rootDir>/tests/backend/services/**/*.test.ts']
    },
    {
      displayName: 'P1-Middleware',
      testMatch: ['<rootDir>/tests/backend/middleware/**/*.test.ts']
    },
    {
      displayName: 'P2-Frontend',
      testMatch: ['<rootDir>/tests/frontend/**/*.test.tsx']
    },
    {
      displayName: 'P3-E2E',
      testMatch: ['<rootDir>/tests/e2e/**/*.test.ts']
    }
  ]
};