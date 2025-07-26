# JIRA Quick Start Guide - Life CEO 40x20s Framework

## 🚀 Immediate Actions (Do These Now)

### 1. Set Environment Variables (2 minutes)
Add to your `.env` file:
```bash
JIRA_DOMAIN=mundotango-team.atlassian.net
JIRA_EMAIL=admin@mundotango.life
JIRA_API_TOKEN=your-api-token-here
GITHUB_TOKEN=your-github-token-here
```

To get your JIRA API token:
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Name it "Mundo Tango Integration"
4. Copy the token

### 2. Run Automated Setup Script (5 minutes)
```bash
# Install dependencies if needed
npm install axios

# Run the setup script
npx tsx scripts/jira-team-setup.ts
```

This will automatically:
- Create all 14 team components
- Set up layer labels
- Create sample issues for testing

### 3. Manual Team Creation in JIRA UI (10 minutes)
While the script runs, open JIRA in another tab:

1. **Navigate to Teams**
   - URL: https://mundotango-team.atlassian.net/jira/people/teams
   - Or: Project Settings → Teams

2. **Quick Create All Teams**
   Copy-paste these into JIRA:

```
Frontend Team - UI/UX (L7-8)
Backend Team - APIs (L5-6)  
Database Team - Schema (L2-4)
API Team - REST/GraphQL (L6)
Infrastructure Team - Deploy (L9-10)
Business Logic Team - Rules (L6)
Product Team - Requirements (L1)
Media Team - Images/Video (L8)
DevOps Team - CI/CD (L9-10)
Analytics Team - Metrics (L11)
QA Team - Testing (L12)
Security Team - Auth (L13-14)
Performance Team - Speed (L15)
AI Team - Life CEO (L16-20)
```

### 4. GitHub Integration (3 minutes)

1. **Quick Install**
   - Go to: https://mundotango-team.atlassian.net/jira/settings/apps
   - Search: "GitHub for Jira"
   - Click: "Get it now" → "Get started"

2. **Connect Repository**
   ```bash
   # In your terminal, get your GitHub org/repo info
   git remote -v
   # Copy the organization and repository name
   ```

3. **In JIRA GitHub App**
   - Click "Connect GitHub organization"
   - Authorize with GitHub
   - Select your repository
   - Click "Connect"

### 5. Test Integration (2 minutes)

```bash
# Create a test branch
git checkout -b MT-1-test-integration

# Make a test commit
echo "# Test" >> test.md
git add test.md
git commit -m "MT-1 Test JIRA GitHub integration"

# Push and create PR
git push origin MT-1-test-integration
# Create PR with title: "MT-1: Test Integration"
```

Check JIRA issue MT-1 - it should show the commit and PR!

## ⚡ Life CEO 40x20s Smart Commands

### Create Issues with Layer Assignment
```javascript
// Quick issue creation template
const createIssue = {
  project: "MT",
  type: "Task",
  summary: "Implement feature X",
  component: "Frontend Team",
  labels: ["layer-7", "priority-high"],
  description: "As per 40x20s framework Layer 7..."
};
```

### Bulk Create Issues for All Layers
```bash
# Use JIRA CLI (install: npm install -g jira-cli)
jira create -p MT -t Task -s "Layer 1: Define requirements" -c "Product Team" -l "layer-1"
jira create -p MT -t Task -s "Layer 2: Database schema" -c "Database Team" -l "layer-2"
# ... continue for all 40 layers
```

### Smart Commit Messages
```bash
# Format: [ISSUE-KEY] [LAYER] [ACTION] description
git commit -m "MT-123 L7 ADD beautiful post creator component"
git commit -m "MT-456 L5 FIX redis connection lazy loading"
git commit -m "MT-789 L15 OPTIMIZE bundle size reduction"
```

## 🎯 Quick Wins

### 1. Create Team Dashboards (1 minute each)
Go to Dashboards → Create dashboard → Use these templates:

**Frontend Team Dashboard**
- Filter: component = "Frontend Team" 
- Widgets: Sprint burndown, Velocity chart, Issues by status

**Performance Team Dashboard**
- Filter: labels in (layer-15, performance)
- Widgets: Average resolution time, SLA status

### 2. Set Up Automation (2 minutes)
Project Settings → Automation → Create rule:

**Auto-Assign by Component**
- When: Issue created
- If: Component = "Frontend Team"
- Then: Assign to → Frontend Team Lead

**Smart Status Transitions**
- When: Commit message contains issue key
- Then: Transition to "In Progress"

### 3. Configure Notifications
Your Profile → Notification preferences:
- ✅ Issues assigned to me
- ✅ Issues in my teams
- ✅ Mentions

## 📊 Life CEO Integration Endpoints

Once setup is complete, these endpoints will work:

```javascript
// Get team performance metrics
GET /api/life-ceo/teams/performance

// Get issues by layer
GET /api/life-ceo/issues/by-layer/7

// Create issue from Life CEO
POST /api/life-ceo/issues/create
{
  "title": "Detected performance issue",
  "layer": 15,
  "team": "Performance Team",
  "priority": "high"
}
```

## ✅ Verification Checklist

- [ ] API token added to .env
- [ ] Setup script ran successfully  
- [ ] 14 team components visible in JIRA
- [ ] GitHub integration shows "Connected"
- [ ] Test commit appears in JIRA issue
- [ ] At least one automation rule created
- [ ] Team dashboard created

## 🚨 Common Issues & Fixes

**"Component already exists"**
- Normal if teams were partially created
- Continue with next steps

**"401 Unauthorized"**
- Check API token is correct
- Ensure email matches JIRA account

**GitHub commits not showing**
- Ensure commit message includes issue key (MT-XXX)
- Check GitHub email matches JIRA email

## 🎉 Success!
You now have a fully integrated JIRA + GitHub + Replit setup with the 40x20s framework!