import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const RECEIVER_URL = process.env.RECEIVER_URL ?? process.env.BASE_URL;
const SECRET = process.env.MINDLOOM_WEBHOOK_SECRET;

if (!RECEIVER_URL) {
  console.error('Error: RECEIVER_URL (or BASE_URL) is not set.');
  console.error('');
  console.error('PowerShell:');
  console.error('  $env:MINDLOOM_WEBHOOK_SECRET="mindloom-dev-secret-change-me"');
  console.error('  $env:RECEIVER_URL="http://localhost:3001"');
  console.error('  npm run submit:intake');
  process.exit(1);
}

if (!SECRET) {
  console.error('Error: MINDLOOM_WEBHOOK_SECRET is not set.');
  process.exit(1);
}

const samplePath = join(__dirname, '..', 'docs', 'examples', 'intake-sample.json');
const body = readFileSync(samplePath, 'utf-8');

const endpoint = RECEIVER_URL.replace(/\/$/, '') + '/api/mindloom/intake';
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

if (data.ok && data.admin_url) {
  console.log('\nAdmin URL:', data.admin_url);
} else if (!data.ok) {
  console.error('\nError:', data.error);
  process.exit(1);
}
