---
sidebar_position: 2
title: 自定义组件开发
description: 如何在 Docusaurus 中开发和集成自定义 React 组件
---

# 自定义组件开发

Docusaurus 的强大之处在于可以轻松集成自定义 React 组件。

## 📦 组件位置

```
src/
├── components/           # 自定义组件
│   ├── Feature/
│   │   ├── index.tsx
│   │   └── styles.module.css
│   └── index.ts
└── theme/               # 主题覆盖组件
    ├── Navbar/
    │   └── index.tsx
    └── Footer/
        └── index.tsx
```

## 🎯 基础组件示例

### 功能卡片

```tsx
// src/components/Feature/index.tsx
import clsx from 'clsx';
import styles from './styles.module.css';

interface FeatureProps {
  title: string;
  description: string;
  icon: string;
}

export default function Feature({ title, description, icon }: FeatureProps) {
  return (
    <div className={clsx('col col--4', styles.feature)}>
      <div className={styles.icon}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
```

### 使用方式

```mdx
import Feature from '@site/src/components/Feature';

# 页面标题

<div className="row">
  <Feature 
    title="快速" 
    description="基于 React 的高性能渲染"
    icon="🚀"
  />
  <Feature 
    title="易用" 
    description="简单的 API 设计"
    icon="✨"
  />
</div>
```

## 🎨 样式处理

### CSS Modules

```css
/* styles.module.css */
.feature {
  padding: 2rem;
  text-align: center;
  border-radius: 8px;
  background: var(--ifm-card-background-color);
}

.icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
```

```tsx
import styles from './styles.module.css';

<div className={styles.feature}>...</div>
```

### TailwindCSS

如果项目使用 TailwindCSS：

```tsx
<div className="p-8 text-center rounded-lg bg-card">
  <div className="text-4xl mb-4">{icon}</div>
  <h3 className="text-xl font-semibold">{title}</h3>
  <p className="text-gray-600">{description}</p>
</div>
```

## 🔌 交互式组件

### 带状态的组件

```tsx
// src/components/InteractiveDemo/index.tsx
import { useState } from 'react';

export default function InteractiveDemo() {
  const [count, setCount] = useState(0);

  return (
    <div className="demo-container">
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### 数据获取组件

```tsx
// src/components/UserList/index.tsx
import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## 📊 图表组件

### 使用 Recharts

```tsx
// src/components/Chart/index.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

interface DataPoint {
  name: string;
  value: number;
}

interface ChartProps {
  data: DataPoint[];
}

export default function Chart({ data }: ChartProps) {
  return (
    <LineChart width={600} height={300} data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#8884d8" />
    </LineChart>
  );
}
```

## 🎭 主题感知组件

```tsx
// src/components/ThemeAwareBox/index.tsx
import { useColorMode } from '@docusaurus/theme-common';
import clsx from 'clsx';

export default function ThemeAwareBox({ children }) {
  const { colorMode } = useColorMode();

  return (
    <div
      className={clsx(
        'p-4 rounded-lg',
        colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
      )}
    >
      {children}
    </div>
  );
}
```

## ⚡ 性能优化

### 懒加载组件

```tsx
// src/components/HeavyComponent/index.tsx
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));

export default function LazyChart(props) {
  return (
    <Suspense fallback={<div>Loading chart...</div>}>
      <HeavyChart {...props} />
    </Suspense>
  );
}
```

### Memo 优化

```tsx
import { memo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  // 昂贵的渲染逻辑
  return <div>{/* ... */}</div>;
});
```

## 🧪 测试组件

```tsx
// src/components/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './index';

test('button click calls onClick', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

## 📚 最佳实践

1. **组件职责单一** - 每个组件只做一件事
2. **Props 类型明确** - 使用 TypeScript 定义 Props 接口
3. **样式隔离** - 使用 CSS Modules 或 styled-components
4. **可访问性** - 添加适当的 ARIA 属性
5. **响应式** - 确保在不同屏幕尺寸下正常工作

## 📖 参考

- [Docusaurus 组件文档](https://docusaurus.io/docs/markdown-features/react)
- [React 组件模式](https://react.dev/learn/passing-props-to-a-component)
