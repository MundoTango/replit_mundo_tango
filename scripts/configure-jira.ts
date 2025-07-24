#!/usr/bin/env tsx

// Life CEO 40x20s JIRA Configuration Script
// This script configures JIRA credentials for the API integration

const JIRA_CREDENTIALS = {
  instanceUrl: 'https://mundotango-team.atlassian.net',
  email: 'admin@mundotango.life',
  apiToken: 'ATATT3xFfGF0Nb_1iigWiEviNSi-kFvP965nAMjH9z8Vs9nGCu87drxemBvCdolRWcSuyDezhWll2jYjakMNp3k60H5J_eR_4uzXIb4ElbG04zEpMc2v1H7-ng_3huq3Ao41EE9VMVHWLKDFKY59whw24pQjc9Xr43lpoKTG2YLknL0o_iRHvQ8=517ED328',
  projectKey: 'KAN'
};

console.log('🔧 Life CEO 40x20s: Configuring JIRA credentials...');
console.log('📍 Instance URL:', JIRA_CREDENTIALS.instanceUrl);
console.log('📧 Email:', JIRA_CREDENTIALS.email);
console.log('🔑 Project Key:', JIRA_CREDENTIALS.projectKey);
console.log('✅ API Token configured (hidden for security)');

// Store credentials in environment-like format for reference
console.log('\n📝 Configuration ready for JIRA integration');
console.log('🚀 Next step: Navigate to Admin Center → JIRA Export to create issues');

export default JIRA_CREDENTIALS;