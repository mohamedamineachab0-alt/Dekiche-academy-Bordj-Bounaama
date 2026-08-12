const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
        filelist = walkSync(dir + '/' + file, filelist);
      }
    }
    else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        filelist.push(dir + '/' + file);
      }
    }
  });
  return filelist;
};

const files = walkSync('.');
let replacedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace all color variations (amber, yellow, sky, rose, red, slate) with purple/white equivalents
  // We use regex to match prefixes like bg-, text-, border-, ring-, shadow-, from-, to-, via-
  const prefixes = ['bg-', 'text-', 'border-', 'ring-', 'shadow-', 'from-', 'to-', 'via-', 'hover:bg-', 'hover:text-', 'hover:border-', 'focus:ring-', 'dark:bg-', 'dark:text-', 'dark:border-'];
  const colorsToPurple = ['amber', 'yellow', 'sky', 'rose', 'red', 'indigo', 'blue'];
  
  colorsToPurple.forEach(color => {
    // 50, 100, 200 -> purple-50/100/200 (light accents)
    content = content.replace(new RegExp(`${color}-50(?!0)`, 'g'), 'purple-50');
    content = content.replace(new RegExp(`${color}-100`, 'g'), 'purple-100');
    content = content.replace(new RegExp(`${color}-200`, 'g'), 'purple-200');
    content = content.replace(new RegExp(`${color}-300`, 'g'), 'purple-300');
    // 400, 500, 600, 700 -> purple-600/700 (primary)
    content = content.replace(new RegExp(`${color}-400`, 'g'), 'purple-500');
    content = content.replace(new RegExp(`${color}-500`, 'g'), 'purple-600');
    content = content.replace(new RegExp(`${color}-600`, 'g'), 'purple-700');
    content = content.replace(new RegExp(`${color}-700`, 'g'), 'purple-800');
    // 800, 900, 950 -> purple-900/950
    content = content.replace(new RegExp(`${color}-800`, 'g'), 'purple-900');
    content = content.replace(new RegExp(`${color}-900`, 'g'), 'purple-950');
    content = content.replace(new RegExp(`${color}-950`, 'g'), 'purple-950');
  });

  // Backgrounds and cards should be white.
  // Replace dark backgrounds
  content = content.replace(/bg-slate-800/g, 'bg-white');
  content = content.replace(/bg-slate-900/g, 'bg-white');
  content = content.replace(/bg-slate-950/g, 'bg-white');
  content = content.replace(/dark:bg-slate-800/g, 'dark:bg-white');
  content = content.replace(/dark:bg-slate-900/g, 'dark:bg-white');
  content = content.replace(/dark:bg-slate-950/g, 'dark:bg-white');
  
  // Replace text on white backgrounds to ensure it's visible
  // If we changed dark bg to white, white text will be invisible.
  content = content.replace(/text-white/g, 'text-purple-950');
  content = content.replace(/text-slate-100/g, 'text-purple-900');
  content = content.replace(/text-slate-200/g, 'text-purple-900');
  
  // Keep primary buttons having white text though...
  // Wait, if we replace text-white everywhere, buttons will have dark text on dark background!
  // Let's restore text-white inside buttons or elements with primary background.
  // We can just rely on standard tailwind classes or do a pass to fix bg-purple-[6,7,8]00 text-purple-950 -> text-white
  content = content.replace(/bg-purple-600(.*?)text-purple-950/g, 'bg-purple-600$1text-white');
  content = content.replace(/bg-purple-700(.*?)text-purple-950/g, 'bg-purple-700$1text-white');
  content = content.replace(/bg-purple-800(.*?)text-purple-950/g, 'bg-purple-800$1text-white');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Replaced colors in ${file}`);
    replacedCount++;
  }
});

console.log(`Finished color replacement in ${replacedCount} files.`);
