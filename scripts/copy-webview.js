const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../src/webview');
const dest = path.join(__dirname, '../dist/webview');

fs.mkdirSync(dest, { recursive: true });

for (const file of fs.readdirSync(src)) {
 if (file.endsWith('.html') || file.endsWith('.js')) {
  fs.copyFileSync(
   path.join(src, file),
   path.join(dest, file)
  );
 }
}
