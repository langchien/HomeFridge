import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const uiTemplateDir = path.join(rootDir, 'ui-template');

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      callback(filePath);
    }
  }
}

console.log('Bắt đầu quét và sửa lỗi đường dẫn trong ui-template...');

walkDir(uiTemplateDir, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Thay thế registry imports
  content = content.replace(/@\/registry\/new-york-v4\/ui\//g, '@/components/ui/');
  content = content.replace(/@\/registry\/new-york-v4\/hooks\//g, '@/hooks/');

  // 2. Sửa lỗi import ví dụ dashboard
  content = content.replace(/@\/app\/\(app\)\/examples\/dashboard\/components\//g, '@/ui-template/dashboard/components/');
  
  // 3. Sửa đường dẫn đọc file json trong page.tsx của tasks
  if (filePath.endsWith('tasks' + path.sep + 'page.tsx') || filePath.endsWith('tasks/page.tsx')) {
    content = content.replace(/app\/\(app\)\/examples\/tasks\/data\/tasks.json/g, 'ui-template/tasks/data/tasks.json');
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Đã sửa: ${path.relative(rootDir, filePath)}`);
  }
});

console.log('Hoàn thành sửa lỗi đường dẫn!');
