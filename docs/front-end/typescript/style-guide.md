---
sidebar_position: 3
title: TypeScript 代码规范
description: TypeScript 类型定义和编码规范
---

# TypeScript 代码规范

## 📝 基础类型

### 基础类型定义

```tsx
// ✅ 推荐：使用字面量类型
type Status = 'pending' | 'success' | 'error';
type Theme = 'light' | 'dark';

// ✅ 推荐：使用接口定义对象
interface User {
  id: string;
  name: string;
  email?: string; // 可选属性
}

// ✅ 推荐：使用类型别名定义联合类型
type ID = string | number;
type Callback = (data: User) => void;
```

### 避免 any

```tsx
// ❌ 避免：使用 any
function fetchData(): any {
  return {};
}

// ✅ 推荐：使用 unknown 或具体类型
function fetchData(): unknown {
  return {};
}

function processUser(user: User): void {
  // 具体类型
}
```

## 🎯 组件 Props

### 函数组件 Props

```tsx
// ✅ 推荐：使用 interface 或 type
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  disabled = false,
  children 
}) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children || label}
    </button>
  );
};

// ✅ 或者使用泛型参数
const Button = ({ label, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{label}</button>;
};
```

### 事件类型

```tsx
// ✅ 推荐：使用 React 事件类型
interface InputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
```

## 🔧 Hooks 类型

### useState

```tsx
// ✅ 类型推断（简单类型）
const [count, setCount] = useState(0); // number
const [name, setName] = useState(''); // string

// ✅ 显式类型（复杂类型或 null）
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<User[]>([]);

// ✅ 使用泛型
const [data, setData] = useState<Record<string, unknown>>({});
```

### useEffect / useCallback / useMemo

```tsx
// ✅ 依赖数组类型自动推断
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ✅ 回调函数类型
const handleClick = useCallback((id: string) => {
  console.log(id);
}, []);

// ✅ 计算值类型
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price, 0);
}, [items]);
```

### 自定义 Hooks

```tsx
// ✅ 返回类型推断
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  
  return { count, increment, decrement };
}

// ✅ 显式返回类型（复杂情况）
interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
}

function useCounter(initialValue = 0): UseCounterReturn {
  // ...
}
```

## 📦 模块导出

### 统一导出

```tsx
// components/Button/index.ts
export { default } from './Button';
export type { ButtonProps } from './Button';

// components/index.ts
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Modal } from './Modal';
```

### 类型导出

```tsx
// ✅ 推荐：使用 export type
export type { User, UserProps } from './types';
export type { ButtonProps } from './Button';

// ❌ 避免：运行时导出仅用于类型的对象
export { User } from './types'; // 如果 User 只是类型
```

## 🎨 泛型使用

### 泛型组件

```tsx
// ✅ 泛型列表组件
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// 使用
<List
  items={users}
  renderItem={(user) => <span>{user.name}</span>}
  keyExtractor={(user) => user.id}
/>
```

### 泛型 Hooks

```tsx
// ✅ 泛型数据获取 Hook
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}

// 使用
const { data: user } = useFetch<User>('/api/user/1');
```

## 🛡️ 类型守卫

```tsx
// ✅ 类型守卫函数
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  );
}

// 使用
if (isUser(data)) {
  console.log(data.name); // 类型为 User
}
```

## 📋 工具类型

### 常用工具类型

```tsx
// Partial - 所有属性可选
type PartialUser = Partial<User>;

// Required - 所有属性必填
type RequiredUser = Required<User>;

// Pick - 选择部分属性
type UserName = Pick<User, 'name'>;

// Omit - 排除部分属性
type UserWithoutId = Omit<User, 'id'>;

// Record - 键值对类型
type UserMap = Record<string, User>;

// ReturnType - 函数返回类型
type CounterReturn = ReturnType<typeof useCounter>;

// Parameters - 函数参数类型
type ClickHandler = Parameters<React.MouseEventHandler>[0];
```

### 自定义工具类型

```tsx
// 可空类型
type Nullable<T> = T | null;

// 只读类型
type ReadonlyUser = Readonly<User>;

// 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object 
    ? DeepReadonly<T[P]> 
    : T[P];
};
```

## ⚠️ 常见陷阱

### 1. 类型断言滥用

```tsx
// ❌ 避免：过度使用 as
const element = document.getElementById('app') as HTMLDivElement;

// ✅ 推荐：类型守卫或可选链
const element = document.getElementById('app');
if (element) {
  // element 类型为 HTMLElement
}

element?.classList.add('active');
```

### 2. 索引签名

```tsx
// ❌ 避免：过于宽松的索引签名
interface Loose {
  [key: string]: any;
}

// ✅ 推荐：严格的索引签名
interface Strict {
  [key: string]: string | number;
}
```

### 3. 枚举 vs 联合类型

```tsx
// ✅ 推荐：使用联合类型
type Status = 'pending' | 'success' | 'error';

// ❌ 避免：不必要的枚举
enum Status {
  Pending = 'pending',
  Success = 'success',
  Error = 'error',
}
```

## 📚 参考

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app)
- [TypeScript 工具类型](https://www.typescriptlang.org/docs/handbook/utility-types.html)
