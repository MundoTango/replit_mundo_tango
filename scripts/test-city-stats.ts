import fetch from 'node-fetch';

async function testCityStats() {
  console.log('Testing city statistics API...\n');
  
  const cityGroups = [
    'tango-buenos-aires-argentina',
    'kola-in-montenegro',
    'paris-france'
  ];

  for (const slug of cityGroups) {
    try {
      console.log(`Testing ${slug}...`);
      const response = await fetch(`http://localhost:5000/api/groups/${slug}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const group = data.data;
        
        console.log(`✅ ${group.name}:`);
        console.log(`   - Type: ${group.type}`);
        console.log(`   - City: ${group.city}`);
        console.log(`   - Event Count: ${group.eventCount ?? 'NOT PRESENT'}`);
        console.log(`   - Host Count: ${group.hostCount ?? 'NOT PRESENT'}`);
        console.log(`   - Recommendation Count: ${group.recommendationCount ?? 'NOT PRESENT'}`);
      } else {
        console.log(`❌ ${slug}: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${slug}: ${error.message}`);
    }
    
    console.log('---');
  }
}

testCityStats().catch(console.error);