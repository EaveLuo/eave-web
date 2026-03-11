import React, { type ReactNode } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import { usePluginData } from '@docusaurus/useGlobalData';
import { FileText, ArrowRight, Code, Server, Cpu, Settings, Database, Smartphone, Shield, Globe, Terminal, Cloud } from 'lucide-react';
import styles from './styles.module.css';

// 图标映射表 - 只保留通用的图标组件映射
const iconComponents: Record<string, React.ComponentType<{ size?: number }>> = {
  FileText,
  Code,
  Server,
  Cpu,
  Settings,
  Database,
  Smartphone,
  Shield,
  Globe,
  Terminal,
  Cloud,
};

// 默认主题色
const DEFAULT_COLOR = '#2e8555';

interface DocCategory {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  icon: string;
  color: string | null;
  path: string;
}

interface HomepageData {
  docCategories: DocCategory[];
}

// 分类卡片组件
function CategoryCard({
  category,
  index,
}: {
  category: DocCategory;
  index: number;
}) {
  // 尝试多种方式匹配图标
  const Icon = iconComponents[category.icon] ||
               iconComponents[category.icon.charAt(0).toUpperCase() + category.icon.slice(1)] ||
               FileText;

  // 使用配置的颜色或默认色
  const color = category.color || DEFAULT_COLOR;

  return (
    <article
      className={styles.card}
      style={{ '--card-index': index } as React.CSSProperties}
    >
      <Link to={category.path} className={styles.cardLink}>
        <div
          className={styles.cardIcon}
          style={{ backgroundColor: `${color}15`, color }}
        >
          <Icon size={28} />
        </div>

        <div className={styles.cardContent}>
          <h2 className={styles.cardTitle}>
            {category.title}
            <span className={styles.cardTitleEn}>{category.titleEn}</span>
          </h2>
          <p className={styles.cardDescription}>{category.description}</p>
        </div>

        <div className={styles.cardArrow}>
          <ArrowRight size={20} />
        </div>
      </Link>
    </article>
  );
}

export default function DocsIndexPage(): ReactNode {
  const homepageData = usePluginData('docusaurus-plugin-homepage-data') as HomepageData | undefined;
  const categories = homepageData?.docCategories || [];

  return (
    <Layout
      title="文档"
      description="Eave Luo 的技术文档库，涵盖前端、后端、运维、AI 等领域"
    >
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          {/* 页面头部 */}
          <header className={styles.header}>
            <div className={styles.headerIcon}>
              <FileText size={32} />
            </div>
            <h1 className={styles.headerTitle}>
              <Translate id="docsIndexPage.title">技术文档</Translate>
            </h1>
            <p className={styles.headerSubtitle}>
              <Translate id="docsIndexPage.subtitle">
                系统化的前端、后端、运维与 AI 知识库
              </Translate>
            </p>
          </header>

          {/* 分类网格 */}
          {categories.length > 0 ? (
            <div className={styles.grid}>
              {categories.map((category, index) => (
                <CategoryCard key={category.id} category={category} index={index} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>
                <Translate id="docsIndexPage.noCategories">暂无文档分类</Translate>
              </p>
            </div>
          )}

          {/* 底部提示 */}
          <div className={styles.footer}>
            <p>
              <Translate id="docsIndexPage.footer">
                点击任意分类开始探索，或使用顶部导航快速访问
              </Translate>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
