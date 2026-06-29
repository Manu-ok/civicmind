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

    // Check if there's any <img tag
    if (content.includes('<img ')) {
      // replace <img with <Image
      content = content.replace(/<img /g, '<Image ');
      // also ensure that next/image is imported
      if (!content.includes('import Image from "next/image"')) {
        content = 'import Image from "next/image";\n' + content;
      }
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
console.log('Done replacing images');
