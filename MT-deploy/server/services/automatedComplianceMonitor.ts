import cron from 'node-cron';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { complianceMonitor } from './complianceMonitor';

/**
 * 11-Layer Automated Compliance Monitoring System
 * 
 * Layer 8: Sync & Automation Layer - Automated hourly compliance checks
 * Layer 9: Security & Permissions Layer - Admin-only compliance data access
 * Layer 11: Testing & Observability Layer - Comprehensive audit logging
 */

export interface ComplianceAuditLog {
  id?: number;
  timestamp: Date;
  auditType: 'scheduled' | 'manual' | 'triggered';
  overallScore: number;
  gdprScore: number;
  soc2Score: number;
  enterpriseScore: number;
  multiTenantScore: number;
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
  executionTimeMs: number;
  triggeredBy?: string;
}

class AutomatedComplianceMonitor {
  private isRunning = false;
  private lastAuditResult: ComplianceAuditLog | null = null;
  private cronJob: any = null;

  /**
   * Layer 8: Start automated hourly compliance monitoring
   */
  async startAutomatedMonitoring(): Promise<void> {
    console.log('🔒 Starting Automated Compliance Monitor...');
    
    // Run initial compliance audit
    await this.runComplianceAudit('manual', 'system_startup');
    
    // Schedule hourly compliance checks
    this.cronJob = cron.schedule('0 * * * *', async () => {
      console.log('⏰ Running scheduled compliance audit...');
      await this.runComplianceAudit('scheduled', 'cron_job');
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    this.isRunning = true;
    console.log('✅ Automated compliance monitoring started - running hourly');
  }

  /**
   * Layer 11: Run comprehensive compliance audit with logging
   */
  async runComplianceAudit(
    auditType: 'scheduled' | 'manual' | 'triggered',
    triggeredBy?: string
  ): Promise<ComplianceAuditLog> {
    const startTime = Date.now();
    console.log(`🔍 Running ${auditType} compliance audit...`);

    try {
      // Get current compliance status
      const complianceStatus = await complianceMonitor.runComprehensiveAudit();
      
      // Calculate overall compliance score
      const overallScore = Math.round(
        (complianceStatus.gdprScore + 
         complianceStatus.soc2Score + 
         complianceStatus.enterpriseScore + 
         complianceStatus.multiTenantScore) / 4
      );

      // Identify critical issues and warnings
      const criticalIssues: string[] = [];
      const warnings: string[] = [];
      const recommendations: string[] = [];

      // GDPR Critical Issues
      if (complianceStatus.gdprScore < 80) {
        criticalIssues.push('GDPR compliance below 80%');
        recommendations.push('Implement missing GDPR controls');
      } else if (complianceStatus.gdprScore < 90) {
        warnings.push('GDPR compliance needs improvement');
      }

      // SOC 2 Type II Issues
      if (complianceStatus.soc2Score < 75) {
        criticalIssues.push('SOC 2 Type II readiness below 75%');
        recommendations.push('Address SOC 2 control gaps');
      } else if (complianceStatus.soc2Score < 85) {
        warnings.push('SOC 2 Type II preparation needed');
      }

      // Enterprise Data Handling
      if (complianceStatus.enterpriseScore < 70) {
        criticalIssues.push('Enterprise data handling below acceptable threshold');
        recommendations.push('Enhance enterprise security controls');
      }

      // Multi-tenant Security
      if (complianceStatus.multiTenantScore < 75) {
        criticalIssues.push('Multi-tenant security needs improvement');
        recommendations.push('Strengthen tenant isolation');
      }

      const executionTime = Date.now() - startTime;

      const auditLog: ComplianceAuditLog = {
        timestamp: new Date(),
        auditType,
        overallScore,
        gdprScore: complianceStatus.gdprScore,
        soc2Score: complianceStatus.soc2Score,
        enterpriseScore: complianceStatus.enterpriseScore,
        multiTenantScore: complianceStatus.multiTenantScore,
        criticalIssues,
        warnings,
        recommendations,
        executionTimeMs: executionTime,
        triggeredBy
      };

      // Store audit log in database
      await this.saveAuditLog(auditLog);

      // Log critical issues
      if (criticalIssues.length > 0) {
        console.log(`🚨 [CRITICAL] ${new Date().toISOString()}: ${criticalIssues.join(', ')}`);
      }

      // Log overall compliance score
      console.log(`📊 Compliance audit completed. Overall score: ${overallScore}%`);

      this.lastAuditResult = auditLog;
      return auditLog;

    } catch (error) {
      console.error('❌ Compliance audit failed:', error);
      
      const failureLog: ComplianceAuditLog = {
        timestamp: new Date(),
        auditType,
        overallScore: 0,
        gdprScore: 0,
        soc2Score: 0,
        enterpriseScore: 0,
        multiTenantScore: 0,
        criticalIssues: [`Audit execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        recommendations: ['Investigate audit system failure'],
        executionTimeMs: Date.now() - startTime,
        triggeredBy
      };

      await this.saveAuditLog(failureLog);
      this.lastAuditResult = failureLog;
      return failureLog;
    }
  }

  /**
   * Layer 5: Save audit log to database
   */
  private async saveAuditLog(auditLog: ComplianceAuditLog): Promise<void> {
    try {
      await db.execute(sql`
        INSERT INTO compliance_audit_logs (
          timestamp, audit_type, overall_score, gdpr_score, soc2_score,
          enterprise_score, multi_tenant_score, critical_issues, warnings,
          recommendations, execution_time_ms, triggered_by
        ) VALUES (
          ${auditLog.timestamp}, ${auditLog.auditType}, ${auditLog.overallScore},
          ${auditLog.gdprScore}, ${auditLog.soc2Score}, ${auditLog.enterpriseScore},
          ${auditLog.multiTenantScore}, ${JSON.stringify(auditLog.criticalIssues)},
          ${JSON.stringify(auditLog.warnings)}, ${JSON.stringify(auditLog.recommendations)},
          ${auditLog.executionTimeMs}, ${auditLog.triggeredBy || null}
        )
      `);
    } catch (error) {
      console.error('Failed to save compliance audit log:', error);
    }
  }

  /**
   * Layer 7: Get recent audit history for admin dashboard
   */
  async getAuditHistory(limit: number = 10): Promise<ComplianceAuditLog[]> {
    try {
      const result = await db.execute(sql`
        SELECT * FROM compliance_audit_logs 
        ORDER BY timestamp DESC 
        LIMIT ${limit}
      `);

      return result.rows.map(row => ({
        id: Number(row.id),
        timestamp: new Date(row.timestamp),
        auditType: row.audit_type as 'scheduled' | 'manual' | 'triggered',
        overallScore: Number(row.overall_score),
        gdprScore: Number(row.gdpr_score),
        soc2Score: Number(row.soc2_score),
        enterpriseScore: Number(row.enterprise_score),
        multiTenantScore: Number(row.multi_tenant_score),
        criticalIssues: JSON.parse(row.critical_issues || '[]'),
        warnings: JSON.parse(row.warnings || '[]'),
        recommendations: JSON.parse(row.recommendations || '[]'),
        executionTimeMs: Number(row.execution_time_ms),
        triggeredBy: row.triggered_by
      }));
    } catch (error) {
      console.error('Failed to get audit history:', error);
      return [];
    }
  }

  /**
   * Layer 7: Get current compliance status
   */
  getCurrentComplianceStatus(): ComplianceAuditLog | null {
    return this.lastAuditResult;
  }

  /**
   * Layer 7: Manual compliance refresh for admin dashboard
   */
  async refreshCompliance(triggeredBy: string): Promise<ComplianceAuditLog> {
    console.log(`🔄 Manual compliance refresh triggered by: ${triggeredBy}`);
    return await this.runComplianceAudit('manual', triggeredBy);
  }

  /**
   * Layer 8: Stop automated monitoring
   */
  stopAutomatedMonitoring(): void {
    if (this.cronJob) {
      this.cronJob.destroy();
      this.cronJob = null;
    }
    this.isRunning = false;
    console.log('🛑 Automated compliance monitoring stopped');
  }

  /**
   * Layer 11: Get monitoring status
   */
  getMonitoringStatus(): {
    isRunning: boolean;
    lastAudit: ComplianceAuditLog | null;
    nextScheduledAudit: string;
  } {
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);

    return {
      isRunning: this.isRunning,
      lastAudit: this.lastAuditResult,
      nextScheduledAudit: nextHour.toISOString()
    };
  }
}

// Create and export singleton instance
export const automatedComplianceMonitor = new AutomatedComplianceMonitor();

// Layer 5: Create compliance audit logs table if it doesn't exist
export async function initializeComplianceAuditTable(): Promise<void> {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS compliance_audit_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL,
        audit_type VARCHAR(20) NOT NULL,
        overall_score INTEGER NOT NULL,
        gdpr_score INTEGER NOT NULL,
        soc2_score INTEGER NOT NULL,
        enterprise_score INTEGER NOT NULL,
        multi_tenant_score INTEGER NOT NULL,
        critical_issues JSONB DEFAULT '[]',
        warnings JSONB DEFAULT '[]',
        recommendations JSONB DEFAULT '[]',
        execution_time_ms INTEGER NOT NULL,
        triggered_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_timestamp 
      ON compliance_audit_logs(timestamp DESC)
    `);

    console.log('✅ Compliance audit logs table initialized');
  } catch (error) {
    console.error('❌ Failed to initialize compliance audit logs table:', error);
  }
}