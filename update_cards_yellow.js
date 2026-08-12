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

  // 1. Update text colors inside the cards that I previously set to text-white
  if (content.includes('bg-card-notebook')) {
    content = content.replace(/text-white/g, "text-blue-950");
    content = content.replace(/text-sky-200/g, "text-slate-800"); // for descriptions
  }

  // 2. Welcome card (HeroBanner usages)
  content = content.replace(/from-slate-900 to-slate-950/g, "from-amber-400 to-amber-500");
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated yellow cards in: ${filePath}`);
  }
}

['/Users/istore/platforme/app', '/Users/istore/platforme/components'].forEach(dir => {
  if (fs.existsSync(dir)) {
    walkDir(dir, replaceInFile);
  }
});
console.log("Yellow styling script complete.");
