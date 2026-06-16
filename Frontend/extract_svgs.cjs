const fs = require('fs');
const path = require('path');

function toKebabCase(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

const dir = path.join(__dirname, 'src', 'components', 'Icons');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.vue'));

let count = 0;
for (const file of files) {
    const fullPath = path.join(dir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Find the import
    const match = content.match(/import\s+\{\s*(Icon[a-zA-Z0-9_]+)\s*\}\s+from\s+['"]@tabler\/icons-vue['"]/);
    
    if (match) {
        const tablerIconName = match[1];
        let kebabName = toKebabCase(tablerIconName.replace(/^Icon/, ''));
        
        // Handle special cases if necessary, but Tabler's naming usually matches
        // e.g. IconFileTypePdf -> file-type-pdf
        let svgPath = path.join(__dirname, 'node_modules', '@tabler', 'icons', 'icons', 'outline', `${kebabName}.svg`);
        
        if (!fs.existsSync(svgPath)) {
            // Check filled directory as fallback or handle differently
            console.log(`SVG not found for ${tablerIconName} (${kebabName}) in file ${file}`);
            continue;
        }
        
        let svgContent = fs.readFileSync(svgPath, 'utf8');
        
        // Add v-bind="$attrs" to the <svg> tag
        // Also ensure it doesn't break if there are multiple attributes
        // find <svg ...>
        svgContent = svgContent.replace(/<svg([^>]*)>/, '<svg$1 v-bind="$attrs">');
        
        const newVueContent = `<template>\n  ${svgContent}\n</template>`;
        
        fs.writeFileSync(fullPath, newVueContent);
        count++;
    }
}

console.log(`Successfully extracted SVG for ${count} icons.`);
