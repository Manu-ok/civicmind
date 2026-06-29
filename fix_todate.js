const fs = require('fs');

const files = [
  'src/app/(dashboard)/verify/page.tsx',
  'src/components/issues/IssueCard.tsx',
  'src/components/issues/IssueDetail.tsx',
  'src/components/map/MobileMapPanel.tsx'
];

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\.toDate\(\)/g, '?.toDate?.()');
    fs.writeFileSync(file, content);
    console.log(`Updated toDate in ${file}`);
  } catch (err) {
    console.log(`Could not process ${file}`);
  }
});
