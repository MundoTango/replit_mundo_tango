// Test Notion connection with your provided credentials
const { Client } = require('@notionhq/client');

const notion = new Client({
    auth: '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',
});

// Extract database ID from your URL: https://www.notion.so/2228ff6927a5807abbe2d41ea9b476a1?v=2228ff6927a5804ab97e000c8b41db52
// The database ID is: 2228ff6927a5807abbe2d41ea9b476a1

async function testConnection() {
    try {
        console.log('Testing Notion connection...');
        
        // Try to query the database
        const response = await notion.databases.query({
            database_id: '2228ff6927a5807abbe2d41ea9b476a1',
            page_size: 5,
        });
        
        console.log('✅ Success! Found', response.results.length, 'entries');
        
        // Show the first entry structure
        if (response.results.length > 0) {
            const firstEntry = response.results[0];
            console.log('\nFirst entry properties:');
            console.log(Object.keys(firstEntry.properties));
            
            // Show actual property values
            for (const [key, value] of Object.entries(firstEntry.properties)) {
                console.log(`${key}:`, value.type);
            }
        }
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        
        if (error.code === 'object_not_found') {
            console.log('\n📋 Next steps:');
            console.log('1. Go to your Notion database page');
            console.log('2. Click "..." menu in top-right');
            console.log('3. Go to "Connections"');
            console.log('4. Add your "Mundo Tango Website" integration');
            console.log('5. Try again');
        }
    }
}

testConnection();