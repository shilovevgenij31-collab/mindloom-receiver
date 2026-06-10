import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const RECEIVER_URL = process.env.RECEIVER_URL ?? process.env.BASE_URL;
const SECRET = process.env.MINDLOOM_WEBHOOK_SECRET;

if (!RECEIVER_URL) {
  console.error('Error: RECEIVER_URL is not set.\n');
  console.error('PowerShell:');
  console.error('  $env:RECEIVER_URL="http://localhost:3001"');
  console.error('  $env:MINDLOOM_WEBHOOK_SECRET="mindloom-dev-secret-change-me"');
  console.error('  npm run submit:v2:realistic');
  process.exit(1);
}

if (!SECRET) {
  console.error('Error: MINDLOOM_WEBHOOK_SECRET is not set.');
  process.exit(1);
}

const fixturePath = join(__dirname, '..', 'docs', 'examples', 'mindloom-v2-realistic-sample.json');
const body = readFileSync(fixturePath, 'utf-8');

const endpoint = RECEIVER_URL.replace(/\/$/, '') + '/api/mindloom/reports';
console.log('Sending realistic V2 report to:', endpoint);
console.log('Fixture:   mindloom-v2-realistic-sample.json');
console.log('Profile:   Ценность через полезность (4 nodes, 4 edges)');
console.log('');

const res = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SECRET}`,
    'Content-Type': 'application/json; charset=utf-8',
  },
  body,
});

const data = await res.json();

console.log('HTTP status:', res.status);
console.log('Response:', JSON.stringify(data, null, 2));

if (data.ok && data.report_url) {
  console.log('\n✓ Report created:', data.report_url);
  console.log('');
  console.log('Check the following in the browser:');
  console.log('  - Hero: "Ценность через полезность" — reads naturally, no system terms');
  console.log('  - Graph: 4 nodes in balanced layout (no floating node)');
  console.log('  - Heatmap: 4 zones, readable labels');
  console.log('  - Practices: 3 practices, concrete how-to text');
  console.log('  - No "система", "узлы", "стратегия" in visible text');
} else if (!data.ok) {
  console.error('\nError:', data.error);
  process.exit(1);
}
