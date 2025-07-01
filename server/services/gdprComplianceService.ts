/**
 * GDPR Compliance Service
 * Implements all data subject rights and privacy controls
 */

import { db } from '../db';
import { users, posts, events, chatMessages, stories, postComments } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { format } from 'date-fns';

interface ConsentData {
  user_id: number;
  consent_type: 'marketing' | 'analytics' | 'functional' | 'necessary';
  consent_given: boolean;
  legal_basis: 'consent' | 'legitimate_interest' | 'contract' | 'legal_obligation';
  purpose: string;
  data_categories: string[];
  retention_period?: number;
}

interface DataSubjectRequest {
  user_id?: number;
  email: string;
  request_type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  request_details?: any;
}

interface UserDataExport {
  user_profile: any;
  posts: any[];
  events: any[];
  comments: any[];
  messages: any[];
  stories: any[];
  consent_records: any[];
  audit_log: any[];
}

export class GDPRComplianceService {
  /**
   * Record user consent for data processing
   */
  static async recordConsent(consentData: ConsentData): Promise<void> {
    try {
      await db.execute(sql`
        INSERT INTO privacy_consents (
          user_id, consent_type, consent_given, legal_basis, purpose, 
          data_categories, retention_period, ip_address, user_agent
        ) VALUES (
          ${consentData.user_id},
          ${consentData.consent_type},
          ${consentData.consent_given},
          ${consentData.legal_basis},
          ${consentData.purpose},
          ${JSON.stringify(consentData.data_categories)},
          ${consentData.retention_period || null},
          COALESCE(current_setting('app.client_ip', true)::inet, '127.0.0.1'::inet),
          current_setting('app.user_agent', true)
        )
      `);

      // Log the consent action
      await this.logGDPRAction(
        consentData.user_id,
        'consent_given',
        'privacy_consents',
        null,
        consentData.legal_basis,
        'consent_management'
      );
    } catch (error) {
      console.error('Error recording consent:', error);
      throw new Error('Failed to record consent');
    }
  }

  /**
   * Withdraw user consent
   */
  static async withdrawConsent(userId: number, consentType: string): Promise<void> {
    try {
      await db.execute(sql`
        UPDATE privacy_consents 
        SET consent_given = false, consent_withdrawn_date = NOW()
        WHERE user_id = ${userId} AND consent_type = ${consentType}
      `);

      await this.logGDPRAction(
        userId,
        'consent_withdrawn',
        'privacy_consents',
        null,
        'consent',
        'consent_management'
      );
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      throw new Error('Failed to withdraw consent');
    }
  }

  /**
   * Create data subject rights request
   */
  static async createDataSubjectRequest(requestData: DataSubjectRequest): Promise<string> {
    try {
      const result = await db.execute(sql`
        INSERT INTO data_subject_requests (
          user_id, email, request_type, request_details, identity_verified
        ) VALUES (
          ${requestData.user_id || null},
          ${requestData.email},
          ${requestData.request_type},
          ${JSON.stringify(requestData.request_details || {})},
          ${requestData.user_id ? true : false}
        ) RETURNING id
      `);

      const requestId = result.rows[0]?.id;

      if (requestData.user_id) {
        await this.logGDPRAction(
          requestData.user_id,
          `data_subject_request_${requestData.request_type}`,
          'data_subject_requests',
          requestId,
          'data_subject_right',
          'rights_exercise'
        );
      }

      return requestId;
    } catch (error) {
      console.error('Error creating data subject request:', error);
      throw new Error('Failed to create data subject request');
    }
  }

