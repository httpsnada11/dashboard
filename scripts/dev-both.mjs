import { spawn } from 'node:child_process';

console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════════');
console.log('\x1b[32m%s\x1b[0m', '🚀 Launching CopyM Pay Dual Portals:');
console.log('\x1b[33m%s\x1b[0m', '   🏢 Merchant Treasury Portal:  http://localhost:3000');
console.log('\x1b[35m%s\x1b[0m', '   🛡️  Platform Admin Operations: http://localhost:3001');
console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════════\n');

// 1. Merchant Portal on Port 3000
const merchant = spawn('npx', ['vite', '--port', '3000'], {
  shell: true,
  stdio: 'pipe',
  env: { ...process.env, PORT: '3000', VITE_PORTAL: 'merchant' }
});

// 2. Admin Portal on Port 3001 with admin mode
const admin = spawn('npx', ['vite', '--port', '3001', '--mode', 'admin'], {
  shell: true,
  stdio: 'pipe',
  env: { ...process.env, PORT: '3001', VITE_PORTAL: 'admin' }
});

merchant.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(Boolean);
  for (const line of lines) {
    console.log(`\x1b[32m[Merchant :3000]\x1b[0m ${line}`);
  }
});

merchant.stderr.on('data', (data) => {
  const lines = data.toString().split('\n').filter(Boolean);
  for (const line of lines) {
    console.error(`\x1b[31m[Merchant :3000 ERR]\x1b[0m ${line}`);
  }
});

admin.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(Boolean);
  for (const line of lines) {
    console.log(`\x1b[35m[Admin :3001]\x1b[0m ${line}`);
  }
});

admin.stderr.on('data', (data) => {
  const lines = data.toString().split('\n').filter(Boolean);
  for (const line of lines) {
    console.error(`\x1b[31m[Admin :3001 ERR]\x1b[0m ${line}`);
  }
});

const cleanup = () => {
  try {
    merchant.kill();
    admin.kill();
  } catch {
    // ignore
  }
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

