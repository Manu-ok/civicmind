const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src');

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
    const lines = content.split('\n');
    
    if (lines.length > 1 && lines[0].startsWith('import Image from "next/image";') && lines[1].startsWith('"use client";')) {
      lines[0] = '"use client";';
      lines[1] = 'import Image from "next/image";';
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      console.log(`Fixed use client position in ${filePath}`);
    }
  }
});
console.log('Done fixing use client positions');