  /**
   * Export all user data (Article 15 - Right of Access)
   */
  static async exportUserData(userId: number): Promise<UserDataExport> {
    try {
      // Get user profile
      const userProfile = await db.select().from(users).where(eq(users.id, userId));

      // Get user posts
      const userPosts = await db.select().from(posts).where(eq(posts.userId, userId));

      // Get user events
      const userEvents = await db.select().from(events).where(eq(events.userId, userId));

      // Get user comments
      const userComments = await db.select().from(postComments).where(eq(postComments.userId, userId));

      // Get user messages
      const userMessages = await db.select().from(chatMessages).where(eq(chatMessages.userId, userId));

      // Get user stories
      const userStories = await db.select().from(stories).where(eq(stories.userId, userId));

      // Get consent records
      const consentRecords = await db.execute(sql`
        SELECT * FROM privacy_consents WHERE user_id = ${userId}
      `);

      // Get audit log (last 90 days for privacy)
      const auditLog = await db.execute(sql`
        SELECT action_type, table_name, created_at, legal_basis, purpose
        FROM gdpr_audit_log 
        WHERE user_id = ${userId} 
        AND created_at >= NOW() - INTERVAL '90 days'
        ORDER BY created_at DESC
        LIMIT 1000
      `);

      const exportData: UserDataExport = {
        user_profile: userProfile[0] || null,
        posts: userPosts,
        events: userEvents,
        comments: userComments,
        messages: userMessages.map(msg => ({
          ...msg,
          // Remove sensitive room information
          roomSlug: '[ROOM_ID_ANONYMIZED]'
        })),
        stories: userStories,
        consent_records: consentRecords.rows,
        audit_log: auditLog.rows
      };

      // Log the data access
      await this.logGDPRAction(
        userId,
        'data_export',
        'multiple_tables',
        null,
        'data_subject_right',
        'data_access_request'
      );

      return exportData;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw new Error('Failed to export user data');
    }
  }

  /**
   * Delete all user data (Article 17 - Right to Erasure)
   */
  static async deleteUserData(userId: number, keepAuditTrail: boolean = true): Promise<void> {
    try {
      // Start transaction for data deletion
      await db.transaction(async (tx) => {
        // Delete user's content but preserve referential integrity
        await tx.execute(sql`DELETE FROM post_comments WHERE user_id = ${userId}`);
        await tx.execute(sql`DELETE FROM post_likes WHERE user_id = ${userId}`);
        await tx.execute(sql`DELETE FROM stories WHERE user_id = ${userId}`);
        await tx.execute(sql`DELETE FROM chat_messages WHERE user_id = ${userId}`);
        await tx.execute(sql`DELETE FROM events WHERE user_id = ${userId}`);
        await tx.execute(sql`DELETE FROM posts WHERE user_id = ${userId}`);
        
        // Anonymize rather than delete to maintain data integrity
        await tx.execute(sql`
          UPDATE users SET 
            name = 'Deleted User',
            email = 'deleted_${userId}@mundotango.deleted',
            username = 'deleted_${userId}',
            bio = NULL,
            profile_image = NULL,
            background_image = NULL,
            mobile_no = NULL,
            facebook_url = NULL,
            first_name = NULL,
            last_name = NULL,
            is_active = false
          WHERE id = ${userId}
        `);

        // Delete consent records
        await tx.execute(sql`DELETE FROM privacy_consents WHERE user_id = ${userId}`);

        if (!keepAuditTrail) {
          await tx.execute(sql`DELETE FROM gdpr_audit_log WHERE user_id = ${userId}`);
        }
      });

      // Log the erasure action
      await this.logGDPRAction(
        userId,
        'data_erasure_complete',
        'multiple_tables',
        null,
        'data_subject_right',
        'right_to_erasure'
      );
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw new Error('Failed to delete user data');
    }
  }

  /**
   * Get user consent status
   */
  static async getUserConsentStatus(userId: number): Promise<any[]> {
    try {
      const result = await db.execute(sql`
        SELECT consent_type, consent_given, consent_date, legal_basis, purpose
        FROM privacy_consents 
        WHERE user_id = ${userId}
        AND consent_withdrawn_date IS NULL
        ORDER BY consent_date DESC
      `);

      return result.rows;
    } catch (error) {
      console.error('Error getting consent status:', error);
      throw new Error('Failed to get consent status');
    }
  }

  /**
   * Get data subject requests for admin review
   */
  static async getDataSubjectRequests(status?: string): Promise<any[]> {
    try {
      const whereClause = status ? sql`WHERE status = ${status}` : sql``;
      
      const result = await db.execute(sql`
        SELECT dsr.*, u.name as user_name, u.username
        FROM data_subject_requests dsr
        LEFT JOIN users u ON dsr.user_id = u.id
        ${whereClause}
        ORDER BY dsr.created_at DESC
        LIMIT 100
      `);

      return result.rows;
    } catch (error) {
      console.error('Error getting data subject requests:', error);
      throw new Error('Failed to get data subject requests');
    }
  }

