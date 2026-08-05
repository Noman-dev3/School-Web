const fs = require('fs');
let content = fs.readFileSync('src/app/layout.tsx', 'utf8');
content = content.replace(/<head>([\s\S]*?)<\/head>/g, '$1');
fs.writeFileSync('src/app/layout.tsx', content);
