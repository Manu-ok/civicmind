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
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content.replace(/text-gray-/g, 'text-zinc-');
    newContent = newContent.replace(/bg-gray-/g, 'bg-zinc-');
    newContent = newContent.replace(/border-gray-/g, 'border-zinc-');
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
  }
});
console.log('Done replacement');
