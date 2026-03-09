#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');
const EN_DOCS_DIR = path.join(__dirname, '../i18n/en/docusaurus-plugin-content-docs/current');

// 提取纯文本（移除 markdown 符号）
function extractPlainText(content, maxLength = 200) {
  const text = content
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
  
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > maxLength * 0.7 
    ? truncated.substring(0, lastSpace)
    : truncated;
}

// 生成描述（基于内容总结）
function generateDescription(content, title) {
  const plainText = extractPlainText(content, 300);
  
  // 提取第一段有意义的文字
  const sentences = plainText.split(/[.!?。！？]/).filter(s => s.trim().length > 20);
  
  if (sentences.length > 0) {
    // 取前1-2句作为描述
    let desc = sentences[0].trim();
    if (sentences[1] && desc.length < 80) {
      desc += '。' + sentences[1].trim();
    }
    return desc.length > 150 ? desc.substring(0, 150) + '...' : desc;
  }
  
  // 如果没有合适的句子，返回截断的文本
  return plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
}

// 处理单个文件
function processFile(filePath, isEnglish = false) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const doc = matter(content);
  
  // 检查是否已有 description
  if (doc.data.description && doc.data.description.trim()) {
    console.log(`  ✓ Already has description: ${filePath}`);
    return null;
  }
  
  // 生成描述
  const description = generateDescription(doc.content, doc.data.title || '');
  
  if (!description) {
    console.log(`  ⚠ Could not generate description: ${filePath}`);
    return null;
  }
  
  // 更新 front matter
  doc.data.description = description;
  
  // 写回文件
  const newContent = matter.stringify(doc.content, doc.data);
  fs.writeFileSync(filePath, newContent, 'utf-8');
  
  console.log(`  ✓ Added description (${isEnglish ? 'EN' : 'ZH'}): ${filePath}`);
  console.log(`    → ${description.substring(0, 80)}...`);
  
  return description;
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
  console.log('🔍 Checking docs for missing descriptions...\n');
  
  const zhFiles = getAllDocs(DOCS_DIR);
  let zhUpdated = 0;
  let enUpdated = 0;
  let skipped = 0;
  
  for (const zhFile of zhFiles) {
    // 跳过 _category_.json 等非文档文件
    if (path.basename(zhFile).startsWith('_')) {
      skipped++;
      continue;
    }
    
    console.log(`\nProcessing: ${path.relative(DOCS_DIR, zhFile)}`);
    
    // 处理中文版
    const zhDesc = processFile(zhFile, false);
    if (zhDesc) zhUpdated++;
    
    // 处理英文版
    const enFile = getEnDocPath(zhFile);
    if (fs.existsSync(enFile)) {
      const enDesc = processFile(enFile, true);
      if (enDesc) enUpdated++;
    } else {
      console.log(`  ⚠ No English version: ${enFile}`);
    }
  }
  
  console.log(`\n✅ Done!`);
  console.log(`   Updated ${zhUpdated} Chinese docs`);
  console.log(`   Updated ${enUpdated} English docs`);
  console.log(`   Skipped ${skipped} files`);
}

main();
