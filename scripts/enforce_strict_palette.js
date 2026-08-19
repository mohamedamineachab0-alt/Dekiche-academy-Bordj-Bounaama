const fs = require('fs');
const path = require('path');

const dirsToScan = [
  path.join(__dirname, '../app/dashboard/student'),
  path.join(__dirname, '../components/student'),
];

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

let files = [];
dirsToScan.forEach(dir => {
  files = files.concat(getAllFiles(dir));
});

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Enforce Border colors
  content = content.replace(/border-gray-100/g, 'border-purple-100');
  content = content.replace(/border-gray-200/g, 'border-purple-100');
  
  // Enforce background colors for random highlights
  content = content.replace(/bg-\[#EAE4D9\]/g, 'bg-gray-50');
  content = content.replace(/bg-green-50/g, 'bg-white');
  content = content.replace(/bg-orange-50/g, 'bg-white');
  content = content.replace(/bg-red-50/g, 'bg-white');
  content = content.replace(/bg-\[#FEE2E2\]/g, 'bg-gray-50');
  
  // Enforce Text colors
  content = content.replace(/text-gray-500/g, 'text-gray-600');
  content = content.replace(/text-purple-700/g, 'text-purple-900'); // Standardize on 900 for dark text
  
  // Clean up bad contrast (text-purple-900 inside bg-purple-600)
  // We'll just be careful not to blindly replace across line breaks incorrectly, but doing it generally on the same line.
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('bg-purple-600') && lines[i].includes('text-purple-900')) {
      lines[i] = lines[i].replace(/text-purple-900/g, 'text-white');
    }
  }
  content = lines.join('\n');
  
  // Strip out remaining brutalist borders/rotations if any slipped through
  content = content.replace(/\btransform\s+-rotate-\d\b/g, '');
  content = content.replace(/\btransform\s+rotate-\d\b/g, '');
  content = content.replace(/\b-rotate-\d\b/g, '');
  content = content.replace(/\brotate-\d\b/g, '');

  if (content !== original) {
    console.log('Updated:', file);
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Theme enforcement complete.');
