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

const appFiles = walkSync('./app');
const componentFiles = walkSync('./components');
const allFiles = [...appFiles, ...componentFiles];

let replacedCount = 0;

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Remove brutalist borders
  content = content.replace(/border-\[3px\] border-\[#000000\]/g, 'border border-gray-100');
  content = content.replace(/border-2 border-\[#000000\]/g, 'border border-gray-100');
  content = content.replace(/border border-\[#000000\]/g, 'border border-gray-100');
  content = content.replace(/border-b-\[3px\] border-\[#000000\]/g, 'border-b border-gray-100');
  content = content.replace(/border-t-\[3px\] border-\[#000000\]/g, 'border-t border-gray-100');
  content = content.replace(/border-r-\[3px\] border-\[#000000\]/g, 'border-r border-gray-100');
  content = content.replace(/border-l-\[3px\] border-\[#000000\]/g, 'border-l border-gray-100');

  // 2. Remove brutalist shadows
  content = content.replace(/shadow-3d-soft/g, 'shadow-sm');
  content = content.replace(/shadow-3d-hover/g, 'hover:shadow-md');
  content = content.replace(/shadow-3d-button/g, 'shadow-sm active:shadow-none');
  content = content.replace(/shadow-3d/g, 'shadow-md');
  
  // 3. Remove weird backgrounds
  content = content.replace(/bg-notebook-grid/g, '');
  content = content.replace(/paper-cut/g, '');
  content = content.replace(/bg-\[#FFFFFF\]/g, 'bg-white');
  content = content.replace(/bg-\[#F8F9FA\]/g, 'bg-gray-50');
  content = content.replace(/text-\[#FFFFFF\]/g, 'text-white');
  
  // 4. Transform specific colors to Purple/White
  content = content.replace(/text-\[#000000\]/g, 'text-purple-900');
  content = content.replace(/bg-\[#000000\]/g, 'bg-purple-900');
  
  content = content.replace(/bg-\[#FACC15\]/g, 'bg-purple-600');
  content = content.replace(/text-\[#FACC15\]/g, 'text-purple-600');
  
  content = content.replace(/bg-\[#EC4899\]/g, 'bg-purple-50');
  content = content.replace(/text-\[#EC4899\]/g, 'text-purple-600');

  content = content.replace(/bg-\[#4C1D95\]/g, 'bg-purple-600');
  
  content = content.replace(/bg-\[#22C55E\]/g, 'bg-green-50');
  content = content.replace(/text-\[#22C55E\]/g, 'text-green-600');

  content = content.replace(/bg-\[#06B6D4\]/g, 'bg-purple-50');
  
  content = content.replace(/bg-\[#F97316\]/g, 'bg-orange-50');
  content = content.replace(/text-\[#F97316\]/g, 'text-orange-600');

  content = content.replace(/bg-\[#EF4444\]/g, 'bg-red-50');
  content = content.replace(/text-\[#EF4444\]/g, 'text-red-600');

  content = content.replace(/bg-\[#7E22CE\]/g, 'bg-purple-600');
  
  // 5. Fix fonts
  content = content.replace(/font-\['IBM_Plex_Sans_Arabic'\]/g, 'font-sans');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Replaced brutalism in ${file}`);
    replacedCount++;
  }
});

console.log(`Finished brutalism replacement in ${replacedCount} files.`);
