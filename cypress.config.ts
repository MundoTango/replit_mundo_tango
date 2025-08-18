import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5000',
    supportFile: 'tests/e2e/support/e2e.ts',
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    videosFolder: 'tests/e2e/videos',
    screenshotsFolder: 'tests/e2e/screenshots',
    video: true,
    screenshot: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    env: {
      coverage: true
    },
    setupNodeEvents(on, config) {
      // Setup code coverage collection
      require('@cypress/code-coverage/task')(on, config);
      
      // Setup test data seeding
      on('task', {
        seedDatabase() {
          // Import and run database seeding
          return require('./tests/e2e/support/database-seeder').seedTestData();
        },
        
        cleanDatabase() {
          // Import and run database cleanup
          return require('./tests/e2e/support/database-seeder').cleanTestData();
        }
      });

      return config;
    },
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    supportFile: 'tests/e2e/support/component.ts',
    specPattern: 'client/src/**/*.cy.{js,jsx,ts,tsx}',
  },
});