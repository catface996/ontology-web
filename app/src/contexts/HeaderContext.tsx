import { createContext, useContext, useState, useRef, useMemo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface HeaderContextValue {
  breadcrumbs: ReactNode;
  actions: ReactNode;
  setBreadcrumbs: (node: ReactNode) => void;
  setActions: (node: ReactNode) => void;
}

const HeaderContext = createContext<HeaderContextValue | null>(null);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<ReactNode>(null);
  const [actions, setActions] = useState<ReactNode>(null);
  const location = useLocation();
  const prevPathname = useRef(location.pathname);

  // Reset header content synchronously during render on route change
  // This avoids the useEffect ordering issue where parent effects run after child effects
  if (location.pathname !== prevPathname.current) {
    prevPathname.current = location.pathname;
    setBreadcrumbs(null);
    setActions(null);
  }

  const value = useMemo(
    () => ({ breadcrumbs, actions, setBreadcrumbs, setActions }),
    [breadcrumbs, actions, setBreadcrumbs, setActions],
  );

  return (
    <HeaderContext.Provider value={value}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const ctx = useContext(HeaderContext);
  if (!ctx) throw new Error('useHeader must be used within HeaderProvider');
  return ctx;
}
