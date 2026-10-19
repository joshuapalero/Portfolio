import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { ThemeContext, Theme, type ThemeType, type ResolvedThemeType } from './ThemeContext';

export interface ThemeProviderProps {
  children: ReactNode;
}

function getSystemPreference(): ResolvedThemeType {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    if (typeof window === 'undefined') return Theme.SYSTEM;
    const saved = window.localStorage.getItem('theme') as ThemeType | null;
    if (saved === Theme.DARK || saved === Theme.LIGHT || saved === Theme.SYSTEM) {
      return saved;
    }
    return Theme.SYSTEM;
  });

  const [systemTheme, setSystemTheme] = useState<ResolvedThemeType>(getSystemPreference);

  // Dynamic system color scheme listener for live OS updates
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const resolvedTheme: ResolvedThemeType = theme === Theme.SYSTEM ? systemTheme : theme;
  const isDark = resolvedTheme === Theme.DARK;

  useEffect(() => {
    document.body.classList.toggle('theme-dark', isDark);
    document.body.classList.toggle('theme-light', !isDark);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', theme);
    }
  }, [theme, isDark]);

  const applyThemeWithAnimation = useCallback(
    (newTheme: ThemeType, event?: React.MouseEvent | MouseEvent) => {
      if (newTheme === theme) return;

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // 1. Native View Transitions API with circular ripple animation
      if (
        typeof document !== 'undefined' &&
        'startViewTransition' in document &&
        !prefersReducedMotion
      ) {
        const x = event?.clientX ?? window.innerWidth - 60;
        const y = event?.clientY ?? 30;

        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        );

        const transition = document.startViewTransition(() => {
          flushSync(() => {
            setThemeState(newTheme);
            const nextResolved: ResolvedThemeType =
              newTheme === Theme.SYSTEM ? systemTheme : newTheme;
            const nextDark = nextResolved === Theme.DARK;
            document.body.classList.toggle('theme-dark', nextDark);
            document.body.classList.toggle('theme-light', !nextDark);
          });
        });

        transition.ready.then(() => {
          const clipPath = [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ];

          document.documentElement.animate(
            {
              clipPath,
            },
            {
              duration: 520,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              pseudoElement: '::view-transition-new(root)',
            },
          );
        });
        return;
      }

      // 2. Fallback: Smooth CSS transition for browsers without View Transitions API
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('theme-transitioning');
      }

      setThemeState(newTheme);

      setTimeout(() => {
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('theme-transitioning');
        }
      }, 450);
    },
    [theme, systemTheme],
  );

  const setTheme = useCallback(
    (newTheme: ThemeType, event?: React.MouseEvent | MouseEvent) => {
      applyThemeWithAnimation(newTheme, event);
    },
    [applyThemeWithAnimation],
  );

  const toggleTheme = useCallback(
    (event?: React.MouseEvent | MouseEvent) => {
      const nextTheme =
        theme === Theme.LIGHT ? Theme.DARK : theme === Theme.DARK ? Theme.SYSTEM : Theme.LIGHT;
      applyThemeWithAnimation(nextTheme, event);
    },
    [theme, applyThemeWithAnimation],
  );

  return (
    <ThemeContext value={{ theme, resolvedTheme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext>
  );
}
