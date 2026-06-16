const fs = require('fs'); 
const map = {
  'IconLoader2.vue': 'outline/loader-2.svg', 
  'IconMenu2.vue': 'outline/menu-2.svg', 
  'IconStarFilled.vue': 'filled/star.svg'
}; 
for (const [file, p] of Object.entries(map)) { 
  let svg = fs.readFileSync('node_modules/@tabler/icons/icons/' + p, 'utf8'); 
  svg = svg.replace(/<svg([^>]*)>/, '<svg$1 v-bind="$attrs">'); 
  fs.writeFileSync('src/components/Icons/' + file, '<template>\n' + svg + '\n</template>'); 
  console.log('Fixed ' + file); 
}
