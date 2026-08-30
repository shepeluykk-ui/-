import fs from 'fs';
import path from 'path';

const bannedWords = [
  'Upload', 'Download', 'Open', 'Save', 'Cancel', 'Delete',
  'Settings', 'Profile', 'Dashboard', 'Loading', 'Success',
  'Error', 'Warning', 'Status', 'Version', 'User', 'Admin',
  'Login', 'Logout', 'Register', 'Documents', 'Archive',
  'File', 'Search', 'Refresh', 'Confirm', 'Retry'
];

function scanDir(dir: string): Array<{ file: string; line: number; word: string; text: string }> {
  let results: Array<{ file: string; line: number; word: string; text: string }> = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', '.git', 'uploads', 'scripts'].includes(entry.name)) {
        results = results.concat(scanDir(fullPath));
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.html'))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('import ') || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;
        
        for (const word of bannedWords) {
          const tagRegex = new RegExp(`>\\s*${word}\\s*<`, 'i');
          const placeholderRegex = new RegExp(`placeholder=["'\`][^"'\`]*\\b${word}\\b[^"'\`]*["'\`]`, 'i');
          const titleRegex = new RegExp(`title=["'\`][^"'\`]*\\b${word}\\b[^"'\`]*["'\`]`, 'i');
          if (tagRegex.test(line) || placeholderRegex.test(line) || titleRegex.test(line)) {
            // Check if it is a pure english text that should be translated
            results.push({ file: fullPath, line: idx + 1, word, text: trimmed });
          }
        }
      });
    }
  }
  return results;
}

const found = scanDir('./src');
console.log(`Found ${found.length} matches:`);
found.forEach(f => console.log(`${f.file}:${f.line} [${f.word}] => ${f.text}`));
