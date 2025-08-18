// Onboarding Transaction Manager
// Ensures atomicity and rollback capability for the onboarding process

import { db } from '../db';
import { users, groups, groupMembers, userRoles, userProfiles, codeOfConductAgreements } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

export interface OnboardingTransaction {
  userId: number;
  cityGroupId?: number;
  professionalGroupIds: number[];
  roleAssignments: string[];
  agreementIds: number[];
  rollback: () => Promise<void>;
  commit: () => Promise<void>;
}

export class OnboardingTransactionManager {
  private transactions: Map<number, OnboardingTransaction> = new Map();

  async startTransaction(userId: number): Promise<OnboardingTransaction> {
    const transaction: OnboardingTransaction = {
      userId,
      cityGroupId: undefined,
      professionalGroupIds: [],
      roleAssignments: [],
      agreementIds: [],
      rollback: async () => await this.rollbackTransaction(userId),
      commit: async () => await this.commitTransaction(userId)
    };

    this.transactions.set(userId, transaction);
    return transaction;
  }

  private async rollbackTransaction(userId: number): Promise<void> {
    const transaction = this.transactions.get(userId);
    if (!transaction) return;

    console.log(`🔄 Rolling back onboarding for user ${userId}`);

    try {
      // Remove from city group if added
      if (transaction.cityGroupId) {
        await db.delete(groupMembers)
          .where(and(
            eq(groupMembers.userId, userId),
            eq(groupMembers.groupId, transaction.cityGroupId)
          ));
        
        // Decrement member count
        await db.update(groups)
          .set({ memberCount: db.sql`member_count - 1` })
          .where(eq(groups.id, transaction.cityGroupId));
      }

      // Remove from professional groups
      for (const groupId of transaction.professionalGroupIds) {
        await db.delete(groupMembers)
          .where(and(
            eq(groupMembers.userId, userId),
            eq(groupMembers.groupId, groupId)
          ));
        
        await db.update(groups)
          .set({ memberCount: db.sql`member_count - 1` })
          .where(eq(groups.id, groupId));
      }

      // Remove role assignments
      if (transaction.roleAssignments.length > 0) {
        await db.delete(userRoles)
          .where(eq(userRoles.userId, userId));
        
        await db.delete(userProfiles)
          .where(eq(userProfiles.userId, userId));
      }

      // Remove code of conduct agreements
      if (transaction.agreementIds.length > 0) {
        await db.delete(codeOfConductAgreements)
          .where(eq(codeOfConductAgreements.userId, userId));
      }

      // Reset user onboarding status
      await db.update(users)
        .set({
          isOnboardingComplete: false,
          formStatus: 0
        })
        .where(eq(users.id, userId));

      console.log(`✅ Rollback completed for user ${userId}`);
    } catch (error) {
      console.error(`❌ Rollback failed for user ${userId}:`, error);
      throw error;
    } finally {
      this.transactions.delete(userId);
    }
  }

  private async commitTransaction(userId: number): Promise<void> {
    const transaction = this.transactions.get(userId);
    if (!transaction) return;

    console.log(`✅ Committing onboarding transaction for user ${userId}`);
    this.transactions.delete(userId);
  }

  getTransaction(userId: number): OnboardingTransaction | undefined {
    return this.transactions.get(userId);
  }
}

export const onboardingTransactionManager = new OnboardingTransactionManager();