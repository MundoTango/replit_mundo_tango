/**
 * RBAC/ABAC API Routes
 * Comprehensive permission management endpoints
 */

import { Router } from 'express';
import { rbacAbacManager } from './services/rbacAbacManager';
import { isAuthenticated } from './replitAuth';

const router = Router();

// ============================================================================
// LAYER 6: BACKEND LAYER - Core Permission Management Routes
// ============================================================================

/**
 * Get all role definitions
 */
router.get('/roles', isAuthenticated, async (req, res) => {
  try {
    const roles = rbacAbacManager.getRoleDefinitions();
    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve roles'
    });
  }
});

/**
 * Get all permission policies
 */
router.get('/policies', isAuthenticated, async (req, res) => {
  try {
    // Check if user has admin access
    const hasAccess = await rbacAbacManager.hasPermission(
      req.user!.id, 
      'rbac', 
      'view_policies'
    );
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view policies'
      });
    }

    const policies = rbacAbacManager.getPermissionPolicies();
    res.json({
      success: true,
      data: policies
    });
  } catch (error) {
    console.error('Get policies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve policies'
    });
  }
});

/**
 * Check permission for user
 */
router.post('/check-permission', isAuthenticated, async (req, res) => {
  try {
    const { userId, resource, action, resourceId } = req.body;
    
    // Users can check their own permissions, admins can check any
    const canCheck = req.user!.id === userId || 
                    await rbacAbacManager.hasPermission(req.user!.id, 'rbac', 'check_permissions');
    
    if (!canCheck) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to check permissions'
      });
    }

    const result = await rbacAbacManager.evaluatePermission({
      userId,
      resource,
      action,
      resourceId,
      environment: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
      }
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Check permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check permission'
    });
  }
});

/**
 * Get user roles and permissions
 */
router.get('/user/:userId/roles', isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Users can view their own roles, admins can view any
    const canView = req.user!.id === userId || 
                   await rbacAbacManager.hasPermission(req.user!.id, 'users', 'view_roles');
    
    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view user roles'
      });
    }

    const roleInfo = await rbacAbacManager.getUserRoleInfo(userId);
    
    res.json({
      success: true,
      data: {
        userId,
        roles: roleInfo
      }
    });
  } catch (error) {
    console.error('Get user roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user roles'
    });
  }
});

/**
 * Get permission analytics
 */
router.get('/analytics', isAuthenticated, async (req, res) => {
  try {
    const hasAccess = await rbacAbacManager.hasPermission(
      req.user!.id, 
      'rbac', 
      'view_analytics'
    );
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view analytics'
      });
    }

    const analytics = await rbacAbacManager.getPermissionAnalytics();
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics'
    });
  }
});

/**
 * Run compliance audit for RBAC/ABAC
 */
router.post('/compliance-audit', isAuthenticated, async (req, res) => {
  try {
    const hasAccess = await rbacAbacManager.hasPermission(
      req.user!.id, 
      'compliance', 
      'run_audit'
    );
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to run compliance audit'
      });
    }

    const auditResult = await rbacAbacManager.runComplianceAudit();
    
    res.json({
      success: true,
      data: auditResult,
      message: 'Compliance audit completed'
    });
  } catch (error) {
    console.error('Compliance audit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run compliance audit'
    });
  }
});

export default router;