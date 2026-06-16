const fs = require('fs');
const path = require('path');
const icons = new Set();
const walk = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.vue')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const match = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]@tabler\/icons-vue['"]/g);
      if (match) {
        match.forEach(m => {
          const m2 = m.match(/\{([^}]+)\}/);
          if (m2) {
            m2[1].split(',').forEach(i => icons.add(i.trim()));
          }
        });
      }
    }
  }
};
walk('./src');
console.log(Array.from(icons).sort().join('\n'));
