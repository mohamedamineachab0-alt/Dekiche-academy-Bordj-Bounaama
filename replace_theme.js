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

  // Replace background colors for cards/sections to White
  content = content.replace(/bg-slate-900/g, 'bg-white');
  content = content.replace(/bg-slate-950/g, 'bg-white');
  content = content.replace(/bg-slate-800/g, 'bg-white');
  content = content.replace(/bg-slate-50/g, 'bg-white');
  content = content.replace(/bg-gray-900/g, 'bg-white');
  content = content.replace(/bg-gray-800/g, 'bg-white');
  content = content.replace(/bg-gray-50/g, 'bg-white');
  content = content.replace(/bg-blue-900/g, 'bg-white');
  content = content.replace(/bg-blue-950/g, 'bg-white');
  content = content.replace(/bg-indigo-900/g, 'bg-white');
  content = content.replace(/bg-indigo-950/g, 'bg-white');

  // Replace dark mode classes since the theme is strict White
  content = content.replace(/dark:bg-slate-900/g, 'dark:bg-white');
  content = content.replace(/dark:bg-slate-800/g, 'dark:bg-white');
  content = content.replace(/dark:bg-slate-950/g, 'dark:bg-white');
  content = content.replace(/dark:bg-blue-950/g, 'dark:bg-white');

  // If text was white on dark backgrounds, make it purple for contrast
  content = content.replace(/text-white/g, 'text-purple-950');
  content = content.replace(/dark:text-white/g, 'dark:text-purple-950');
  content = content.replace(/text-slate-200/g, 'text-purple-900');
  content = content.replace(/text-slate-300/g, 'text-purple-800');
  
  // Make normal text colors purple-950/900 or keep them, but "strict Purple and White theme" 
  // means we should probably change slate-900 text to purple-950
  content = content.replace(/text-slate-900/g, 'text-purple-950');
  content = content.replace(/text-slate-800/g, 'text-purple-900');
  content = content.replace(/text-slate-700/g, 'text-purple-800');
  content = content.replace(/text-gray-900/g, 'text-purple-950');
  content = content.replace(/text-gray-800/g, 'text-purple-900');
  
  content = content.replace(/text-blue-950/g, 'text-purple-950');
  content = content.replace(/text-blue-900/g, 'text-purple-900');
  content = content.replace(/text-blue-800/g, 'text-purple-800');

  // Buttons, active states, and accents -> Royal Purple (purple-700 or purple-600)
  // Let's replace amber, blue, indigo, sky accents
  content = content.replace(/bg-amber-500/g, 'bg-purple-700');
  content = content.replace(/bg-amber-600/g, 'bg-purple-800');
  content = content.replace(/bg-amber-400/g, 'bg-purple-600');
  content = content.replace(/bg-yellow-500/g, 'bg-purple-700');
  content = content.replace(/bg-yellow-600/g, 'bg-purple-800');
  
  content = content.replace(/bg-blue-600/g, 'bg-purple-700');
  content = content.replace(/bg-blue-500/g, 'bg-purple-600');
  content = content.replace(/bg-blue-400/g, 'bg-purple-500');

  content = content.replace(/bg-sky-500/g, 'bg-purple-700');
  content = content.replace(/bg-sky-600/g, 'bg-purple-800');
  content = content.replace(/bg-sky-400/g, 'bg-purple-600');

  content = content.replace(/bg-indigo-600/g, 'bg-purple-700');
  content = content.replace(/bg-indigo-500/g, 'bg-purple-600');

  // Text accents
  content = content.replace(/text-amber-500/g, 'text-purple-700');
  content = content.replace(/text-amber-600/g, 'text-purple-800');
  content = content.replace(/text-yellow-500/g, 'text-purple-700');
  content = content.replace(/text-blue-600/g, 'text-purple-700');
  content = content.replace(/text-blue-500/g, 'text-purple-600');
  content = content.replace(/text-sky-500/g, 'text-purple-700');
  content = content.replace(/text-indigo-600/g, 'text-purple-700');

  // Border accents
  content = content.replace(/border-amber-500/g, 'border-purple-700');
  content = content.replace(/border-amber-600/g, 'border-purple-800');
  content = content.replace(/border-blue-500/g, 'border-purple-700');
  content = content.replace(/border-sky-500/g, 'border-purple-700');
  content = content.replace(/border-slate-800/g, 'border-purple-200');
  content = content.replace(/border-slate-700/g, 'border-purple-200');
  content = content.replace(/border-gray-200/g, 'border-purple-200');
  
  // Ring accents
  content = content.replace(/ring-amber-500/g, 'ring-purple-700');
  content = content.replace(/ring-blue-500/g, 'ring-purple-700');

  // Hover states
  content = content.replace(/hover:bg-amber-600/g, 'hover:bg-purple-800');
  content = content.replace(/hover:bg-amber-500/g, 'hover:bg-purple-700');
  content = content.replace(/hover:bg-blue-700/g, 'hover:bg-purple-800');
  content = content.replace(/hover:bg-blue-600/g, 'hover:bg-purple-700');
  
  content = content.replace(/hover:text-amber-400/g, 'hover:text-purple-600');
  content = content.replace(/hover:text-amber-500/g, 'hover:text-purple-700');
  content = content.replace(/hover:text-white/g, 'hover:text-purple-900'); // If background is white now

  // If there are specific primary/secondary colors defined by tailwind classes
  content = content.replace(/bg-primary/g, 'bg-purple-700');
  content = content.replace(/text-primary/g, 'text-purple-700');
  content = content.replace(/bg-secondary/g, 'bg-purple-100');
  
  // Fix gradients
  content = content.replace(/from-slate-900/g, 'from-white');
  content = content.replace(/to-slate-800/g, 'to-white');
  content = content.replace(/from-blue-950/g, 'from-white');
  content = content.replace(/to-blue-900/g, 'to-white');
  content = content.replace(/from-amber-400/g, 'from-purple-600');
  content = content.replace(/to-amber-600/g, 'to-purple-800');
  content = content.replace(/from-amber-500/g, 'from-purple-600');
  content = content.replace(/to-amber-500/g, 'to-purple-700');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Replaced colors in ${file}`);
    replacedCount++;
  }
});

console.log(`Finished color replacement in ${replacedCount} files.`);
