const fs = require('fs');
const path = require('path');

const NEW_TEXT = "منصة أكاديمية دقيش التعليمية برج بونعامة";

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
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.md') || file.endsWith('.json') || file.endsWith('.sql')) {
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
  
  // Replace long version first if it exists
  content = content.replace(/منصة أكاديمية دقيش \(Dekiche Academy\)/g, NEW_TEXT);
  content = content.replace(/منصة دقيش التعليمية/g, NEW_TEXT);
  // Replace short version, avoiding replacing already replaced text
  // Let's just do a regex that replaces "أكاديمية دقيش" if not part of the NEW_TEXT
  content = content.replace(/أكاديمية دقيش/g, (match, offset, string) => {
    const context = string.substring(Math.max(0, offset - 10), Math.min(string.length, offset + 15));
    if (context.includes(NEW_TEXT.substring(0, 20))) {
        return match;
    }
    return NEW_TEXT;
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Replaced in ${file}`);
    replacedCount++;
  }
});

console.log(`Finished text replacement in ${replacedCount} files.`);
