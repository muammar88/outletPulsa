const fs = require('fs');
const path = require('path');

function r(d) {
    if (!fs.existsSync(d)) return;
    for (const f of fs.readdirSync(d)) {
        const p = path.join(d, f);
        if (fs.statSync(p).isDirectory()) {
            if (!['node_modules', '.git'].includes(f)) r(p);
        } else if (p.match(/\.(vue|html|ts|js)$/)) {
            let c = fs.readFileSync(p, 'utf8');
            let n = c.replace(/logo\.png/g, 'logo.webp').replace(/avatar\.png/g, 'avatar.webp');
            if (c !== n) {
                fs.writeFileSync(p, n, 'utf8');
                console.log('Updated', p);
            }
        }
    }
}

r('d:/PROJECT/NODEJS/outletPulsa/Frontend/src');
r('d:/PROJECT/NODEJS/outletPulsa/Frontend/public');
