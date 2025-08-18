#!/usr/bin/env node
import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ESA-44x21 Database Security Migration
// Layer 5: Data Layer - Apply RLS policies

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function applyRLSPolicies() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🔒 Applying ESA-44x21 Database Security Policies...\n');

    // Read the RLS policies SQL file
    const rlsPoliciesSQL = readFileSync(
      join(__dirname, '../security/rls_policies.sql'),
      'utf8'
    );

    // Split into individual statements (simple split by semicolon + newline)
    const statements = rlsPoliciesSQL
      .split(';\n')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    // Apply each statement
    for (const statement of statements) {
      try {
        // Skip empty statements
        if (!statement.trim()) continue;

        // Log the type of operation
        const operation = statement.match(/^(CREATE|ALTER|GRANT|DROP)/i)?.[1] || 'EXECUTE';
        const target = statement.match(/(?:TABLE|POLICY|FUNCTION|VIEW|TRIGGER)\s+(?:IF\s+(?:NOT\s+)?EXISTS\s+)?["']?(\w+)/i)?.[1] || 'object';
        
        console.log(`  ⏳ ${operation} ${target}...`);
        
        await pool.query(statement + ';');
        console.log(`  ✅ ${operation} ${target} completed`);
        successCount++;
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
        errorCount++;
        
        // Continue with other statements even if one fails
        // This allows partial application in case some policies already exist
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Successful operations: ${successCount}`);
    console.log(`  ❌ Failed operations: ${errorCount}`);

    // Verify critical tables have RLS enabled
    console.log('\n🔍 Verifying RLS status on critical tables...');
    
    const criticalTables = [
      'users',
      'subscriptions',
      'payments',
      'payment_methods',
      'webhook_events'
    ];

    const rlsCheckQuery = `
      SELECT 
        schemaname,
        tablename,
        rowsecurity
      FROM pg_tables
      WHERE tablename = ANY($1)
      AND schemaname = 'public';
    `;

    const rlsStatus = await pool.query(rlsCheckQuery, [criticalTables]);
    
    console.log('\n📋 RLS Status:');
    for (const row of rlsStatus.rows) {
      const status = row.rowsecurity ? '✅ Enabled' : '❌ Disabled';
      console.log(`  ${row.tablename}: ${status}`);
    }

    // Check if payment service account exists
    console.log('\n🔍 Checking payment service account...');
    
    const roleCheckQuery = `
      SELECT 1 FROM pg_roles WHERE rolname = 'payment_service';
    `;
    
    const roleExists = await pool.query(roleCheckQuery);
    
    if (roleExists.rows.length === 0) {
      console.log('  ⚠️  Payment service account not found');
      console.log('  ℹ️  Create it with: CREATE ROLE payment_service WITH LOGIN PASSWORD \'secure_password\';');
    } else {
      console.log('  ✅ Payment service account exists');
    }

    // Test audit log functionality
    console.log('\n🧪 Testing audit log...');
    
    const auditTestQuery = `
      SELECT COUNT(*) as count FROM security_audit_log;
    `;
    
    try {
      const auditResult = await pool.query(auditTestQuery);
      console.log(`  ✅ Audit log table accessible (${auditResult.rows[0].count} entries)`);
    } catch (error) {
      console.log('  ❌ Audit log table not accessible:', error.message);
    }

    if (errorCount === 0) {
      console.log('\n✅ Database security policies applied successfully!');
    } else {
      console.log('\n⚠️  Some operations failed. Please review the errors above.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
applyRLSPolicies()
  .then(() => {
    console.log('\n🎉 ESA-44x21 Database Security Migration Complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });