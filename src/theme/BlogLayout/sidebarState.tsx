import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from 'react';

type ArticleSidebarState = {
  collapsed: boolean;
  toggleSidebar: () => void;
};

const ArticleSidebarStateContext = createContext<ArticleSidebarState | null>(
  null,
);

export function ArticleSidebarStateProvider({
  children,
}: PropsWithChildren): ReactNode {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = useCallback(() => {
    setCollapsed((value) => !value);
  }, []);
  const value = useMemo(
    () => ({ collapsed, toggleSidebar }),
    [collapsed, toggleSidebar],
  );

  return (
    <ArticleSidebarStateContext.Provider value={value}>
      {children}
    </ArticleSidebarStateContext.Provider>
  );
}

export function useArticleSidebarState(): ArticleSidebarState {
  const value = useContext(ArticleSidebarStateContext);

  if (!value) {
    throw new Error(
      'useArticleSidebarState must be used inside ArticleSidebarStateProvider',
    );
  }

  return value;
}
