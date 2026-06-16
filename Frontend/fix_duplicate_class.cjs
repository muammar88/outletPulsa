const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'components', 'Icons');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.vue'));

for (const file of files) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Check for duplicate class="w-4 h-5" after another class attribute
    if (content.match(/class="[^"]*"\s*\n?\s*class="w-4 h-5"/)) {
        content = content.replace(/(class="[^"]*")\s*\n?\s*class="w-4 h-5"/, (match, p1) => {
            // merge them
            return p1.replace('"', ' w-4 h-5"');
        });
        fs.writeFileSync(fullPath, content);
        console.log('Fixed duplicate class in ' + file);
    }
}
