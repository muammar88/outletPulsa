const fs = require('fs');
const path = require('path');

function toKebabCase(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

const missingIcons = [
  'IconAntenna', 'IconBox', 'IconCategory', 'IconDashboard', 
  'IconDatabase', 'IconHistory', 'IconServer', 'IconUserShield', 
  'IconUsersGroup', 'IconWallet', 'IconChartPie', 'IconListCheck'
];

const destDir = path.join(__dirname, 'Frontend', 'src', 'components', 'Icons');

for (const icon of missingIcons) {
    let kebabName = toKebabCase(icon.replace(/^Icon/, ''));
    let svgPath = path.join(__dirname, 'Frontend', 'node_modules', '@tabler', 'icons', 'icons', 'outline', `${kebabName}.svg`);
    
    if (fs.existsSync(svgPath)) {
        let svgContent = fs.readFileSync(svgPath, 'utf8');
        
        // Remove only standalone width and height attributes
        svgContent = svgContent.replace(/\s+width="[^"]*"/, '');
        svgContent = svgContent.replace(/\s+height="[^"]*"/, '');
        
        // Add w-4 h-5 and v-bind="$attrs"
        svgContent = svgContent.replace(/<svg([^>]*)>/, '<svg$1 class="w-4 h-5" v-bind="$attrs">');
        
        const newVueContent = `<template>\n  ${svgContent}\n</template>`;
        fs.writeFileSync(path.join(destDir, `${icon}.vue`), newVueContent);
        console.log(`Created ${icon}.vue`);
    } else {
        console.log(`Could not find SVG for ${icon} (${kebabName}.svg)`);
    }
}
