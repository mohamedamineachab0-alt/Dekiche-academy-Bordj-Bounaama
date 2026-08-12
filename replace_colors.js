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

  // 1. Primary Buttons
  content = content.replace(/bg-purple-[56]00 hover:bg-purple-[67]00 text-white/g, "bg-amber-400 hover:bg-amber-500 text-slate-950 font-black");
  content = content.replace(/bg-purple-600 text-white hover:bg-purple-700/g, "bg-amber-400 text-slate-950 hover:bg-amber-500 font-black");
  
  // 2. Gradients
  content = content.replace(/from-purple-700 to-indigo-800/g, "from-slate-900 to-slate-950");
  content = content.replace(/from-purple-600 to-indigo-600/g, "from-slate-900 to-slate-950");
  content = content.replace(/from-purple-[456789]00/g, "from-slate-900");
  content = content.replace(/to-purple-[456789]00/g, "to-slate-950");
  content = content.replace(/to-indigo-[456789]00/g, "to-slate-950");
  content = content.replace(/from-indigo-[456789]00/g, "from-slate-900");

  // 3. Selection/Active Backgrounds (usually purple-50 or purple-100)
  content = content.replace(/bg-purple-50/g, "bg-sky-50");
  content = content.replace(/bg-purple-100/g, "bg-sky-100");
  content = content.replace(/bg-purple-200/g, "bg-sky-200");
  
  // 4. Texts & Borders
  content = content.replace(/text-purple-900/g, "text-slate-950");
  content = content.replace(/text-purple-800/g, "text-slate-900");
  content = content.replace(/text-purple-700/g, "text-sky-700");
  content = content.replace(/text-purple-600/g, "text-sky-600");
  content = content.replace(/text-purple-500/g, "text-sky-500");
  content = content.replace(/text-indigo-600/g, "text-sky-600");
  
  content = content.replace(/border-purple-200/g, "border-sky-200");
  content = content.replace(/border-purple-300/g, "border-sky-300");
  content = content.replace(/border-purple-500/g, "border-sky-500");
  content = content.replace(/border-purple-600/g, "border-sky-600");

  content = content.replace(/ring-purple-500/g, "ring-sky-500");
  content = content.replace(/ring-purple-600/g, "ring-amber-400");
  
  content = content.replace(/shadow-purple-500\/[0-9]+/g, "shadow-sky-500/20");
  content = content.replace(/shadow-purple-600\/[0-9]+/g, "shadow-amber-500/20");

  // General catch-all for remaining purples (mapping to sky blue)
  content = content.replace(/bg-purple-500/g, "bg-sky-500");
  content = content.replace(/bg-purple-600/g, "bg-sky-600");
  content = content.replace(/bg-purple-700/g, "bg-sky-700");
  content = content.replace(/bg-purple-800/g, "bg-slate-900");
  content = content.replace(/bg-purple-900/g, "bg-slate-950");

  // 5. Purge other legacy colors
  // Teal -> Sky
  content = content.replace(/teal-/g, "sky-");
  // Emerald -> Sky
  content = content.replace(/emerald-/g, "sky-");
  // Rose -> Amber
  content = content.replace(/rose-/g, "amber-");
  // Red -> Amber (Warning) - mostly
  content = content.replace(/red-50/g, "amber-50");
  content = content.replace(/red-100/g, "amber-100");
  content = content.replace(/red-200/g, "amber-200");
  content = content.replace(/red-500/g, "amber-500");
  content = content.replace(/red-600/g, "amber-600");
  content = content.replace(/red-700/g, "amber-700");

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
console.log("Color replacement complete.");
