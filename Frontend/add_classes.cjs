const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'components', 'Icons');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.vue'));

let count = 0;
for (const file of files) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Remove existing width and height attributes
    content = content.replace(/\bwidth="[^"]*"\s*/g, '');
    content = content.replace(/\bheight="[^"]*"\s*/g, '');

    // Add w-4 h-5 to the existing class attribute or create one if it doesn't exist
    if (content.includes('class="')) {
        // Find existing class attribute and append w-4 h-5
        content = content.replace(/class="([^"]*)"/, 'class="$1 w-4 h-5"');
    } else {
        // No class attribute found on svg, add it
        content = content.replace(/<svg\s+/, '<svg class="w-4 h-5" ');
    }

    fs.writeFileSync(fullPath, content);
    count++;
}

console.log(`Updated classes for ${count} icons.`);
