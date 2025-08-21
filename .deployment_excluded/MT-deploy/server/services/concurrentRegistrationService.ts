// 40x20s Framework - Layer 2: Database & Layer 8: API Services
// Concurrent Registration Handler with Transaction Support

import { db } from '../db';
import * as schema from '@shared/schema';
import { InsertUser } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface RegistrationRequest {
  data: InsertUser;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

class ConcurrentRegistrationService {
  private registrationQueue: RegistrationRequest[] = [];
  private isProcessing = false;
  private maxConcurrentRegistrations = 10;
  private activeRegistrations = 0;

  // Add a registration request to the queue
  async registerUser(userData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.registrationQueue.push({
        data: userData,
        resolve,
        reject
      });
      
      // Start processing if not already running
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  // Process the registration queue
  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.registrationQueue.length > 0) {
      // Wait if we're at max concurrent registrations
      while (this.activeRegistrations >= this.maxConcurrentRegistrations) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const request = this.registrationQueue.shift();
      if (request) {
        this.activeRegistrations++;
        this.processRegistration(request)
          .finally(() => {
            this.activeRegistrations--;
          });
      }
    }

    this.isProcessing = false;
  }

  // Process a single registration with transaction support
  private async processRegistration(request: RegistrationRequest) {
    const { data, resolve, reject } = request;
    
    try {
      // Use database transaction for atomic operations
      const result = await db.transaction(async (tx) => {
        // Check if user already exists
        const existingUser = await tx
          .select()
          .from(schema.users)
          .where(schema.eq(schema.users.email, data.email))
          .limit(1);

        if (existingUser.length > 0) {
          throw new Error('User with this email already exists');
        }

        // Hash password if provided
        if (data.password) {
          data.password = await bcrypt.hash(data.password, 10);
        }

        // Create the user
        const [newUser] = await tx
          .insert(schema.users)
          .values(data)
          .returning();

        // Generate JWT token
        const token = jwt.sign(
          { userId: newUser.id },
          process.env.JWT_SECRET || "mundo-tango-secret",
          { expiresIn: "7d" }
        );

        // Update user with API token
        await tx
          .update(schema.users)
          .set({ apiToken: token })
          .where(schema.eq(schema.users.id, newUser.id));

        return { user: newUser, token };
      });

      // Resolve the promise with the result
      resolve(result);
    } catch (error) {
      // Reject the promise with the error
      reject(error);
    }
  }

  // Get queue status for monitoring
  getQueueStatus() {
    return {
      queueLength: this.registrationQueue.length,
      activeRegistrations: this.activeRegistrations,
      isProcessing: this.isProcessing,
      maxConcurrent: this.maxConcurrentRegistrations
    };
  }

  // Update max concurrent registrations for load tuning
  setMaxConcurrentRegistrations(max: number) {
    this.maxConcurrentRegistrations = Math.max(1, Math.min(50, max));
  }
}

// Export singleton instance
export const concurrentRegistrationService = new ConcurrentRegistrationService();

// 40x20s Performance Monitoring
setInterval(() => {
  const status = concurrentRegistrationService.getQueueStatus();
  if (status.queueLength > 0 || status.activeRegistrations > 0) {
    console.log('📊 Registration Queue Status:', status);
  }
}, 5000);