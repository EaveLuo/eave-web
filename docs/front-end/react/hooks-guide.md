---
sidebar_position: 2
title: React Hooks 完全指南
description: 深入理解 React Hooks 的使用场景和最佳实践
---

# React Hooks 完全指南

## 📚 内置 Hooks

### useState

管理组件状态。

```tsx
const [state, setState] = useState(initialValue);
```

**使用场景：**
- 表单输入
- 计数器
- 切换状态（显示/隐藏）
- 列表数据

**示例：**

```tsx
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

### useEffect

处理副作用。

```tsx
useEffect(() => {
  // 副作用逻辑
  return () => {
    // 清理逻辑
  };
}, [dependencies]);
```

**依赖数组规则：**
- `[]` - 仅在挂载时执行
- `[dep]` - 当 dep 变化时执行
- 不传 - 每次渲染都执行

**示例：**

```tsx
// 数据获取
useEffect(() => {
  let cancelled = false;
  
  fetch('/api/data')
    .then(res => res.json())
    .then(data => {
      if (!cancelled) setData(data);
    });
    
  return () => { cancelled = true; };
}, []);

// 订阅事件
useEffect(() => {
  const handler = (e) => console.log(e);
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
```

### useContext

跨组件共享数据。

```tsx
const value = useContext(MyContext);
```

**示例：**

```tsx
// 创建 Context
const ThemeContext = createContext('light');

// 提供者
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// 消费者
function Toolbar() {
  const theme = useContext(ThemeContext);
  return <div className={theme}>...</div>;
}
```

### useReducer

复杂状态管理。

```tsx
const [state, dispatch] = useReducer(reducer, initialState);
```

**示例：**

```tsx
const reducer = (state, action) => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
};

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
    </>
  );
}
```

### useCallback

缓存函数引用。

```tsx
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

**使用场景：**
- 传递给 `React.memo` 组件的回调
- 作为 `useEffect` 的依赖

### useMemo

缓存计算结果。

```tsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

**使用场景：**
- 昂贵的计算
- 避免对象/数组引用变化导致子组件重渲染

### useRef

访问 DOM 或保存可变值。

```tsx
const ref = useRef(initialValue);
```

**使用场景：**
- 访问 DOM 元素
- 保存不触发重渲染的值
- 保存定时器 ID

**示例：**

```tsx
// 聚焦输入框
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => {
  inputRef.current?.focus();
}, []);

<input ref={inputRef} />

// 保存定时器
const timerRef = useRef<number>();
useEffect(() => {
  timerRef.current = setInterval(tick, 1000);
  return () => clearInterval(timerRef.current);
}, []);
```

## 🎯 自定义 Hooks

创建可复用的逻辑。

### useFetch

```tsx
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    
    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') setError(err);
      })
      .finally(() => setLoading(false));
      
    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}
```

### useLocalStorage

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
```

### useDebounce

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

## ⚠️ 常见陷阱

### 1.  stale closure

```tsx
// ❌ 错误：闭包捕获旧值
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const id = setInterval(() => {
      console.log(count); // 始终是 0
    }, 1000);
    return () => clearInterval(id);
  }, []);
}

// ✅ 正确：使用函数式更新或添加依赖
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1); // 使用函数式更新
    }, 1000);
    return () => clearInterval(id);
  }, []);
}
```

### 2. 无限循环

```tsx
// ❌ 错误：对象引用变化
function Component({ userId }) {
  const [options, setOptions] = useState({});
  
  useEffect(() => {
    fetchData(userId, options);
  }, [userId, options]); // options 每次都是新引用
}

// ✅ 正确：使用 useMemo 或拆分状态
function Component({ userId }) {
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  
  useEffect(() => {
    fetchData(userId, { optionA, optionB });
  }, [userId, optionA, optionB]);
}
```

### 3. 条件调用 Hooks

```tsx
// ❌ 错误：条件调用
if (condition) {
  useEffect(() => {});
}

// ✅ 正确：始终调用，内部处理条件
useEffect(() => {
  if (!condition) return;
  // 逻辑
}, [condition]);
```

## 📖 参考

- [React Hooks 官方文档](https://react.dev/reference/react)
- [Hooks 规则](https://react.dev/warnings/invalid-hook-call-warning)
