# JIRA Team Creation Checklist - 40x20s Framework
*Execute these steps in order in your JIRA instance*

## Phase 1: Team Creation (15 Teams)

### Navigation
1. Go to https://mundotango-team.atlassian.net
2. Navigate to **Projects** → **Mundo Tango Plan** → **Project Settings** → **Teams**

### Create Each Team
For each team below, follow these steps:
1. Click **"Create team"**
2. Enter the **Team name** exactly as shown
3. Add **Description** with layer mapping
4. Set **Access** to "Project access"
5. Click **Save**

### Development Teams (Create First)

#### 1. Frontend Team
- **Name**: Frontend Team
- **Description**: UI/UX, React components, user interfaces (Layers 7-8)
- **Lead**: Assign frontend lead developer

#### 2. Backend Team
- **Name**: Backend Team  
- **Description**: APIs, services, business logic implementation (Layers 5-6)
- **Lead**: Assign backend lead developer

#### 3. Database Team
- **Name**: Database Team
- **Description**: Schema design, migrations, query optimization (Layers 2-4)
- **Lead**: Assign database architect

#### 4. API Team
- **Name**: API Team
- **Description**: REST endpoints, GraphQL, third-party integrations (Layer 6)
- **Lead**: Assign API architect

#### 5. Infrastructure Team
- **Name**: Infrastructure Team
- **Description**: Deployment, scaling, server management (Layers 9-10)
- **Lead**: Assign DevOps lead

### Specialized Teams (Create Second)

#### 6. Business Logic Team
- **Name**: Business Logic Team
- **Description**: Domain logic, business rules, workflow automation (Layer 6)
- **Lead**: Assign business analyst

#### 7. Product Team
- **Name**: Product Team
- **Description**: Requirements, user stories, product roadmap (Layer 1)
- **Lead**: Assign product manager

#### 8. Media Team
- **Name**: Media Team
- **Description**: Image/video processing, CDN, media optimization (Layer 8)
- **Lead**: Assign media specialist

#### 9. DevOps Team
- **Name**: DevOps Team
- **Description**: CI/CD pipelines, automation, deployment (Layers 9-10)
- **Lead**: Assign DevOps engineer

#### 10. Analytics Team
- **Name**: Analytics Team
- **Description**: Metrics, reporting, business insights (Layer 11)
- **Lead**: Assign data analyst

### Quality & Security Teams (Create Third)

#### 11. QA Team
- **Name**: QA Team
- **Description**: Testing, quality assurance, test automation (Layer 12)
- **Lead**: Assign QA lead

#### 12. Security Team
- **Name**: Security Team
- **Description**: Authentication, encryption, compliance (Layers 13-14)
- **Lead**: Assign security engineer

#### 13. Performance Team
- **Name**: Performance Team
- **Description**: Optimization, caching, load testing (Layer 15)
- **Lead**: Assign performance engineer

### Advanced Teams (Create Last)

#### 14. AI Team
- **Name**: AI Team
- **Description**: Life CEO AI, machine learning features (Layers 16-20)
- **Lead**: Assign AI/ML engineer

#### 15. Platform Team (Already Exists)
- **Description**: Update to "Cross-cutting concerns, platform-wide features (All layers)"
- **Lead**: admin mundotango

## Phase 2: Team Member Assignment

For each team created:
1. Click on the team name
2. Click **"Add members"** (+) button
3. Search and add relevant team members
4. Assign at least 2-3 members per team

## Phase 3: Project Linking

1. Go to each team's page
2. Click **"Add project"**
3. Select **"MT"** (Mundo Tango) project
4. Click **"Add"**

## Phase 4: GitHub Integration

### Install GitHub for JIRA
1. Go to **Project Settings** → **Apps**
2. Search for **"GitHub for Jira"**
3. Click **"Get it now"**
4. Follow installation prompts

### Connect Repository
1. In GitHub for JIRA app, click **"Get started"**
2. Click **"Connect GitHub organization"**
3. Select your GitHub organization
4. Choose **mundo-tango** repository (or your repo name)
5. Grant these permissions:
   - ✅ Read access to code
   - ✅ Read access to metadata
   - ✅ Read access to pull requests  
   - ✅ Write access to pull request statuses

### Configure Smart Commits
1. In GitHub settings, ensure email matches JIRA email
2. Test with a commit:
   ```bash
   git commit -m "MT-1 Test GitHub integration with JIRA"
   ```

## Phase 5: Automation Rules

### Create Basic Automation
1. Go to **Project Settings** → **Automation**
2. Click **"Create rule"**
3. Create these rules:

#### Rule 1: Auto-assign to team
- **Trigger**: Issue created
- **Condition**: Component = Frontend
- **Action**: Assign to Frontend Team

#### Rule 2: Move to In Progress
- **Trigger**: Commit with issue key
- **Action**: Transition to "In Progress"

#### Rule 3: Move to Review
- **Trigger**: Pull request created
- **Action**: Transition to "In Review"

## Phase 6: Verification

### Test Integration
1. Create test issue: MT-TEST
2. Create branch: `git checkout -b MT-TEST-integration`
3. Make commit: `git commit -m "MT-TEST Testing integration"`
4. Create PR with title: "MT-TEST: Verify integration"
5. Check JIRA issue updates automatically

### Verify Teams
1. Go to **Teams** view
2. Confirm all 15 teams appear
3. Check each team has:
   - At least 1 member
   - MT project linked
   - Proper description

## Success Metrics
- [ ] 15 teams created
- [ ] All teams have descriptions with layer mappings
- [ ] Each team has at least 1 member
- [ ] MT project linked to all teams
- [ ] GitHub integration installed
- [ ] Repository connected
- [ ] Test issue shows GitHub activity
- [ ] Automation rules created

## Next Steps
1. Create team-specific dashboards
2. Set up team velocity tracking
3. Configure team notifications
4. Create team-specific filters
5. Schedule team retrospectives