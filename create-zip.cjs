const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const output = fs.createWriteStream('n8n-complete-workflows.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✅ ZIP file created: n8n-complete-workflows.zip (${archive.pointer()} bytes)`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Add all JSON files from the complete folder
const files = [
  'user-registration-hubspot.json',
  'payment-processing-stripe.json',
  'testsprite-results-processor.json',
  'daily-analytics-report.json'
];

files.forEach(file => {
  archive.file(`n8n-workflows/complete/${file}`, { name: file });
});

archive.finalize();
