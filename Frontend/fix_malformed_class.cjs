const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'components', 'Icons');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.vue'));

for (const file of files) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    if (content.includes('class= w-4 h-5"')) {
        content = content.replace(/class=\s*w-4 h-5"([^"]*)"/g, 'class="$1 w-4 h-5"');
        fs.writeFileSync(fullPath, content);
        console.log('Fixed malformed class in ' + file);
    }
}
