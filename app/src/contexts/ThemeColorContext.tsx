import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';

const STORAGE_KEY = 'theme-primary-color';
export const DEFAULT_COLOR = '#8b5cf6';

export const THEME_COLORS = [
  '#8b5cf6',
  '#722ED1',
  '#2F54EB',
  '#1677FF',
  '#13C2C2',
  '#52C41A',
  '#FAAD14',
  '#FA8C16',
  '#FA541C',
  '#F5222D',
  '#EB2F96',
];

interface ThemeColorContextValue {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
}

const ThemeColorContext = createContext<ThemeColorContextValue>({
  primaryColor: DEFAULT_COLOR,
  setPrimaryColor: () => {},
});

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '139, 92, 246';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

export function ThemeColorProvider({ children }: { children: ReactNode }) {
  const [primaryColor, setPrimaryColorState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || DEFAULT_COLOR,
  );

  const setPrimaryColor = useCallback((color: string) => {
    setPrimaryColorState(color);
    localStorage.setItem(STORAGE_KEY, color);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--primary-rgb', hexToRgb(primaryColor));
  }, [primaryColor]);

  const value = useMemo(() => ({ primaryColor, setPrimaryColor }), [primaryColor, setPrimaryColor]);

  return (
    <ThemeColorContext.Provider value={value}>
      {children}
    </ThemeColorContext.Provider>
  );
}

export function useThemeColor() {
  return useContext(ThemeColorContext);
}
