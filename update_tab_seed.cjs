const fs = require('fs');

const map = {
  'antenna': 'IconAntenna',
  'category': 'IconCategory',
  'chart-pie': 'IconChartPie',
  'history': 'IconHistory',
  'list-check': 'IconListCheck',
  'server': 'IconServer',
  'settings': 'IconSettings',
  'user': 'IconUser',
  'users': 'IconUsers',
  'wallet': 'IconWallet'
};

let content = fs.readFileSync('Backend/prisma/seeds/tab.seed.ts', 'utf8');

for (const [k, v] of Object.entries(map)) {
  content = content.replace(new RegExp(`icon:\\s*'${k}'`, 'g'), `icon: '${v}'`);
}

fs.writeFileSync('Backend/prisma/seeds/tab.seed.ts', content);
console.log('Updated tab.seed.ts');
