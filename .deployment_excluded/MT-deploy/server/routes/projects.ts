// ESA 59x21 Project Tracker API Routes
import { Router } from 'express';
import { db } from '../db';
import { projects, projectActivity } from '../../shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import type { Request, Response } from 'express';

const router = Router();

// Get all projects with optional filters
router.get('/projects', async (req: Request, res: Response) => {
  try {
    const { status, priority, layer, parentId } = req.query;
    
    // Build filter conditions
    const conditions = [];
    if (status && status !== 'all') conditions.push(eq(projects.status, status as string));
    if (priority && priority !== 'all') conditions.push(eq(projects.priority, priority as string));
    if (layer) conditions.push(eq(projects.layer, parseInt(layer as string)));
    if (parentId) conditions.push(eq(projects.parentId, parentId as string));
    
    // Query with filters
    const query = conditions.length > 0 
      ? db.select().from(projects).where(and(...conditions)).orderBy(desc(projects.createdAt))
      : db.select().from(projects).orderBy(desc(projects.createdAt));
      
    const result = await query;
    
    res.json({ 
      success: true, 
      data: result,
      count: result.length 
    });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get project metrics summary
router.get('/projects/metrics/summary', async (req: Request, res: Response) => {
  try {
    // Get counts by status
    const statusCounts = await db
      .select({
        status: projects.status,
        count: sql<number>`count(*)::int`
      })
      .from(projects)
      .groupBy(projects.status);
    
    // Get overall metrics
    const metrics = await db
      .select({
        totalProjects: sql<number>`count(*)::int`,
        avgCompletion: sql<number>`avg(completion)::numeric`,
        totalEstimatedHours: sql<number>`sum(estimated_hours)::int`,
        totalActualHours: sql<number>`sum(actual_hours)::int`
      })
      .from(projects);
    
    // Get layer distribution
    const layerDistribution = await db
      .select({
        layer: projects.layer,
        count: sql<number>`count(*)::int`
      })
      .from(projects)
      .where(sql`layer IS NOT NULL`)
      .groupBy(projects.layer)
      .orderBy(projects.layer);
    
    res.json({
      success: true,
      data: {
        statusCounts,
        ...metrics[0],
        layerDistribution,
        timestamp: new Date()
      }
    });
  } catch (error: any) {
    console.error('Error fetching project metrics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single project
router.get('/projects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    
    // Get activities for this project
    const activities = await db
      .select()
      .from(projectActivity)
      .where(eq(projectActivity.projectId, id))
      .orderBy(desc(projectActivity.timestamp));
    
    res.json({ 
      success: true, 
      data: {
        ...project,
        activities
      }
    });
  } catch (error: any) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new project
router.post('/projects', async (req: Request, res: Response) => {
  try {
    const projectData = req.body;
    
    const [newProject] = await db
      .insert(projects)
      .values({
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    // Log activity
    await db.insert(projectActivity).values({
      projectId: newProject.id,
      action: 'created',
      description: 'Project created',
      userId: req.user?.id ? parseInt(req.user.id) : null,
      timestamp: new Date()
    });
    
    res.json({ 
      success: true, 
      data: newProject 
    });
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update project
router.put('/projects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const [updatedProject] = await db
      .update(projects)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(projects.id, id))
      .returning();
    
    if (!updatedProject) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    
    // Log activity
    await db.insert(projectActivity).values({
      projectId: id,
      action: 'updated',
      description: `Updated: ${Object.keys(updates).join(', ')}`,
      userId: req.user?.id ? parseInt(req.user.id) : null,
      timestamp: new Date()
    });
    
    res.json({ 
      success: true, 
      data: updatedProject 
    });
  } catch (error: any) {
    console.error('Error updating project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete project
router.delete('/projects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Delete activities first (projectId is varchar in schema)
    await db.delete(projectActivity).where(eq(projectActivity.projectId, id));
    
    // Delete project
    const [deletedProject] = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();
    
    if (!deletedProject) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    
    res.json({ 
      success: true, 
      data: deletedProject 
    });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk import projects
router.post('/projects/bulk-import', async (req: Request, res: Response) => {
  try {
    const { projects: projectsData } = req.body;
    
    if (!Array.isArray(projectsData)) {
      return res.status(400).json({ success: false, error: 'Projects must be an array' });
    }
    
    const importedProjects = await db
      .insert(projects)
      .values(projectsData.map(p => ({
        ...p,
        createdAt: new Date(),
        updatedAt: new Date()
      })))
      .returning();
    
    res.json({ 
      success: true, 
      data: importedProjects,
      count: importedProjects.length
    });
  } catch (error: any) {
    console.error('Error bulk importing projects:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;