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

  // Catch remaining border-[Xpx] border-[#000000]
  content = content.replace(/border-\[[0-9]+px\] border-\[#000000\]/g, 'border border-gray-100');
  content = content.replace(/border-b-\[[0-9]+px\] border-\[#000000\]/g, 'border-b border-gray-100');
  content = content.replace(/border-t-\[[0-9]+px\] border-\[#000000\]/g, 'border-t border-gray-100');
  content = content.replace(/border-l-\[[0-9]+px\] border-\[#000000\]/g, 'border-l border-gray-100');
  content = content.replace(/border-r-\[[0-9]+px\] border-\[#000000\]/g, 'border-r border-gray-100');

  // Catch remaining backgrounds
  content = content.replace(/bg-notebook-grid/g, '');
  content = content.replace(/paper-cut/g, '');
  
  // Catch colors
  content = content.replace(/text-\[#FACC15\]/g, 'text-purple-600');
  content = content.replace(/bg-\[#FACC15\]/g, 'bg-purple-600');
  
  // Also clean up any lingering 'text-white' that might be invisible on bg-white
  // Wait, that's context dependent. I'll leave it unless it causes issues.

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Cleaned residual brutalism in ${file}`);
    replacedCount++;
  }
});

console.log(`Finished residual brutalism replacement in ${replacedCount} files.`);
