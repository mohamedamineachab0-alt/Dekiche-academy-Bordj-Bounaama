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
    } else {
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

  // Remove font-['IBM_Plex_Sans_Arabic'] (broken underscore class) — body CSS handles it now
  // Handle cases where it's at start, middle, or end of className string
  content = content.replace(/ ?font-\['IBM_Plex_Sans_Arabic'\]/g, '');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Cleaned font class in: ${file}`);
    replacedCount++;
  }
});

console.log(`\nDone. Cleaned ${replacedCount} files.`);
