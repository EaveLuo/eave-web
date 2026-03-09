#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const EN_DOCS_DIR = path.join(__dirname, '../i18n/en/docusaurus-plugin-content-docs/current');
const ZH_DOCS_DIR = path.join(__dirname, '../docs');

// Tag 翻译映射
const tagTranslations = {
  '前端': 'Frontend',
  '后端': 'Backend',
  '运维': 'DevOps',
  // 技术名称保持不变
  'Go': 'Go',
  'Node.js': 'Node.js',
  'Python': 'Python',
  'AI': 'AI',
};

// 翻译 tags
function translateTags(tags) {
  return tags.map(tag => tagTranslations[tag] || tag);
}

// 递归获取所有 .md 和 .mdx 文件
function getAllDocs(dir) {
  const files = [];
  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
        files.push(fullPath);
      }
    }
  }
  traverse(dir);
  return files;
}

// 获取对应的中文文档路径
function getZhDocPath(enDocPath) {
  const relativePath = path.relative(EN_DOCS_DIR, enDocPath);
  return path.join(ZH_DOCS_DIR, relativePath);
}

// 处理单个文件
function processFile(enFilePath) {
  console.log(`Processing: ${enFilePath}`);
  
  // 读取英文文档
  const enContent = fs.readFileSync(enFilePath, 'utf-8');
  const enDoc = matter(enContent);
  
  // 如果已经有 tags，跳过
  if (enDoc.data.tags && enDoc.data.tags.length > 0) {
    console.log(`  Already has tags: ${enDoc.data.tags.join(', ')}`);
    return;
  }
  
  // 获取对应的中文文档
  const zhFilePath = getZhDocPath(enFilePath);
  if (!fs.existsSync(zhFilePath)) {
    console.log(`  No corresponding zh doc found: ${zhFilePath}`);
    return;
  }
  
  // 读取中文文档的 front matter
  const zhContent = fs.readFileSync(zhFilePath, 'utf-8');
  const zhDoc = matter(zhContent);
  
  // 复制 date
  if (zhDoc.data.date) {
    enDoc.data.date = zhDoc.data.date;
  }
  
  // 翻译 tags
  if (zhDoc.data.tags && zhDoc.data.tags.length > 0) {
    enDoc.data.tags = translateTags(zhDoc.data.tags);
    console.log(`  Translated tags: ${zhDoc.data.tags.join(', ')} -> ${enDoc.data.tags.join(', ')}`);
  } else {
    enDoc.data.tags = [];
  }
  
  // 写回文件
  const newContent = matter.stringify(enDoc.content, enDoc.data);
  fs.writeFileSync(enFilePath, newContent, 'utf-8');
  console.log(`  Updated!`);
}

// 主函数
function main() {
  console.log('📝 Processing English docs...\n');
  
  const files = getAllDocs(EN_DOCS_DIR);
  console.log(`Found ${files.length} English docs\n`);
  
  let processed = 0;
  let skipped = 0;
  
  for (const file of files) {
    try {
      processFile(file);
      processed++;
    } catch (error) {
      console.error(`  Error: ${error.message}`);
      skipped++;
    }
  }
  
  console.log(`\n✅ Done! Processed ${processed} files, skipped ${skipped} files`);
}

main();
