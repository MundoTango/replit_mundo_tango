// ESA LIFE CEO 61x21 - Layer 57: Automation Routes
// City Group Creation Automation Endpoint

const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Normalize city name for consistent storage
function normalizeCityName(name) {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, ' '); // Normalize whitespace
}

// Generate slug from city name and country
function generateSlug(name, countryCode) {
  const normalized = normalizeCityName(name);
  const slugBase = normalized.replace(/\s+/g, '-');
  const country = (countryCode || '').toLowerCase();
  return country ? `${slugBase}-${country}` : slugBase;
}

// City Group Creation Automation Endpoint
router.post('/api/automation/city-group', async (req, res) => {
  const { name, countryCode, source, lat, lng } = req.body;

  // Validate input
  if (!name || !source) {
    return res.status(400).json({
      error: 'Missing required fields: name and source'
    });
  }

  // Validate source
  const validSources = ['user.registration', 'event.city', 'post.city', 'seed.import'];
  if (!validSources.includes(source)) {
    return res.status(400).json({
      error: `Invalid source. Must be one of: ${validSources.join(', ')}`
    });
  }

  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Normalize inputs
    const normalizedName = normalizeCityName(name);
    const slug = generateSlug(name, countryCode);
    const displayName = name.trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // Try to find existing city group (case-insensitive, accent-insensitive)
    const findQuery = `
      SELECT id, name, slug, country, member_count
      FROM groups 
      WHERE type = 'city'
        AND (lower(name) = lower($1) OR slug = $2)
      LIMIT 1
    `;
    
    const existing = await client.query(findQuery, [name, slug]);
    
    let result;
    let action;
    
    if (existing.rows.length > 0) {
      // City group exists - connect
      action = 'connected';
      result = existing.rows[0];
      
      // Log the connection
      await client.query(`
        INSERT INTO automation_audit (topic, source, input, result, user_id, success)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        'city-group-create',
        source,
        JSON.stringify({ name, countryCode, lat, lng }),
        JSON.stringify({ action, cityGroupId: result.id, normalizedName, slug }),
        req.user?.id || null,
        true
      ]).catch(() => {
        // Audit table might not exist yet, continue anyway
      });
      
    } else {
      // Create new city group with advisory lock for concurrency protection
      const lockQuery = `SELECT pg_advisory_xact_lock(hashtext($1))`;
      await client.query(lockQuery, [`city-group-${slug}`]);
      
      // Double-check after acquiring lock
      const recheckQuery = await client.query(findQuery, [name, slug]);
      
      if (recheckQuery.rows.length > 0) {
        // Another transaction created it while we waited for lock
        action = 'connected';
        result = recheckQuery.rows[0];
      } else {
        // Create new city group
        const insertQuery = `
          INSERT INTO groups (
            name, slug, type, country, city, latitude, longitude,
            member_count, created_at, updated_at
          ) VALUES ($1, $2, 'city', $3, $1, $4, $5, 0, NOW(), NOW())
          RETURNING id, name, slug, country, member_count
        `;
        
        const insertResult = await client.query(insertQuery, [
          displayName,
          slug,
          countryCode?.toUpperCase() || null,
          lat || null,
          lng || null
        ]);
        
        action = 'created';
        result = insertResult.rows[0];
        
        // Log the creation
        await client.query(`
          INSERT INTO automation_audit (topic, source, input, result, user_id, success)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          'city-group-create',
          source,
          JSON.stringify({ name, countryCode, lat, lng }),
          JSON.stringify({ action, cityGroupId: result.id, normalizedName, slug }),
          req.user?.id || null,
          true
        ]).catch(() => {
          // Audit table might not exist yet, continue anyway
        });
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Invalidate cache
    if (global.cityGroupsCache) {
      delete global.cityGroupsCache;
    }
    
    // Return success response
    res.json({
      success: true,
      result: {
        action,
        cityGroupId: result.id,
        normalizedName,
        slug,
        cityGroup: result
      }
    });
    
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    
    console.error('City group automation error:', error);
    
    // Log failure to audit
    try {
      await pool.query(`
        INSERT INTO automation_audit (topic, source, input, result, user_id, success)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        'city-group-create',
        source,
        JSON.stringify({ name, countryCode, lat, lng }),
        JSON.stringify({ error: error.message }),
        req.user?.id || null,
        false
      ]);
    } catch (auditError) {
      // Ignore audit errors
    }
    
    res.status(500).json({
      error: 'Failed to create/connect city group',
      detail: error.message
    });
    
  } finally {
    client.release();
  }
});

// Get city group statistics (for cache validation)
router.get('/api/community/city-groups-stats', async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_groups,
        SUM(member_count) as total_users,
        MAX(updated_at) as last_updated
      FROM groups
      WHERE type = 'city'
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      stats: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching city group stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;