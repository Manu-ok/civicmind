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

    // We need to add `fill` to any `<Image ` that doesn't have `width`, `height`, or `fill`
    content = content.replace(/<Image ([^>]+)>/g, (match, props) => {
      if (!props.includes('width') && !props.includes('height') && !props.includes('fill')) {
        return `<Image fill ${props}>`;
      }
      return match;
    });
    
    // Self-closing tags `<Image />`
    content = content.replace(/<Image ([^>]+)\/>/g, (match, props) => {
      if (!props.includes('width') && !props.includes('height') && !props.includes('fill')) {
        return `<Image fill ${props}/>`;
      }
      return match;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Added fill to ${filePath}`);
    }
  }
});
console.log('Done adding fill');
