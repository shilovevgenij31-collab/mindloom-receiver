import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const RECEIVER_URL = process.env.RECEIVER_URL;
const SECRET = process.env.MINDLOOM_WEBHOOK_SECRET;

if (!RECEIVER_URL) {
  console.error('Error: RECEIVER_URL is not set.');
  console.error('');
  console.error('PowerShell:');
  console.error('  $env:RECEIVER_URL="https://mindloom.edagency.ru"');
  console.error('  $env:MINDLOOM_WEBHOOK_SECRET="your-secret"');
  console.error('  npm run submit:sample');
  process.exit(1);
}

if (!SECRET) {
  console.error('Error: MINDLOOM_WEBHOOK_SECRET is not set.');
  process.exit(1);
}

const samplePath = join(__dirname, '..', 'docs', 'examples', 'mindloom-sample-report.json');
const body = readFileSync(samplePath, 'utf-8');

const endpoint = RECEIVER_URL.replace(/\/$/, '') + '/api/mindloom/reports';
console.log('Sending to:', endpoint);

const res = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SECRET}`,
    'Content-Type': 'application/json; charset=utf-8',
  },
  body,
});

const data = await res.json();

console.log('\nHTTP status:', res.status);
console.log('Response:', JSON.stringify(data, null, 2));

if (data.ok && data.report_url) {
  console.log('\nReport URL:', data.report_url);
} else if (!data.ok) {
  console.error('\nError:', data.error);
  process.exit(1);
}
