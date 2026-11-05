import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

// An explicit source allow-list keeps keys, personal photos and runtime data out.
const root = process.cwd();
const stage = mkdtempSync(join(tmpdir(), 'room-suspects-source-'));
const project = join(stage, 'kirock-homes');
mkdirSync(project);
const entries = ['src', 'public', 'tests', 'scripts', 'docs', 'reference', '.kiro',
  'package.json', 'package-lock.json', 'tsconfig.json', 'next.config.ts',
  'playwright.config.ts', '.env.example', '.gitignore', 'README.md',
  'KIRO_HANDOFF.md', 'LICENSE', 'AGENTS.md', 'vercel.json', '.vercelignore'];
for (const entry of entries) {
  if (!existsSync(join(root, entry))) throw new Error(`Missing release file: ${entry}`);
  cpSync(join(root, entry), join(project, entry), {
    recursive: true,
    filter: (path) => !path.endsWith('.DS_Store') && !path.endsWith('.tsbuildinfo') && !['vercel-storage-review.png', 'youtube-upload-review.png', 'youtube-published.png'].includes(path.split('/').pop()),
  });
}
const manifest = [];
function walk(directory, relative = '') {
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(directory, entry.name), name = join(relative, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlinks are not permitted: ${name}`);
    if (entry.isDirectory()) walk(path, name);
    else manifest.push(`${createHash('sha256').update(readFileSync(path)).digest('hex')}  ${name}`);
  }
}
walk(project);
writeFileSync(join(project, 'SOURCE_MANIFEST.sha256'), manifest.join('\n') + '\n');
mkdirSync(resolve('dist'), { recursive: true });
const output = resolve('dist/KIROCK_HOMES_SOURCE.zip');
// Build a fresh file in staging, so stale entries cannot survive in the release.
execFileSync('zip', ['-q', '-r', '-X', join(stage, 'release.zip'), 'kirock-homes'], { cwd: stage });
cpSync(join(stage, 'release.zip'), output);
const names = execFileSync('unzip', ['-Z1', output], { encoding: 'utf8' }).trim().split('\n');
const forbidden = names.filter(name => /\/(node_modules|\.next|\.data|\.git|test-results|playwright-report)\//.test(name) || /\/\.env(?:\.|$)/.test(name) && !name.endsWith('/.env.example'));
if (forbidden.length) throw new Error(`Unsafe archive entries: ${forbidden.join(', ')}`);
console.log(JSON.stringify({ archive: output, sourceFiles: manifest.length, sha256: createHash('sha256').update(readFileSync(output)).digest('hex'), excludedRuntimeData: true }, null, 2));
