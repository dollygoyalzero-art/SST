import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

export interface UseThemeProps {
  /** List of all available theme names */
  themes: string[];
  /** Forced theme name for the current page */
  forcedTheme?: string;
  /** Update the theme */
  setTheme: (theme: string | ((prevTheme: string) => string)) => void;
  /** Active theme name */
  theme?: string;
  /** If enableSystem is true and the active theme is "system", this returns whether the system preference resolved to "dark" or "light". Otherwise, returns the active theme */
  resolvedTheme?: string;
  /** If enableSystem is true, returns the system theme preference ("dark" or "light") */
  systemTheme?: 'dark' | 'light';
}

export interface ThemeProviderProps {
  children?: React.ReactNode;
  /** HTML attribute modified based on the active theme. Defaults to 'data-theme' or 'class' */
  attribute?: string | 'class' | 'data-theme';
  /** Default theme name. Defaults to 'system' */
  defaultTheme?: string;
  /** Whether to switch between dark and light themes based on prefers-color-scheme */
  enableSystem?: boolean;
  /** Key used to store theme setting in localStorage */
  storageKey?: string;
  /** List of all available theme names */
  themes?: string[];
  /** Forced theme name for the current page */
  forcedTheme?: string;
  /** Disable all CSS transitions when switching themes */
  disableTransitionOnChange?: boolean;
  /** Value mapping between theme and attribute value */
  value?: Record<string, string>;
  /** Nonce string */
  nonce?: string;
}

const ThemeContext = createContext<UseThemeProps | undefined>(undefined);

const MEDIA = '(prefers-color-scheme: dark)';

const getSystemTheme = (e?: MediaQueryList | MediaQueryListEvent): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'light';
  const mql = e || window.matchMedia(MEDIA);
  return mql.matches ? 'dark' : 'light';
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  attribute = 'class',
  defaultTheme = 'system',
  enableSystem = true,
  storageKey = 'theme',
  themes = ['light', 'dark', 'system'],
  forcedTheme,
  disableTransitionOnChange = false,
  value
}) => {
  const [theme, setThemeState] = useState<string>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    try {
      return localStorage.getItem(storageKey) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(() => getSystemTheme());

  const resolvedTheme = useMemo(() => {
    if (forcedTheme) return forcedTheme;
    if (theme === 'system' && enableSystem) return systemTheme;
    return theme;
  }, [forcedTheme, theme, enableSystem, systemTheme]);

  // Apply theme to DOM without rendering any script tags (React 19 safe)
  const applyTheme = useCallback((targetTheme: string) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const isDark = targetTheme === 'dark';

    // Disable transitions momentarily if requested
    let cleanupTransitions: (() => void) | null = null;
    if (disableTransitionOnChange) {
      const css = document.createElement('style');
      css.appendChild(
        document.createTextNode(
          '*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}'
        )
      );
      document.head.appendChild(css);
      cleanupTransitions = () => {
        window.getComputedStyle(document.body);
        setTimeout(() => {
          if (document.head.contains(css)) document.head.removeChild(css);
        }, 1);
      };
    }

    if (attribute === 'class') {
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    } else {
      const attrVal = value && value[targetTheme] ? value[targetTheme] : targetTheme;
      root.setAttribute(attribute, attrVal);
    }

    if (cleanupTransitions) cleanupTransitions();
  }, [attribute, disableTransitionOnChange, value]);

  // Apply theme on resolvedTheme changes
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme, applyTheme]);

  // Listen to system preference changes
  useEffect(() => {
    if (!enableSystem || typeof window === 'undefined') return;

    const mql = window.matchMedia(MEDIA);
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [enableSystem]);

  // Sync across tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey) {
        setThemeState(e.newValue || defaultTheme);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [storageKey, defaultTheme]);

  const setTheme = useCallback((newTheme: string | ((prevTheme: string) => string)) => {
    setThemeState(prev => {
      const next = typeof newTheme === 'function' ? newTheme(prev) : newTheme;
      try {
        localStorage.setItem(storageKey, next);
      } catch (err) {
        console.error('Failed to save theme in localStorage', err);
      }
      return next;
    });
  }, [storageKey]);

  const contextValue = useMemo<UseThemeProps>(() => ({
    theme,
    setTheme,
    forcedTheme,
    resolvedTheme,
    themes,
    systemTheme: enableSystem ? systemTheme : undefined
  }), [theme, setTheme, forcedTheme, resolvedTheme, themes, enableSystem, systemTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): UseThemeProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      themes: ['light', 'dark', 'system'],
      setTheme: () => {},
      theme: 'light',
      resolvedTheme: 'light',
      systemTheme: 'light'
    };
  }
  return context;
};
