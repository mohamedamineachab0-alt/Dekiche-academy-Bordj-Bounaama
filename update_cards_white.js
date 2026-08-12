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

  // 1. Revert to bg-white with amber shadow
  content = content.replace(/bg-card-notebook rounded-2xl p-6 border border-sky-500\/30 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500\/20 text-blue-950/g, 
                            "bg-white rounded-2xl p-6 border border-amber-200 shadow-sm hover:border-amber-300 hover:shadow-md hover:shadow-amber-500/10");
  
  content = content.replace(/bg-card-notebook rounded-3xl p-8 border border-sky-500\/30 shadow-lg text-blue-950/g,
                            "bg-white rounded-3xl p-8 border border-amber-200 shadow-sm hover:shadow-md hover:shadow-amber-500/10");

  // 2. Restore text colors inside those cards
  // I changed `text-white` to `text-blue-950` in `update_cards_yellow.js`.
  // Wait, I specifically did `text-slate-900` -> `text-white` -> `text-blue-950`.
  // Now I need to turn `text-blue-950` back to `text-slate-900`. 
  // Let's just do it for dashboard/student/page.tsx
  if (filePath.includes('dashboard/student/page.tsx')) {
    content = content.replace(/text-blue-950 mb-6/g, "text-slate-900 mb-6");
    content = content.replace(/text-blue-950 mb-2/g, "text-slate-900 mb-2");
    content = content.replace(/text-slate-800 line-clamp-2/g, "text-slate-500 line-clamp-2");
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated white/amber cards in: ${filePath}`);
  }
}

['/Users/istore/platforme/app', '/Users/istore/platforme/components'].forEach(dir => {
  if (fs.existsSync(dir)) {
    walkDir(dir, replaceInFile);
  }
});
console.log("White/Amber styling script complete.");