  /**
   * Process data subject request (admin action)
   */
  static async processDataSubjectRequest(
    requestId: string, 
    status: 'completed' | 'rejected', 
    responseData?: any,
    rejectionReason?: string,
    adminNotes?: string
  ): Promise<void> {
    try {
      await db.execute(sql`
        UPDATE data_subject_requests SET
          status = ${status},
          response_data = ${JSON.stringify(responseData || {})},
          fulfillment_date = ${status === 'completed' ? 'NOW()' : null},
          rejection_reason = ${rejectionReason || null},
          admin_notes = ${adminNotes || null},
          updated_at = NOW()
        WHERE id = ${requestId}
      `);
    } catch (error) {
      console.error('Error processing data subject request:', error);
      throw new Error('Failed to process data subject request');
    }
  }

  /**
   * Log GDPR-compliant action
   */
  static async logGDPRAction(
    userId: number,
    actionType: string,
    tableName?: string,
    recordId?: string,
    legalBasis: string = 'legitimate_interest',
    purpose: string = 'system_operation'
  ): Promise<void> {
    try {
      await db.execute(sql`
        SELECT log_gdpr_action(
          ${userId},
          ${actionType},
          ${tableName || null},
          ${recordId || null},
          ${legalBasis},
          ${purpose}
        )
      `);
    } catch (error) {
      console.error('Error logging GDPR action:', error);
      // Don't throw error to avoid breaking main operations
    }
  }

  /**
   * Generate compliance report
   */
  static async generateComplianceReport(): Promise<any> {
    try {
      const report = {
        generated_at: new Date().toISOString(),
        consent_statistics: {},
        data_subject_requests: {},
        audit_summary: {},
        retention_compliance: {}
      };

      // Consent statistics
      const consentStats = await db.execute(sql`
        SELECT 
          consent_type,
          COUNT(*) as total_consents,
          SUM(CASE WHEN consent_given THEN 1 ELSE 0 END) as active_consents,
          SUM(CASE WHEN consent_withdrawn_date IS NOT NULL THEN 1 ELSE 0 END) as withdrawn_consents
        FROM privacy_consents
        GROUP BY consent_type
      `);

      report.consent_statistics = consentStats.rows;

      // Data subject request statistics
      const requestStats = await db.execute(sql`
        SELECT 
          request_type,
          status,
          COUNT(*) as count
        FROM data_subject_requests
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY request_type, status
      `);

      report.data_subject_requests = requestStats.rows;

      // Audit summary (last 30 days)
      const auditSummary = await db.execute(sql`
        SELECT 
          action_type,
          COUNT(*) as action_count
        FROM gdpr_audit_log
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY action_type
        ORDER BY action_count DESC
      `);

      report.audit_summary = auditSummary.rows;

      return report;
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw new Error('Failed to generate compliance report');
    }
  }

  /**
   * Check data retention compliance
   */
  static async checkRetentionCompliance(): Promise<any[]> {
    try {
      const issues = [];

      // Check for old inactive users (7+ years)
      const oldUsers = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM users
        WHERE created_at < NOW() - INTERVAL '7 years'
        AND is_active = false
      `);

      if (oldUsers.rows[0]?.count > 0) {
        issues.push({
          type: 'retention_violation',
          table: 'users',
          count: oldUsers.rows[0].count,
          message: 'Inactive users older than 7 years should be considered for deletion'
        });
      }

      // Check for old audit logs (6+ years)
      const oldAuditLogs = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM gdpr_audit_log
        WHERE created_at < NOW() - INTERVAL '6 years'
      `);

      if (oldAuditLogs.rows[0]?.count > 0) {
        issues.push({
          type: 'audit_retention',
          table: 'gdpr_audit_log',
          count: oldAuditLogs.rows[0].count,
          message: 'Audit logs older than 6 years should be archived or deleted'
        });
      }

      return issues;
    } catch (error) {
      console.error('Error checking retention compliance:', error);
      throw new Error('Failed to check retention compliance');
    }
  }
}