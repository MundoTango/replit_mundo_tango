import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🚀 === Pushing Database Security to Supabase ===');
console.log('📋 Using 23L Framework for systematic deployment\n');

async function executeSql(sql: string, description: string): Promise<boolean> {
  try {
    console.log(`⏳ ${description}...`);
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // Try direct execution if RPC doesn't exist
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql_query: sql })
      });
      
      if (!response.ok) {
        console.error(`❌ ${description} failed:`, await response.text());
        return false;
      }
    }
    
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error);
    return false;
  }
}

async function pushSecurityImplementation() {
  let successCount = 0;
  let failureCount = 0;

  // Step 1: Create audit schema
  const createAuditSchema = `
    -- Create audit schema if not exists
    CREATE SCHEMA IF NOT EXISTS audit;
  `;
  
  if (await executeSql(createAuditSchema, 'Creating audit schema')) {
    successCount++;
  } else {
    failureCount++;
  }

  // Step 2: Create audit logs table
  const createAuditTable = `
    -- Create audit log table
    CREATE TABLE IF NOT EXISTS audit.logs (
        id BIGSERIAL PRIMARY KEY,
        table_name text NOT NULL,
        user_id UUID,
        action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')),
        row_data jsonb,
        changed_fields jsonb,
        query text,
        ip_address inet,
        timestamp timestamptz NOT NULL DEFAULT now()
    );

    -- Create indexes for audit performance
    CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit.logs (table_name);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit.logs (user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit.logs (timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit.logs (action);
  `;
  
  if (await executeSql(createAuditTable, 'Creating audit logs table')) {
    successCount++;
  } else {
    failureCount++;
  }

  // Step 3: Create Supabase-compatible get_current_user_id function
  const createUserIdFunction = `
    -- Create function to get current user ID (Supabase compatible)
    CREATE OR REPLACE FUNCTION get_current_user_id()
    RETURNS UUID AS $$
    BEGIN
        -- Try to get from auth.uid() first (Supabase Auth)
        RETURN auth.uid();
    EXCEPTION WHEN OTHERS THEN
        -- Fallback to session variable
        RETURN current_setting('app.current_user_id', true)::UUID;
    END;
    $$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
  `;
  
  if (await executeSql(createUserIdFunction, 'Creating user ID function')) {
    successCount++;
  } else {
    failureCount++;
  }

  // Step 4: Enable RLS on critical tables
  const rlsTables = [
    'posts', 'post_comments', 'post_likes', 'stories', 'story_views',
    'notifications', 'events', 'event_participants', 'user_roles',
    'media_assets', 'media_tags', 'memories', 'memory_media'
  ];

  for (const table of rlsTables) {
    const enableRLS = `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`;
    if (await executeSql(enableRLS, `Enabling RLS on ${table}`)) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  // Step 5: Create audit trigger function
  const createAuditFunction = `
    CREATE OR REPLACE FUNCTION audit.log_changes()
    RETURNS TRIGGER AS $$
    DECLARE
        v_user_id UUID;
        v_old_data JSONB;
        v_new_data JSONB;
        v_changed_fields JSONB;
    BEGIN
        -- Get current user ID
        v_user_id := get_current_user_id();
        
        -- Handle different operations
        IF TG_OP = 'DELETE' THEN
            v_old_data := to_jsonb(OLD);
            INSERT INTO audit.logs (table_name, user_id, action, row_data, query)
            VALUES (TG_TABLE_NAME, v_user_id, TG_OP, v_old_data, current_query());
            RETURN OLD;
        ELSIF TG_OP = 'UPDATE' THEN
            v_old_data := to_jsonb(OLD);
            v_new_data := to_jsonb(NEW);
            
            -- Calculate changed fields
            SELECT jsonb_object_agg(key, value) INTO v_changed_fields
            FROM (
                SELECT key, value
                FROM jsonb_each(v_new_data)
                WHERE v_old_data->key IS DISTINCT FROM value
            ) changes;
            
            INSERT INTO audit.logs (table_name, user_id, action, row_data, changed_fields, query)
            VALUES (TG_TABLE_NAME, v_user_id, TG_OP, v_old_data, v_changed_fields, current_query());
            RETURN NEW;
        ELSIF TG_OP = 'INSERT' THEN
            v_new_data := to_jsonb(NEW);
            INSERT INTO audit.logs (table_name, user_id, action, row_data, query)
            VALUES (TG_TABLE_NAME, v_user_id, TG_OP, v_new_data, current_query());
            RETURN NEW;
        END IF;
        
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  if (await executeSql(createAuditFunction, 'Creating audit trigger function')) {
    successCount++;
  } else {
    failureCount++;
  }

  // Step 6: Apply audit triggers to critical tables
  const auditTables = ['users', 'posts', 'memories', 'events', 'user_roles', 'event_participants', 'media_assets'];
  
  for (const table of auditTables) {
    const createTrigger = `
      DROP TRIGGER IF EXISTS audit_trigger_${table} ON ${table};
      CREATE TRIGGER audit_trigger_${table}
      AFTER INSERT OR UPDATE OR DELETE ON ${table}
      FOR EACH ROW EXECUTE FUNCTION audit.log_changes();
    `;
    
    if (await executeSql(createTrigger, `Creating audit trigger for ${table}`)) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  // Step 7: Create health check functions
  const createHealthChecks = `
    -- Quick health check function
    CREATE OR REPLACE FUNCTION quick_health_check()
    RETURNS text AS $$
    DECLARE
        rls_count INTEGER;
        audit_count INTEGER;
        index_count INTEGER;
    BEGIN
        SELECT count(*) INTO rls_count 
        FROM pg_class 
        WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') 
        AND relrowsecurity = true;
        
        SELECT count(*) INTO audit_count 
        FROM audit.logs 
        WHERE timestamp > now() - interval '1 hour';
        
        SELECT count(*) INTO index_count 
        FROM pg_indexes 
        WHERE schemaname = 'public';
        
        RETURN format('RLS Tables: %s, Audit Logs (1h): %s, Indexes: %s', 
                      rls_count, audit_count, index_count);
    END;
    $$ LANGUAGE plpgsql;

    -- Comprehensive health check
    CREATE OR REPLACE FUNCTION check_database_health()
    RETURNS json AS $$
    DECLARE
        result json;
    BEGIN
        WITH stats AS (
            SELECT 
                (SELECT count(*) FROM pg_tables WHERE schemaname = 'public') as total_tables,
                (SELECT count(*) FROM pg_class WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND relrowsecurity = true) as tables_with_rls,
                (SELECT count(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
                (SELECT pg_database_size(current_database())) as database_size,
                (SELECT count(*) FROM pg_stat_activity) as active_connections,
                (SELECT count(*) FROM audit.logs WHERE timestamp > now() - interval '24 hours') as audit_logs_24h
        )
        SELECT json_build_object(
            'database_size_mb', round((database_size / 1024.0 / 1024.0)::numeric, 2),
            'total_tables', total_tables,
            'tables_with_rls', tables_with_rls,
            'rls_coverage_percent', round((tables_with_rls::numeric / NULLIF(total_tables, 0) * 100)::numeric, 2),
            'total_indexes', total_indexes,
            'active_connections', active_connections,
            'audit_logs_24h', audit_logs_24h
        ) INTO result
        FROM stats;
        
        RETURN result;
    END;
    $$ LANGUAGE plpgsql;
  `;
  
  if (await executeSql(createHealthChecks, 'Creating health check functions')) {
    successCount++;
  } else {
    failureCount++;
  }

  // Step 8: Create RLS policies for audit logs
  const createAuditPolicies = `
    -- Enable RLS on audit logs
    ALTER TABLE audit.logs ENABLE ROW LEVEL SECURITY;
    
    -- Admin-only access policy
    CREATE POLICY admin_only_access ON audit.logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_name IN ('admin', 'super_admin')
        )
    );
  `;
  
  if (await executeSql(createAuditPolicies, 'Creating audit RLS policies')) {
    successCount++;
  } else {
    failureCount++;
  }

  // Summary
  console.log('\n📊 === Deployment Summary ===');
  console.log(`✅ Successful operations: ${successCount}`);
  console.log(`❌ Failed operations: ${failureCount}`);
  console.log(`📈 Success rate: ${Math.round((successCount / (successCount + failureCount)) * 100)}%`);
  
  if (failureCount === 0) {
    console.log('\n🎉 All security features successfully deployed to Supabase!');
  } else {
    console.log('\n⚠️ Some operations failed. Please check the logs above.');
  }
}

// Run the deployment
pushSecurityImplementation().catch(console.error);