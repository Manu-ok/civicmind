const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'public');

const files = [
  'logo-full-dark.png',
  'logo-full-light.png',
  'logo-icon-gradient.png',
  'logo-icon-white.png',
  'logo-stacked-dark.png',
  'logo-stacked-light.png',
  'logo-wordmark-dark.png',
  'logo-wordmark-light.png',
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'og-image.png'
];

// 1px transparent png as fallback if LogoFallback breaks, but LogoFallback is better
const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const buffer = Buffer.from(base64Png, 'base64');

files.forEach(f => {
  const filePath = path.join(dir, f);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, buffer);
  }
});
console.log('Created dummy PNGs');
