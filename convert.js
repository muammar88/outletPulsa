const fs = require('fs');
const path = require('path');

const parseDate = (val) => {
  if (!val || val.includes('0000-00-00')) return new Date().toISOString();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

const extractData = (sqlPath, tableName, valCount, mapper) => {
  if (!fs.existsSync(sqlPath)) {
    console.log(`[!] File SQL tidak ditemukan: ${sqlPath}`);
    return null;
  }
  
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const insertRegex = new RegExp(`INSERT INTO \`${tableName}\` \\([^)]+\\) VALUES\\s*([\\s\\S]*?);`, 'g');
  
  let match;
  const datalist = [];
  const valRegex = /'(?:[^']|'')*'|NULL|-?\d+(?:\.\d+)?/g;

  while ((match = insertRegex.exec(sql)) !== null) {
    const block = match[1];
    const rowStrings = block.split(/\),\s*\(/);
    
    for (let rowStr of rowStrings) {
      rowStr = rowStr.replace(/^\s*\(/, '').replace(/\)\s*$/, '');
      
      const values = [];
      let valMatch;
      while ((valMatch = valRegex.exec(rowStr)) !== null) {
        let val = valMatch[0];
        if (val === 'NULL') {
          values.push(null);
        } else if (val.startsWith("'")) {
          values.push(val.slice(1, -1).replace(/''/g, "'"));
        } else {
          values.push(Number(val));
        }
      }
      
      if (values.length >= valCount) {
        datalist.push(mapper(values));
      }
    }
  }
  return datalist;
};

// 1. Servers
const servers = extractData('servers.sql', 'servers', 6, v => ({
  id: v[0], kode: v[1], name: v[2], status: v[3], createdAt: parseDate(v[4]), updatedAt: parseDate(v[5])
}));
if (servers) {
  fs.writeFileSync('Backend/prisma/seeds/servers.json', JSON.stringify(servers, null, 2));
  console.log(`Generated servers.json with ${servers.length} items`);
}

// 2. Operators
const operators = extractData('operators.sql', 'operators', 6, v => ({
  id: v[0], kategoriId: v[1], kode: v[2], name: v[3], createdAt: parseDate(v[4]), updatedAt: parseDate(v[5])
}));
if (operators) {
  fs.writeFileSync('Backend/prisma/seeds/operators.json', JSON.stringify(operators, null, 2));
  console.log(`Generated operators.json with ${operators.length} items`);
}

// 3. Produk Pascabayar
const produkPascabayars = extractData('produk_pascabayars.sql', 'produk_pascabayars', 10, v => ({
  id: v[0], kategoriId: v[1], operatorId: v[2], serverId: v[3], kode: v[4], name: v[5],
  fee: v[6], komisi: v[7], status: v[8], createdAt: parseDate(v[9]), updatedAt: parseDate(v[10])
}));
if (produkPascabayars) {
  fs.writeFileSync('Backend/prisma/seeds/produk_pascabayars.json', JSON.stringify(produkPascabayars, null, 2));
  console.log(`Generated produk_pascabayars.json with ${produkPascabayars.length} items`);
}

// 4. Produks
const produks = extractData('produks.sql', 'produks', 11, v => ({
  id: v[0], operatorId: v[1], kode: v[2], name: v[3], type: v[4],
  purchase_price: v[5], markup: v[6], serverId: v[7], status: v[8], createdAt: parseDate(v[9]), updatedAt: parseDate(v[10])
}));
if (produks) {
  fs.writeFileSync('Backend/prisma/seeds/produks.json', JSON.stringify(produks, null, 2));
  console.log(`Generated produks.json with ${produks.length} items`);
}
