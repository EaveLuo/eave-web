---
sidebar_position: 1
title: React 最佳实践
description: React 开发中的最佳实践和代码规范
---

# React 最佳实践

本文档总结了在 React 开发中应该遵循的最佳实践，帮助编写更高质量、可维护的代码。

## 📦 组件结构

### 函数组件优先

```tsx
// ✅ 推荐：函数组件 + Hooks
const MyComponent: React.FC<Props> = ({ name }) => {
  return <div>Hello, {name}</div>;
};

// ❌ 避免：类组件（除非有特殊需求）
class MyComponent extends React.Component<Props> {
  render() {
    return <div>Hello, {this.props.name}</div>;
  }
}
```

### 组件文件组织

```
src/components/
├── Button/
│   ├── Button.tsx        # 组件实现
│   ├── Button.test.tsx   # 测试
│   ├── Button.stories.tsx # Storybook（如使用）
│   └── index.ts          # 导出
├── Layout/
│   └── ...
└── index.ts              # 统一导出
```

## ⚡ Hooks 最佳实践

### 1. useState

```tsx
// ✅ 推荐：使用函数式更新
const [count, setCount] = useState(0);
setCount(prev => prev + 1);

// ✅ 推荐：复杂状态使用 useReducer
const [state, dispatch] = useReducer(reducer, initialState);

// ❌ 避免：直接依赖当前状态
setCount(count + 1);
```

### 2. useEffect

```tsx
// ✅ 推荐：明确的依赖数组
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ✅ 推荐：清理副作用
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);

// ❌ 避免：缺少依赖或依赖过多
useEffect(() => {
  fetchData(); // 缺少依赖警告
});
```

### 3. useMemo & useCallback

```tsx
// ✅ 推荐：昂贵的计算使用 useMemo
const filteredList = useMemo(() => {
  return list.filter(item => item.active);
}, [list]);

// ✅ 推荐：传递给子组件的函数使用 useCallback
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ❌ 避免：过度优化
const value = useMemo(() => props.value, [props.value]); // 没必要
```

## 🎯 性能优化

### 1. React.memo

```tsx
// ✅ 推荐：纯展示组件使用 memo
const MyComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});

// ✅ 推荐：自定义比较函数
const MyComponent = React.memo(
  ({ data }) => <div>{data}</div>,
  (prev, next) => prev.data.id === next.data.id
);
```

### 2. 代码分割

```tsx
// ✅ 推荐：路由级别代码分割
const LazyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}
```

### 3. 列表渲染优化

```tsx
// ✅ 推荐：使用稳定的 key
{items.map(item => (
  <ListItem key={item.id} data={item} />
))}

// ❌ 避免：使用 index 作为 key（除非列表静态）
{items.map((item, index) => (
  <ListItem key={index} data={item} />
))}
```

## 🛡️ 错误处理

### 错误边界

```tsx
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <FallbackUI />;
    }
    return this.props.children;
  }
}
```

### 异步错误处理

```tsx
// ✅ 推荐：try-catch + 错误状态
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await api.get();
      setData(data);
    } catch (err) {
      setError(err as Error);
    }
  };
  fetchData();
}, []);
```

## 📝 代码规范

### TypeScript

```tsx
// ✅ 推荐：明确的类型定义
interface Props {
  name: string;
  age?: number;
  onClick: () => void;
}

// ✅ 推荐：使用类型推断（简单场景）
const [count, setCount] = useState(0); // 自动推断为 number

// ❌ 避免：any 类型
const data: any = fetchData();
```

### 命名规范

```tsx
// 组件：PascalCase
const UserProfile: React.FC = () => {};

// Hooks：use 前缀
const useUserData = (userId: string) => {};

// 事件处理：handle 前缀
const handleClick = () => {};

// 布尔值：is/has/can 前缀
const isLoading = true;
const hasError = false;
```

## 🔍 调试技巧

```tsx
// 使用 React DevTools
// 添加 displayName 便于调试
const MyComponent: React.FC = () => {};
MyComponent.displayName = 'MyComponent';

// 使用自定义 Hook 封装日志
const useDebugLog = (componentName: string, props: any) => {
  useEffect(() => {
    console.log(`${componentName} props:`, props);
  }, [props]);
};
```

## 📚 参考资源

- [React 官方文档](https://react.dev)
- [React Hooks 最佳实践](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [TypeScript + React](https://react-typescript-cheatsheet.netlify.app)
