const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src');
const filesWithLeaks = [];

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
    
    // Simple heuristic: contains "useEffect" and "onSnapshot", but doesn't contain "return" inside that block
    // A better heuristic is simply scanning manually by printing files that have onSnapshot
    if (content.includes('useEffect') && content.includes('onSnapshot')) {
      filesWithLeaks.push(filePath);
    }
  }
});
console.log(filesWithLeaks.join('\n'));
