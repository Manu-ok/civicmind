const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src');

const replacements = [
  { pattern: /(?<!dark:)bg-zinc-950/g, replacement: 'bg-slate-50 dark:bg-zinc-950' },
  { pattern: /(?<!dark:)bg-zinc-900/g, replacement: 'bg-white dark:bg-zinc-900' },
  { pattern: /(?<!dark:)bg-zinc-800/g, replacement: 'bg-slate-100 dark:bg-zinc-800' },
  { pattern: /(?<!dark:)bg-zinc-700/g, replacement: 'bg-slate-200 dark:bg-zinc-700' },
  { pattern: /(?<!dark:)bg-slate-950\/50/g, replacement: 'bg-slate-100/50 dark:bg-slate-950/50' },
  { pattern: /(?<!dark:)bg-slate-900\/50/g, replacement: 'bg-slate-50/50 dark:bg-slate-900/50' },
  { pattern: /(?<!dark:)border-zinc-800/g, replacement: 'border-slate-200 dark:border-zinc-800' },
  { pattern: /(?<!dark:)border-zinc-700/g, replacement: 'border-slate-300 dark:border-zinc-700' },
  { pattern: /(?<!dark:)text-zinc-400/g, replacement: 'text-slate-500 dark:text-zinc-400' },
  { pattern: /(?<!dark:)text-zinc-300/g, replacement: 'text-slate-600 dark:text-zinc-300' },
  { pattern: /(?<!dark:)text-zinc-500/g, replacement: 'text-slate-500 dark:text-zinc-500' },
  { pattern: /(?<!dark:)border-white\/\[0\.06\]/g, replacement: 'border-slate-200 dark:border-white/[0.06]' }
];

function walkSync(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    let dirPath = path.join(dir, file);
    if (fs.statSync(dirPath).isDirectory()) {
      walkSync(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

walkSync(directory, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    
    replacements.forEach(({ pattern, replacement }) => {
      newContent = newContent.replace(pattern, replacement);
    });
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
  }
});
console.log('Done replacement');
