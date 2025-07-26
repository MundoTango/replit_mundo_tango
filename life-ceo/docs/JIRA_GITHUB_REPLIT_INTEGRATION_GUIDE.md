# JIRA + GitHub + Replit Integration Guide
*Created: July 26, 2025*
*Framework: Life CEO 40x20s*

## Overview
This guide documents the complete integration between JIRA, GitHub, and Replit for the Mundo Tango platform, enabling seamless project management across all 40x20s framework teams.

## Current JIRA Setup

### Team Structure
Based on the Platform team screenshot, your JIRA instance (mundotango-team.atlassian.net) is configured with:
- **Project**: MT (Mundo Tango)
- **Current Team**: Platform
- **Admin**: admin mundotango

### Recent Activity
The system shows recent issue activity including:
- Performance API Response Time optimization
- Image Lazy Loading implementation
- Bundle Optimization tasks

## Step 1: Create 40x20s Framework Teams in JIRA

### Navigate to Team Creation
1. Go to **Project Settings** → **Teams**
2. Click **"Create Team"** for each of the following:

### Primary Development Teams
- **Frontend Team** - UI/UX, React, Components (Layers 7-8)
- **Backend Team** - APIs, Services, Business Logic (Layers 5-6)
- **Database Team** - Schema, Migrations, Optimization (Layers 2-4)
- **API Team** - REST endpoints, GraphQL, Integration (Layer 6)
- **Infrastructure Team** - Deployment, Scaling, Monitoring (Layers 9-10)

### Specialized Teams
- **Business Logic Team** - Domain logic, Rules engine (Layer 6)
- **Product Team** - Requirements, User stories, Roadmap (Layer 1)
- **Media Team** - Images, Videos, CDN management (Layer 8)
- **DevOps Team** - CI/CD, Automation, Deployment (Layers 9-10)
- **Analytics Team** - Metrics, Reporting, Insights (Layer 11)
- **QA Team** - Testing, Quality assurance (Layer 12)
- **Security Team** - Auth, Encryption, Compliance (Layers 13-14)
- **Performance Team** - Optimization, Caching (Layer 15)
- **AI Team** - Life CEO, ML features (Layers 16-20)
- **Platform Team** - Cross-cutting concerns (All layers)

### Team Configuration for Each
1. **Team Name**: Use exact names above
2. **Team Lead**: Assign appropriate member
3. **Description**: Include 40x20s layer mapping
4. **Access**: Set to "Project access"

## Step 2: GitHub Integration Configuration

### Install GitHub for JIRA App
1. Go to **Project Settings** → **Apps** → **GitHub for Jira**
2. Click **"Get it now"** if not installed
3. Authorize the GitHub app (Installation ID: 77570686)

### Connect Repository
1. In GitHub for JIRA app, click **"Connect a repository"**
2. Select organization: Your GitHub org
3. Choose repository: `mundo-tango` (or your repo name)
4. Grant permissions:
   - Read access to code
   - Read access to pull requests
   - Read access to issues
   - Write access to pull request statuses

### Configure Smart Commits
Enable smart commits to link commits to JIRA issues:
```bash
# Example commit message
git commit -m "MT-123 Implement lazy loading for Redis connections

- Added lazy initialization pattern
- Fixed environment variable loading order
- Updated documentation"
```

## Step 3: Replit Integration Setup

### Environment Variables
Add to your Replit secrets:
```env
JIRA_API_TOKEN=your-jira-api-token
JIRA_EMAIL=admin@mundotango.life
JIRA_DOMAIN=mundotango-team.atlassian.net
GITHUB_TOKEN=your-github-token
```

### Webhook Configuration
1. In Replit, create webhook endpoint:
```javascript
// server/routes/webhooks.ts
router.post('/webhooks/github', async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;
  
  // Update JIRA based on GitHub events
  if (event === 'pull_request') {
    await updateJiraIssue(payload);
  }
});
```

2. In GitHub, add webhook:
   - URL: `https://your-replit-app.replit.app/webhooks/github`
   - Events: Pull requests, Issues, Pushes

## Step 4: Development Workflow

### 1. Create JIRA Issue
- Assign to appropriate 40x20s team
- Set layer/phase in custom fields
- Add story points

### 2. Create Feature Branch
```bash
# Branch naming convention
git checkout -b MT-123-redis-lazy-loading
```

### 3. Make Changes in Replit
- Code changes auto-sync with GitHub
- Commits reference JIRA issue

### 4. Create Pull Request
- PR title includes JIRA issue: "MT-123: Fix Redis connections"
- GitHub integration updates JIRA automatically

### 5. JIRA Automation
- Issue moves to "In Progress" on first commit
- Updates to "In Review" on PR creation
- Transitions to "Done" on PR merge

## Step 5: Team-Specific Views

### Create Team Dashboards
For each 40x20s team, create a dashboard showing:
1. **Active Sprint** - Current team tasks
2. **Backlog** - Upcoming work by layer
3. **Performance Metrics** - Team velocity
4. **Layer Coverage** - Work distribution across 40x20s layers

### Configure Notifications
1. Go to **Project Settings** → **Notifications**
2. Set team-specific notifications:
   - Frontend Team: UI-related issues
   - Backend Team: API issues
   - Performance Team: Performance issues

## Step 6: Life CEO Integration

### Automated Issue Creation
```javascript
// life-ceo/services/jiraIntegrationService.ts
export async function createJiraIssue(data: {
  title: string;
  description: string;
  layer: number;
  phase: number;
  team: string;
}) {
  const jira = new JiraClient({
    host: process.env.JIRA_DOMAIN,
    email: process.env.JIRA_EMAIL,
    token: process.env.JIRA_API_TOKEN
  });

  return await jira.issue.createIssue({
    fields: {
      project: { key: 'MT' },
      summary: data.title,
      description: data.description,
      issuetype: { name: 'Task' },
      customfield_10100: data.layer, // 40x20s Layer
      customfield_10101: data.phase, // 40x20s Phase
      components: [{ name: data.team }]
    }
  });
}
```

## Troubleshooting

### Common Issues

1. **GitHub Integration Not Working**
   - Verify GitHub app permissions
   - Check webhook delivery in GitHub settings
   - Ensure JIRA project key matches commit messages

2. **Teams Not Visible**
   - Confirm team creation in correct project
   - Check user permissions for team access
   - Refresh JIRA page after team creation

3. **Replit Webhooks Failing**
   - Verify environment variables are set
   - Check Replit logs for errors
   - Test webhook endpoint manually

## Best Practices

1. **Consistent Naming**: Use MT-XXX format for all issues
2. **Layer Assignment**: Always assign 40x20s layer to issues
3. **Team Ownership**: Each issue should have clear team assignment
4. **Smart Commits**: Include issue keys in all commits
5. **Regular Sync**: Run daily sync between systems

## Metrics & Reporting

Track integration effectiveness:
- **Commit-to-Issue Ratio**: Should be >90%
- **PR-to-Issue Links**: Target 100%
- **Team Velocity**: Monitor by 40x20s layer
- **Integration Errors**: Keep <1% failure rate

## Next Steps

1. Complete team creation in JIRA (15 teams)
2. Configure GitHub webhook in repository settings
3. Test integration with sample issue/PR flow
4. Train team on smart commit format
5. Set up automated reporting dashboard