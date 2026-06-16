const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.vue')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Skip the components/Icons directory itself to avoid recursive imports
      if (fullPath.includes(path.join('components', 'Icons'))) {
        continue;
      }

      let modified = false;

      // Replace: import * as Icons from '@tabler/icons-vue' -> import * as Icons from '@/components/Icons'
      if (content.includes("import * as TablerIcons from '@tabler/icons-vue'")) {
        content = content.replace(/import \* as TablerIcons from ['"]@tabler\/icons-vue['"];?/g, "import * as TablerIcons from '@/components/Icons';");
        modified = true;
      }
      
      if (content.includes("import * as Icons from '@tabler/icons-vue'")) {
        content = content.replace(/import \* as Icons from ['"]@tabler\/icons-vue['"];?/g, "import * as Icons from '@/components/Icons';");
        modified = true;
      }

      // Replace standard imports
      const regex = /import\s+\{([^}]+)\}\s+from\s+['"]@tabler\/icons-vue['"];?/g;
      if (regex.test(content)) {
        content = content.replace(regex, (match, imports) => {
          return `import { ${imports.trim()} } from '@/components/Icons';`;
        });
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`Refactored: ${fullPath}`);
      }
    }
  }
};

walk('./src');
console.log('Refactoring complete.');
