import { useEffect } from 'react';

/**
 * React 19 / SEO Compliant Document Title Hook.
 * Ensures DOM mutations are performed purely within lifecycle effects,
 * satisfying React Compiler and ESLint react-hooks/immutability rules.
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    if (typeof document !== 'undefined' && document.title !== title) {
      document.title = title;
    }
  }, [title]);
}
