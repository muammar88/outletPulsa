const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetDir = 'd:\\PROJECT\\NODEJS\\outletPulsa\\Mobile\\lib';

let filesModified = 0;

walkDir(targetDir, function(filePath) {
  if (filePath.endsWith('.dart')) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace GoogleFonts.something( with GoogleFonts.poppins(
    // e.g. GoogleFonts.ptSans(
    const regex = /GoogleFonts\.[a-zA-Z0-9_]+\(/g;
    
    if (regex.test(content)) {
      const newContent = content.replace(regex, 'GoogleFonts.poppins(');
      
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        filesModified++;
        console.log('Updated: ' + filePath);
      }
    }
  }
});

console.log(`Successfully updated ${filesModified} files to use GoogleFonts.poppins`);
