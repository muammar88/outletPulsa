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
      
      // Skip the Icons directory since we don't want to mess up stroke="currentColor"
      if (fullPath.includes(path.join('src', 'components', 'Icons'))) continue;

      let modified = false;

      // Replace :stroke="2" -> :stroke-width="2"
      if (content.includes(':stroke=')) {
        content = content.replace(/:stroke=/g, ':stroke-width=');
        modified = true;
      }

      // Replace stroke="2" -> stroke-width="2" (excluding stroke="currentColor" and stroke="none")
      const strokeRegex = / stroke=(["'])(?![cC]urrentColor)(?![nN]one)(.*?)\1/g;
      if (strokeRegex.test(content)) {
        content = content.replace(strokeRegex, ' stroke-width=$1$2$1');
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed stroke in: ' + fullPath);
      }
    }
  }
};

walk('./src');
