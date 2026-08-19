const fs = require('fs');

const filesToProcess = [
  './app/page.tsx',
  './components/landing/HeroSection.tsx',
  './components/landing/FeaturesSection.tsx',
  './components/landing/TeamSection.tsx',
  './components/landing/LeaderboardSection.tsx',
];

filesToProcess.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Match tags like <h1 className="...">, <h2 className="...">, <h3 className="...">, <p className="...">, <span className="...">, <button className="...">
    // and inject font-['IBM_Plex_Sans_Arabic'] if it doesn't already exist.
    const regex = /<(h1|h2|h3|h4|p|span|button|a)\s+([^>]*?)className="([^"]*?)"/g;
    
    content = content.replace(regex, (match, tag, beforeClass, classContent) => {
      if (!classContent.includes("font-['IBM_Plex_Sans_Arabic']")) {
        return `<${tag} ${beforeClass}className="${classContent} font-['IBM_Plex_Sans_Arabic']"`;
      }
      return match;
    });

    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log(`Added IBM font explicitly to elements in ${file}`);
    }
  }
});

console.log('Font enforcement complete.');
