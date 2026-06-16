const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'components', 'Icons');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.vue'));

const exportsStr = files.map(f => {
  const name = f.replace('.vue', '');
  return `export { default as ${name} } from './${f}';`;
}).join('\n');

fs.writeFileSync(path.join(dir, 'index.ts'), exportsStr);
console.log('index.ts generated with ' + files.length + ' exports.');
