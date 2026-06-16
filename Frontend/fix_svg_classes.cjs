const fs = require('fs');
const path = require('path');

function toKebabCase(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

const dir = path.join(__dirname, 'src', 'components', 'Icons');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.vue'));

const overrides = {
  'IconLoader2.vue': 'outline/loader-2.svg', 
  'IconMenu2.vue': 'outline/menu-2.svg', 
  'IconStarFilled.vue': 'filled/star.svg'
};

for (const file of files) {
    const fullPath = path.join(dir, file);
    let tablerIconName = file.replace('.vue', '');
    let kebabName = toKebabCase(tablerIconName.replace(/^Icon/, ''));
    
    let svgPath = overrides[file] ? path.join(__dirname, 'node_modules', '@tabler', 'icons', 'icons', overrides[file]) : path.join(__dirname, 'node_modules', '@tabler', 'icons', 'icons', 'outline', `${kebabName}.svg`);
    
    if (fs.existsSync(svgPath)) {
        let svgContent = fs.readFileSync(svgPath, 'utf8');
        
        // Remove only standalone width and height attributes
        svgContent = svgContent.replace(/\s+width="[^"]*"/, '');
        svgContent = svgContent.replace(/\s+height="[^"]*"/, '');
        
        // Add w-4 h-5 and v-bind="$attrs"
        svgContent = svgContent.replace(/<svg([^>]*)>/, '<svg$1 v-bind="$attrs">');
        
        // Add w-4 h-5 to existing class
        if (svgContent.includes('class="')) {
            svgContent = svgContent.replace(/class="([^"]*)"/, 'class="$1 w-4 h-5"');
        } else {
            svgContent = svgContent.replace(/<svg\s+/, '<svg class="w-4 h-5" ');
        }
        
        const newVueContent = `<template>\n  ${svgContent}\n</template>`;
        fs.writeFileSync(fullPath, newVueContent);
    }
}

console.log('Fixed SVGs successfully.');
