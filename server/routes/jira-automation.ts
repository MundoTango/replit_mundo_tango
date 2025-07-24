import { Router } from 'express';
import fetch from 'node-fetch';
import { comprehensiveProjectData } from '../../client/src/data/comprehensive-project-data';

const router = Router();

// Life CEO 40x20s JIRA Automation Endpoint
router.post('/api/jira/create-all-issues', async (req, res) => {
  console.log('🚀 Life CEO 40x20s: Starting JIRA automation...');
  
  const credentials = {
    instanceUrl: 'https://mundotango-team.atlassian.net',
    email: 'admin@mundotango.life',
    apiToken: 'ATATT3xFfGF0Nb_1iigWiEviNSi-kFvP965nAMjH9z8Vs9nGCu87drxemBvCdolRWcSuyDezhWll2jYjakMNp3k60H5J_eR_4uzXIb4ElbG04zEpMc2v1H7-ng_3huq3Ao41EE9VMVHWLKDFKY59whw24pQjc9Xr43lpoKTG2YLknL0o_iRHvQ8=517ED328',
    projectKey: 'KAN'
  };
  
  const authHeader = `Basic ${Buffer.from(`${credentials.email}:${credentials.apiToken}`).toString('base64')}`;
  
  try {
    // Generate export data
    const exportData = generateJiraExportData();
    const totalItems = 
      exportData.epics.length + 
      exportData.stories.length + 
      exportData.tasks.length;
    
    console.log(`📊 Total items to create: ${totalItems}`);
    
    let createdCount = 0;
    const results = {
      epics: [],
      stories: [],
      tasks: [],
      errors: []
    };
    
    // Create epics first
    for (const epic of exportData.epics) {
      try {
        const response = await fetch(`${credentials.instanceUrl}/rest/api/3/issue`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              summary: epic.summary,
              description: {
                type: 'doc',
                version: 1,
                content: [{
                  type: 'paragraph',
                  content: [{
                    type: 'text',
                    text: epic.description
                  }]
                }]
              },
              issuetype: { name: 'Epic' },
              project: { key: credentials.projectKey },
              priority: { name: epic.priority },
              labels: epic.labels
            }
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          results.epics.push(result);
          createdCount++;
          console.log(`✅ Created epic ${createdCount}/${totalItems}: ${epic.summary}`);
        } else {
          const error = await response.text();
          throw new Error(error);
        }
      } catch (error: any) {
        console.error(`❌ Failed to create epic: ${epic.summary}`, error.message);
        results.errors.push({ type: 'epic', item: epic, error: error.message });
      }
    }
    
    // Create stories
    for (const story of exportData.stories) {
      try {
        const response = await fetch(`${credentials.instanceUrl}/rest/api/3/issue`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              summary: story.summary,
              description: {
                type: 'doc',
                version: 1,
                content: [{
                  type: 'paragraph',
                  content: [{
                    type: 'text',
                    text: story.description
                  }]
                }]
              },
              issuetype: { name: 'Story' },
              project: { key: credentials.projectKey },
              priority: { name: story.priority },
              labels: story.labels
            }
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          results.stories.push(result);
          createdCount++;
          console.log(`✅ Created story ${createdCount}/${totalItems}: ${story.summary}`);
        } else {
          const error = await response.text();
          throw new Error(error);
        }
      } catch (error: any) {
        console.error(`❌ Failed to create story: ${story.summary}`, error.message);
        results.errors.push({ type: 'story', item: story, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: `Created ${createdCount} out of ${totalItems} items in JIRA`,
      created: createdCount,
      failed: results.errors.length,
      results
    });
    
  } catch (error: any) {
    console.error('❌ JIRA automation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate JIRA export data
function generateJiraExportData() {
  const epics: any[] = [];
  const stories: any[] = [];
  const tasks: any[] = [];
  
  const processItem = (item: any, parentKey?: string) => {
    const priority = item.priority || 'Medium';
    const labels = ['40x20s', `Layer-${item.layer || 1}`, `Phase-${item.phase || 1}`];
    
    if (item.type === 'Platform' || item.type === 'Section') {
      epics.push({
        summary: item.title,
        description: item.description || `${item.title} implementation using 40x20s framework`,
        priority,
        labels,
        key: `MT-EPIC-${epics.length + 1}`
      });
    } else if (item.type === 'Feature' || item.type === 'Project') {
      stories.push({
        summary: item.title,
        description: item.description || `${item.title} feature implementation`,
        priority,
        labels,
        epicLink: parentKey,
        storyPoints: Math.ceil((item.actualHours || 40) / 8)
      });
    } else if (item.type === 'Task') {
      tasks.push({
        summary: item.title,
        description: item.description || `${item.title} task implementation`,
        priority,
        labels,
        parentKey
      });
    }
    
    if (item.children) {
      item.children.forEach((child: any) => 
        processItem(child, `MT-${item.type.toUpperCase()}-${epics.length || stories.length || tasks.length}`)
      );
    }
  };
  
  comprehensiveProjectData.forEach((item: any) => processItem(item));
  
  return { epics, stories, tasks };
}

export default router;