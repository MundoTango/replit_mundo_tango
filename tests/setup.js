// Test setup file for Vitest
import { beforeAll, afterAll } from 'vitest'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

beforeAll(async () => {
  // Global test setup
  console.log('Setting up test environment...')
  
  // Ensure required environment variables are present
  const requiredEnvVars = ['DATABASE_URL']
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`Warning: ${envVar} not set in environment`)
    }
  }
})

afterAll(async () => {
  // Global test cleanup
  console.log('Cleaning up test environment...')
})