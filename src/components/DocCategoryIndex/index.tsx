import React, {type ReactNode} from 'react';
import {usePluginData} from '@docusaurus/useGlobalData';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {FolderOpen, ArrowRight} from 'lucide-react';
import styles from './styles.module.css';

interface SubCategory {
  id: string;
  title: string;
  path: string;
}

interface DocCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string | null;
  path: string;
  subCategories: SubCategory[];
}

interface HomepageData {
  docCategories: DocCategory[];
}

export default function DocCategoryIndex(): ReactNode {
  const location = useLocation();
  const homepageData = usePluginData('docusaurus-plugin-homepage-data') as HomepageData | undefined;

  // 从当前路径提取分类 ID
  const currentPath = location.pathname;
  const pathMatch = currentPath.match(/\/docs\/([^\/]+)/);
  const categoryId = pathMatch?.[1] || '';

  // 从全局数据获取当前分类的子分类
  const category = homepageData?.docCategories?.find((cat: DocCategory) => cat.id === categoryId);
  const subCategories = category?.subCategories || [];

  if (subCategories.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {subCategories.map((item, index) => (
          <Link
            key={item.id}
            to={item.path}
            className={styles.card}
            style={{'--card-index': index} as React.CSSProperties}>
            <div className={styles.cardIcon}>
              <FolderOpen size={24} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{item.title}</h3>
            </div>
            <ArrowRight size={18} className={styles.cardArrow} />
          </Link>
        ))}
      </div>
    </div>
  );
}
