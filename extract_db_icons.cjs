const fs = require('fs');
const files = [
  'Backend/prisma/seeds/menu.seed.ts',
  'Backend/prisma/seeds/tab.seed.ts',
  'Backend/prisma/seeds/sub.seed.ts'
];
const icons = new Set();

files.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(/icon:\s*['"]([^'"]+)['"]/g);
    if (matches) {
      matches.forEach(m => {
        const icon = m.split(/['"]/)[1];
        icons.add(icon);
      });
    }
  } else {
    console.log('File not found:', file);
  }
});

console.log('--- DB ICONS ---');
console.log(Array.from(icons).sort().join('\n'));
