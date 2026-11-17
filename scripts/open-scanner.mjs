import { exec } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.resolve(__dirname, '..', 'copym-radial-scanner.html');
const cmd = process.platform === 'win32' ? `start "" "${filePath}"` : (process.platform === 'darwin' ? `open "${filePath}"` : `xdg-open "${filePath}"`);

console.log(`\x1b[32m✔ Launching CopyM Radial Scanner Studio:\x1b[0m\n  ${filePath}`);
exec(cmd);
