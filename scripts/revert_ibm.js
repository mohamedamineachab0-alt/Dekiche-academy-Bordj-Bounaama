const fs = require('fs');

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

  content = content.replace(/font-sans/g, "font-['IBM_Plex_Sans_Arabic']");

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Reverted IBM font in ${file}`);
    replacedCount++;
  }
});

console.log(`Finished font replacement in ${replacedCount} files.`);
