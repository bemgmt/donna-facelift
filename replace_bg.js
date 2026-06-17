const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/min-h-screen bg-black/g, 'min-h-screen bg-transparent');
  fs.writeFileSync(filePath, content);
}

const files = [
  'app/page.tsx',
  'components/interactive-grid.tsx',
  'components/grid-loading.tsx',
  'components/interfaces/chatbot-control-interface.tsx',
  'components/interfaces/secretary-interface.tsx',
  'app/drive/convert/page.tsx',
  'app/drive/page.tsx',
  'app/drive/dashboard/page.tsx',
  'app/drive/register/page.tsx',
  'app/meet/page.tsx'
];

files.forEach(f => {
  const fullPath = path.join(__dirname, f);
  if (fs.existsSync(fullPath)) {
    replaceInFile(fullPath);
    console.log('Replaced in ' + f);
  }
});
