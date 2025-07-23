import { exportMundoTangoToJira } from './mundo-tango-jira-export';
import * as fs from 'fs';
import * as path from 'path';

// Generate all export formats
async function generateExports() {
  console.log('🚀 Life CEO 40x20s JIRA Export Generator');
  console.log('========================================');
  
  const exportDir = path.join(__dirname, 'output');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  // Generate CSV export
  console.log('\n📄 Generating CSV export...');
  const csv = exportMundoTangoToJira('csv') as string;
  const csvPath = path.join(exportDir, `mundo-tango-jira-export-${new Date().toISOString().split('T')[0]}.csv`);
  fs.writeFileSync(csvPath, csv);
  console.log(`✅ CSV export saved to: ${csvPath}`);
  
  // Generate JSON export
  console.log('\n📊 Generating JSON export...');
  const json = exportMundoTangoToJira('json');
  const jsonPath = path.join(exportDir, `mundo-tango-jira-export-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
  console.log(`✅ JSON export saved to: ${jsonPath}`);
  
  // Generate 40x20s Framework Summary
  console.log('\n📈 Generating 40x20s Framework Summary...');
  const summary = exportMundoTangoToJira('summary');
  const summaryPath = path.join(exportDir, `mundo-tango-40x20s-summary-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`✅ Summary saved to: ${summaryPath}`);
  
  // Print summary statistics
  const jsonData = json as any;
  console.log('\n📊 Export Statistics:');
  console.log(`   Total Issues: ${jsonData.issues.length}`);
  console.log(`   - Epics: ${jsonData.metadata.issueBreakdown.epics}`);
  console.log(`   - Stories: ${jsonData.metadata.issueBreakdown.stories}`);
  console.log(`   - Tasks: ${jsonData.metadata.issueBreakdown.tasks}`);
  console.log(`   - Sub-tasks: ${jsonData.metadata.issueBreakdown.subtasks}`);
  console.log(`   Layer Coverage: ${jsonData.metadata.layerCoverage.length} layers`);
  console.log(`   Phase Coverage: ${jsonData.metadata.phaseCoverage.length} phases`);
  
  console.log('\n✨ Export complete! Ready for JIRA import.');
  console.log('\n📝 Instructions for JIRA import:');
  console.log('   1. For CSV: Use JIRA\'s "External System Import" feature');
  console.log('   2. For JSON: Use JIRA REST API or import tool');
  console.log('   3. Review the 40x20s summary for framework coverage');
}

// Run the export
generateExports().catch(console.error);