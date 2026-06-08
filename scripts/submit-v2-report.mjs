import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const RECEIVER_URL = process.env.RECEIVER_URL ?? process.env.BASE_URL;
const SECRET = process.env.MINDLOOM_WEBHOOK_SECRET;

if (!RECEIVER_URL) {
  console.error('Error: RECEIVER_URL is not set.\n');
  console.error('PowerShell:');
  console.error('  $env:RECEIVER_URL="https://mindloom.edagency.ru"');
  console.error('  $env:MINDLOOM_WEBHOOK_SECRET="<prod secret from .env.production>"');
  console.error('  npm run submit:v2\n');
  console.error('Local dev:');
  console.error('  $env:RECEIVER_URL="http://localhost:3001"');
  console.error('  $env:MINDLOOM_WEBHOOK_SECRET="mindloom-dev-secret-change-me"');
  console.error('  npm run submit:v2');
  process.exit(1);
}

if (!SECRET) {
  console.error('Error: MINDLOOM_WEBHOOK_SECRET is not set.');
  process.exit(1);
}

const fixturePath = join(__dirname, '..', 'docs', 'examples', 'mindloom-v2-deploy-qa.json');
const body = readFileSync(fixturePath, 'utf-8');

const endpoint = RECEIVER_URL.replace(/\/$/, '') + '/api/mindloom/reports';
console.log('Sending V2 QA report to:', endpoint);
console.log('Fixture:   mindloom-v2-deploy-qa.json (schema_version: 2.0)');
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
  console.log('Open the URL above. You should see:');
  console.log('  - "Mindloom Report v2" badge in header');
  console.log('  - "Речевые маркеры паттерна" (Speech Cloud)');
  console.log('  - "Тепловая карта" (Heatmap)');
  console.log('  - "Граф связей" (Node Graph)');
  console.log('');
  console.log('If you see these sections → V2 dashboard is working correctly.');
} else if (!data.ok) {
  console.error('\nError:', data.error);
  process.exit(1);
}
