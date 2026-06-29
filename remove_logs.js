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
    let original = content;

    // remove lines that only have console.log
    content = content.replace(/^\s*console\.log\(.*\);?\s*$/gm, '');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Removed console.log from ${filePath}`);
    }
  }
});
console.log('Done removing logs');
