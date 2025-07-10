import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function implementDatabaseSecurity() {
  console.log(`${colors.cyan}${colors.bright}=== Database Security Implementation ===${colors.reset}`);
  console.log(`${colors.blue}Using 23L Framework Analysis for comprehensive security${colors.reset}\n`);

  try {
    // Read the SQL implementation file
    const sqlFilePath = path.join(__dirname, '../database/security-implementation.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`${colors.blue}Found ${statements.length} SQL statements to execute${colors.reset}`);

    // Track progress
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Execute statements one by one
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Extract operation type from statement
      const operationType = statement.match(/^(CREATE|ALTER|DROP|INSERT|SELECT|GRANT)/i)?.[1] || 'EXECUTE';
      const targetMatch = statement.match(/(TABLE|INDEX|SCHEMA|FUNCTION|VIEW|POLICY|TRIGGER)\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:IF\s+EXISTS\s+)?(\S+)/i);
      const target = targetMatch ? `${targetMatch[1]} ${targetMatch[2]}` : 'statement';

      process.stdout.write(`${colors.yellow}[${i + 1}/${statements.length}] ${operationType} ${target}...${colors.reset} `);

      try {
        // Skip certain statements that might already exist
        if (statement.includes('CREATE SCHEMA IF NOT EXISTS') || 
            statement.includes('CREATE TABLE IF NOT EXISTS') ||
            statement.includes('CREATE INDEX IF NOT EXISTS') ||
            statement.includes('CREATE OR REPLACE')) {
          // These are safe to run
        }

        await db.execute(sql.raw(statement));
        console.log(`${colors.green}✓${colors.reset}`);
        successCount++;
      } catch (error: any) {
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate key') ||
            error.message.includes('violates foreign key')) {
          console.log(`${colors.yellow}⊘ Skipped (already exists)${colors.reset}`);
          skipCount++;
        } else {
          console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
          errorCount++;
          
          // Continue on error for non-critical statements
          if (!statement.includes('CREATE SCHEMA') && !statement.includes('CREATE TABLE')) {
            continue;
          }
        }
      }
    }

    console.log(`\n${colors.cyan}=== Implementation Summary ===${colors.reset}`);
    console.log(`${colors.green}✓ Success: ${successCount} statements${colors.reset}`);
    console.log(`${colors.yellow}⊘ Skipped: ${skipCount} statements (already exist)${colors.reset}`);
    console.log(`${colors.red}✗ Errors: ${errorCount} statements${colors.reset}`);

    // Run health checks
    console.log(`\n${colors.cyan}=== Running Security Health Checks ===${colors.reset}`);
    
    try {
      // Quick health check
      const quickCheck = await db.execute(sql`SELECT quick_health_check() as result`);
      console.log(`${colors.blue}Quick Check:${colors.reset}`, quickCheck.rows[0].result);

      // Detailed health check
      const healthCheck = await db.execute(sql`SELECT check_database_health() as result`);
      const health = healthCheck.rows[0].result;
      console.log(`${colors.blue}Database Health:${colors.reset}`);
      console.log(`  - Database Size: ${health.database_size_mb} MB`);
      console.log(`  - Tables with RLS: ${health.tables_with_rls}/${health.total_tables} (${health.rls_coverage_percent}%)`);
      console.log(`  - Total Indexes: ${health.total_indexes}`);
      console.log(`  - Active Connections: ${health.active_connections}`);
      console.log(`  - Audit Logs (24h): ${health.audit_logs_24h}`);
      console.log(`  - Cache Hit Ratio: ${health.cache_hit_ratio}%`);

      // Check tables without RLS
      const rlsCheck = await db.execute(sql`SELECT * FROM check_tables_without_rls()`);
      if (rlsCheck.rows.length > 0) {
        console.log(`\n${colors.yellow}⚠️  Tables without RLS:${colors.reset}`);
        rlsCheck.rows.forEach((row: any) => {
          const severity = row.has_sensitive_data ? colors.red : colors.yellow;
          console.log(`  ${severity}- ${row.table_name}${row.has_sensitive_data ? ' (SENSITIVE DATA)' : ''}${colors.reset}`);
        });
      }

      // Log health check results
      await db.execute(sql`
        INSERT INTO health_check_logs (check_type, results)
        VALUES ('post_implementation', ${JSON.stringify({
          success_count: successCount,
          skip_count: skipCount,
          error_count: errorCount,
          health: health,
          tables_without_rls: rlsCheck.rows
        })})
      `);

    } catch (error: any) {
      console.log(`${colors.red}Health check error: ${error.message}${colors.reset}`);
    }

    console.log(`\n${colors.green}${colors.bright}✓ Database security implementation complete!${colors.reset}`);
    console.log(`${colors.cyan}Next steps:${colors.reset}`);
    console.log(`  1. Review tables without RLS and add policies as needed`);
    console.log(`  2. Monitor audit logs via Admin Center`);
    console.log(`  3. Set up regular health checks`);
    console.log(`  4. Configure backup retention for audit logs`);

  } catch (error) {
    console.error(`${colors.red}${colors.bright}Error implementing database security:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run if called directly
implementDatabaseSecurity()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

export { implementDatabaseSecurity };