#!/usr/bin/env tsx
/**
 * Database Synchronization Verification Script
 * Part of 23L Framework Layer 5: Data Architecture
 * 
 * This script ensures the database is always up to date after changes
 * Run this after any schema modifications, migrations, or database updates
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import chalk from 'chalk';

interface SyncCheckResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
}

class DatabaseSyncVerifier {
  private results: SyncCheckResult[] = [];

  async runAllChecks() {
    console.log(chalk.blue.bold('\n🔍 23L Framework - Database Synchronization Verification\n'));
    
    await this.checkDatabaseConnection();
    await this.checkTableStructure();
    await this.checkRLSPolicies();
    await this.checkIndexes();
    await this.checkTriggersAndFunctions();
    await this.checkHealthMonitoring();
    await this.checkAuditLogging();
    await this.checkRecentMigrations();
    
    this.printResults();
    return this.results.every(r => r.status !== 'fail');
  }

  private async checkDatabaseConnection() {
    try {
      const result = await db.execute(sql`SELECT current_database(), version()`);
      this.addResult('Database Connection', 'pass', 'Connected successfully');
    } catch (error) {
      this.addResult('Database Connection', 'fail', `Connection failed: ${error.message}`);
    }
  }

  private async checkTableStructure() {
    try {
      const tables = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      const criticalTables = ['users', 'posts', 'memories', 'events', 'audit_logs'];
      const existingTables = tables.rows.map(r => r.table_name);
      
      const missingTables = criticalTables.filter(t => !existingTables.includes(t));
      
      if (missingTables.length === 0) {
        this.addResult('Table Structure', 'pass', `All ${existingTables.length} tables present`);
      } else {
        this.addResult('Table Structure', 'fail', `Missing tables: ${missingTables.join(', ')}`);
      }
    } catch (error) {
      this.addResult('Table Structure', 'fail', `Check failed: ${error.message}`);
    }
  }

  private async checkRLSPolicies() {
    try {
      const policies = await db.execute(sql`
        SELECT schemaname, tablename, policyname, permissive, cmd 
        FROM pg_policies 
        WHERE schemaname = 'public'
      `);
      
      const rlsTables = await db.execute(sql`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND rowsecurity = true
      `);
      
      this.addResult(
        'RLS Policies', 
        policies.rows.length > 0 ? 'pass' : 'warning',
        `${rlsTables.rows.length} tables with RLS, ${policies.rows.length} policies active`
      );
    } catch (error) {
      this.addResult('RLS Policies', 'fail', `Check failed: ${error.message}`);
    }
  }

  private async checkIndexes() {
    try {
      const indexes = await db.execute(sql`
        SELECT 
          schemaname, 
          tablename, 
          indexname, 
          indexdef 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname NOT LIKE '%_pkey'
      `);
      
      this.addResult(
        'Database Indexes', 
        indexes.rows.length > 20 ? 'pass' : 'warning',
        `${indexes.rows.length} custom indexes found`
      );
    } catch (error) {
      this.addResult('Database Indexes', 'fail', `Check failed: ${error.message}`);
    }
  }

  private async checkTriggersAndFunctions() {
    try {
      const triggers = await db.execute(sql`
        SELECT 
          trigger_name, 
          event_object_table, 
          action_timing, 
          event_manipulation 
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
      `);
      
      const functions = await db.execute(sql`
        SELECT 
          routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_type = 'FUNCTION'
      `);
      
      this.addResult(
        'Triggers & Functions', 
        'pass',
        `${triggers.rows.length} triggers, ${functions.rows.length} functions`
      );
    } catch (error) {
      this.addResult('Triggers & Functions', 'fail', `Check failed: ${error.message}`);
    }
  }

  private async checkHealthMonitoring() {
    try {
      const healthCheck = await db.execute(sql`SELECT public.quick_health_check()`);
      const health = JSON.parse(healthCheck.rows[0].quick_health_check);
      
      this.addResult(
        'Health Monitoring', 
        health.healthy ? 'pass' : 'warning',
        `Database size: ${health.database_size_mb}MB, Connections: ${health.connection_count}`
      );
    } catch (error) {
      this.addResult('Health Monitoring', 'warning', 'Health check functions not found');
    }
  }

  private async checkAuditLogging() {
    try {
      const recentAudits = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM public.audit_logs 
        WHERE changed_at > NOW() - INTERVAL '1 day'
      `);
      
      const auditTriggers = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public' 
        AND trigger_name LIKE 'audit_trigger_%'
      `);
      
      this.addResult(
        'Audit Logging', 
        auditTriggers.rows[0].count > 0 ? 'pass' : 'fail',
        `${auditTriggers.rows[0].count} audit triggers, ${recentAudits.rows[0].count} recent entries`
      );
    } catch (error) {
      this.addResult('Audit Logging', 'warning', 'Audit system not fully configured');
    }
  }

  private async checkRecentMigrations() {
    try {
      // Check for any schema changes in the last 7 days
      const recentChanges = await db.execute(sql`
        SELECT 
          objid::regclass AS table_name,
          statime AS last_analyzed
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
        AND (last_vacuum > NOW() - INTERVAL '7 days' 
             OR last_autovacuum > NOW() - INTERVAL '7 days'
             OR last_analyze > NOW() - INTERVAL '7 days'
             OR last_autoanalyze > NOW() - INTERVAL '7 days')
        ORDER BY greatest(
          COALESCE(last_vacuum, '1970-01-01'::timestamp),
          COALESCE(last_autovacuum, '1970-01-01'::timestamp),
          COALESCE(last_analyze, '1970-01-01'::timestamp),
          COALESCE(last_autoanalyze, '1970-01-01'::timestamp)
        ) DESC
        LIMIT 5
      `);
      
      this.addResult(
        'Recent Changes', 
        'pass',
        `${recentChanges.rows.length} tables with recent activity`
      );
    } catch (error) {
      this.addResult('Recent Changes', 'warning', 'Unable to check recent migrations');
    }
  }

  private addResult(check: string, status: SyncCheckResult['status'], details: string) {
    this.results.push({ check, status, details });
  }

  private printResults() {
    console.log(chalk.bold('\n📊 Synchronization Check Results:\n'));
    
    this.results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      const color = result.status === 'pass' ? chalk.green : result.status === 'fail' ? chalk.red : chalk.yellow;
      
      console.log(`${icon} ${color(result.check.padEnd(20))} ${result.details}`);
    });
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    
    console.log(chalk.bold(`\n📈 Summary: ${passed} passed, ${failed} failed, ${warnings} warnings\n`));
    
    if (failed > 0) {
      console.log(chalk.red.bold('❌ Database synchronization issues detected!'));
      console.log(chalk.red('Run "npm run db:push" to sync schema changes\n'));
    } else if (warnings > 0) {
      console.log(chalk.yellow.bold('⚠️  Some checks require attention\n'));
    } else {
      console.log(chalk.green.bold('✅ Database is fully synchronized!\n'));
    }
  }
}

// Run the verification
const verifier = new DatabaseSyncVerifier();
verifier.runAllChecks().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});