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

  // Replace standard card containers
  // 1. Student Dashboard style
  content = content.replace(/bg-white rounded-2xl p-6 border-2 border-slate-50 hover:border-transparent hover:shadow-md/g, 
                            "bg-card-notebook rounded-2xl p-6 border border-sky-500/30 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500/20 text-white");
  // 2. Other common styles (e.g., bg-white dark:bg-slate-900 rounded-3xl p-8 border)
  content = content.replace(/bg-white dark:bg-blue-950 rounded-3xl p-8 border border-sky-100 dark:border-blue-900 shadow-sm/g,
                            "bg-card-notebook rounded-3xl p-8 border border-sky-500/30 shadow-lg text-white");
  content = content.replace(/bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm/g,
                            "bg-card-notebook rounded-3xl p-8 border border-sky-500/30 shadow-lg text-white");
  
  // Specific title text colors inside cards: text-slate-900 -> text-white
  // Description text colors: text-slate-500 -> text-sky-200
  // Note: we can't do this blindly across the whole file. 
  // Let's do it for Student Dashboard specific strings since it's the main entry point:
  if (filePath.includes('dashboard/student/page.tsx')) {
    content = content.replace(/text-slate-900 mb-6/g, "text-white mb-6");
    content = content.replace(/text-slate-900 mb-2/g, "text-white mb-2");
    content = content.replace(/text-slate-500 line-clamp-2/g, "text-sky-200 line-clamp-2");
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated cards in: ${filePath}`);
  }
}

['/Users/istore/platforme/app', '/Users/istore/platforme/components'].forEach(dir => {
  if (fs.existsSync(dir)) {
    walkDir(dir, replaceInFile);
  }
});
console.log("Card styling script complete.");
