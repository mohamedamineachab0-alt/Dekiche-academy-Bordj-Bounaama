const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function replaceInFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Ruthless purge of anything containing purple, indigo, teal, emerald, rose
  content = content.replace(/purple-/g, "sky-");
  content = content.replace(/indigo-/g, "sky-");
  content = content.replace(/teal-/g, "sky-");
  content = content.replace(/emerald-/g, "sky-");
  content = content.replace(/rose-/g, "amber-");
  // Also any rgba purple colors if present
  content = content.replace(/rgba\(147,51,234/g, "rgba(14,165,233"); // random purples to sky
  content = content.replace(/rgba\(124,\s*58,\s*237/g, "rgba(14, 165, 233");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

['/Users/istore/platforme/app', '/Users/istore/platforme/components'].forEach(dir => {
  if (fs.existsSync(dir)) {
    walkDir(dir, replaceInFile);
  }
});
console.log("Ruthless color purge complete.");
