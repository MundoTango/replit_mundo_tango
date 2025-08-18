# JIRA API Token Setup Guide

## Adding Your JIRA Token to Replit Secrets

1. **Open the Secrets Tab**:
   - In your Replit workspace, click on the "Tools" icon in the left sidebar
   - Select "Secrets" from the dropdown

2. **Add the JIRA Token**:
   - Click "New Secret"
   - Key: `JIRA_API_TOKEN`
   - Value: `ATATT3xFfGF0Nb_1iigWiEviNSi-kFvP965nAMjH9z8Vs9nGCu87drxemBvCdolRWcSuyDezhWll2jYjakMNp3k60H5J_eR_4uzXIb4ElbG04zEpMc2v1H7-ng_3huq3Ao41EE9VMVHWLKDFKY59whw24pQjc9Xr43lpoKTG2YLknL0o_iRHvQ8=517ED328`
   - Click "Add Secret"

3. **Additional JIRA Credentials Needed**:
   - JIRA Instance URL (e.g., `https://yourcompany.atlassian.net`)
   - Your JIRA email address
   - JIRA Project Key (e.g., `MT` for Mundo Tango)

## Using the JIRA Integration

Once you've added the secret:

1. Navigate to Admin Center → JIRA Export tab
2. Click "Configure JIRA Credentials"
3. Enter:
   - Instance URL: Your JIRA instance URL
   - Email: Your JIRA email
   - API Token: Will be auto-populated from the secret
   - Project Key: Your JIRA project key
4. Click "Save Credentials"
5. Click "Create All Issues in JIRA" to create all 229 items

## Important Notes

- The API token is stored securely in localStorage after configuration
- You can update credentials anytime using the "Update" button
- The system will create epics, stories, and tasks with proper 40x20s framework mapping
- Progress will be shown in real-time during creation