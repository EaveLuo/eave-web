#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');
const EN_DOCS_DIR = path.join(__dirname, '../i18n/en/docusaurus-plugin-content-docs/current');

// 提取纯文本（移除 markdown 符号）
function extractPlainText(content) {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/(\*\*?|__?)([^*_]+)\1/g, '$2')
    .replace(/^\s*[-*+\d.]\s+/gm, ' ')
    .replace(/^>\s?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// 根据标题生成描述模板
function generateDescriptionByTitle(title, content, isEnglish) {
  const plainText = extractPlainText(content);
  
  // 提取关键句子（通常是介绍段落）
  const sentences = plainText
    .split(/[.!?。！？]/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 200);
  
  // 找包含标题关键词的句子
  const titleKeywords = title
    .replace(/[\-–—]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2)
    .slice(0, 3);
  
  // 尝试找包含标题关键词的句子
  const relevantSentences = sentences.filter(s => 
    titleKeywords.some(kw => s.toLowerCase().includes(kw.toLowerCase()))
  );
  
  // 优先使用包含关键词的句子，否则用前几个句子
  const candidateSentences = relevantSentences.length > 0 
    ? relevantSentences 
    : sentences;
  
  // 组合 1-2 个句子
  let desc = candidateSentences[0] || '';
  if (candidateSentences[1] && desc.length < 60) {
    desc += isEnglish ? '. ' : '。';
    desc += candidateSentences[1];
  }
  
  // 限制长度
  if (desc.length > 120) {
    desc = desc.substring(0, 120);
    const lastSpace = desc.lastIndexOf(' ');
    if (lastSpace > 80) {
      desc = desc.substring(0, lastSpace);
    }
    desc += isEnglish ? '...' : '...';
  }
  
  return desc;
}

// 处理单个文件
function processFile(filePath, isEnglish) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const doc = matter(content);
  
  // 获取标题
  const title = doc.data.title || doc.data.sidebar_label || '';
  if (!title) {
    console.log(`  ⚠ No title found: ${filePath}`);
    return;
  }
  
  // 生成描述
  const description = generateDescriptionByTitle(title, doc.content, isEnglish);
  
  if (!description) {
    console.log(`  ⚠ Could not generate description: ${filePath}`);
    return;
  }
  
  // 更新 front matter
  doc.data.description = description;
  
  // 写回文件
  const newContent = matter.stringify(doc.content, doc.data);
  fs.writeFileSync(filePath, newContent, 'utf-8');
  
  console.log(`  ✓ Updated (${isEnglish ? 'EN' : 'ZH'}): ${path.basename(filePath)}`);
  console.log(`    → ${description}`);
}

// 递归获取所有 .md 文件
function getAllDocs(dir) {
  const files = [];
  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }
  traverse(dir);
  return files;
}

// 获取对应英文版文档路径
function getEnDocPath(zhFilePath) {
  const relativePath = path.relative(DOCS_DIR, zhFilePath);
  return path.join(EN_DOCS_DIR, relativePath);
}

// 主函数
function main() {
  console.log('📝 Generating descriptions based on content summary...\n');
  
  const zhFiles = getAllDocs(DOCS_DIR);
  let updated = 0;
  
  for (const zhFile of zhFiles) {
    // 跳过非文档文件
    if (path.basename(zhFile).startsWith('_')) continue;
    
    console.log(`\nProcessing: ${path.relative(DOCS_DIR, zhFile)}`);
    
    // 处理中文版
    processFile(zhFile, false);
    updated++;
    
    // 处理英文版
    const enFile = getEnDocPath(zhFile);
    if (fs.existsSync(enFile)) {
      processFile(enFile, true);
    }
  }
  
  console.log(`\n✅ Done! Updated ${updated} docs`);
}

main();
