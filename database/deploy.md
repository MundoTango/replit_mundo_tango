# Supabase Deployment Guide

## Quick Deployment Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Choose a database password
4. Wait for setup to complete

### 2. Run Migration
1. Open Supabase SQL Editor
2. Copy and paste `supabase_migration.sql` content
3. Click "Run" to execute migration
4. Verify all 55 tables created successfully

### 3. Add Seed Data (Optional)
1. In SQL Editor, copy and paste `seed_data.sql` content
2. Click "Run" to populate with test data
3. Browse tables to verify data inserted correctly

### 4. Get Connection Details
1. Go to Project Settings → Database
2. Copy connection string
3. Update your app's environment variables

### 5. Test Connection
```bash
# Test from your app
node testDatabase.js
```

## Expected Results

**Tables Created:** 55 total
- 8 user management tables
- 12 content & social tables
- 4 group & community tables
- 4 event system tables
- 4 messaging system tables
- 9 tango experience tables
- 3 activity tables
- 11 system & admin tables

**Seed Data (if loaded):**
- 5 test users with diverse profiles
- 3 upcoming events across different cities
- 3 community groups with memberships
- 4 posts with likes and comments
- Active chat conversations
- Friend connections and notifications

## Troubleshooting

**If migration fails:**
1. Check Supabase project limits
2. Verify SQL syntax in editor
3. Run sections individually if needed
4. Check error messages for specific issues

**If seed data fails:**
1. Ensure main migration completed first
2. Check for UUID conflicts
3. Verify foreign key relationships
4. Run smaller sections to isolate issues

## Next Steps After Deployment

1. Update app database connection string
2. Test authentication flow
3. Verify API endpoints work with new schema
4. Test real-time subscriptions
5. Deploy app to production

## Connection String Format

```
postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres
```

Replace:
- `[PASSWORD]` with your database password
- `[PROJECT_REF]` with your Supabase project reference