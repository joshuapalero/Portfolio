import { useEffect } from 'react';
import { SITE_CONFIG, ROUTE_SEO, type RouteMeta } from './seoConfig';

interface CustomSeoOptions {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
}

function upsertMeta(attrName: 'name' | 'property', attrValue: string, content: string): void {
  if (typeof document === 'undefined') return;
  let element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonical(url: string): void {
  if (typeof document === 'undefined') return;
  let element = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', url);
}

/**
 * React 19 / SEO Compliant Document Head Hook.
 *
 * Ensures all technical SEO elements (<title>, <meta description>, <link canonical>,
 * Open Graph, Twitter cards) are synchronized reactively upon route transitions,
 * providing accurate metadata for search indexing bots and social crawlers.
 */
export function useSeoHead(routeKeyOrCustom: keyof typeof ROUTE_SEO | CustomSeoOptions): void {
  const meta: RouteMeta & { image?: string; type?: string } = (() => {
    if (typeof routeKeyOrCustom === 'string') {
      const predefined = ROUTE_SEO[routeKeyOrCustom];
      if (predefined) {
        return { ...predefined };
      }
    }
    const custom = (typeof routeKeyOrCustom === 'object' ? routeKeyOrCustom : {}) as CustomSeoOptions;
    return {
      title: custom.title || SITE_CONFIG.title,
      description: custom.description || SITE_CONFIG.defaultDescription,
      path: custom.path || '/',
      image: custom.image || SITE_CONFIG.image,
      type: custom.type || 'website',
    };
  })();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Update Title
    if (document.title !== meta.title) {
      document.title = meta.title;
    }

    // 2. Update Meta Description
    upsertMeta('name', 'description', meta.description);

    // 3. Update Canonical Link
    const fullCanonicalUrl = `${SITE_CONFIG.baseUrl}${meta.path === '/' ? '' : meta.path}`;
    upsertCanonical(fullCanonicalUrl);

    // 4. Update OpenGraph Tags
    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:url', fullCanonicalUrl);
    upsertMeta('property', 'og:site_name', SITE_CONFIG.name);
    upsertMeta('property', 'og:type', meta.type || 'website');
    upsertMeta('property', 'og:image', `${SITE_CONFIG.baseUrl}${meta.image || SITE_CONFIG.image}`);

    // 5. Update Twitter Tags
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', meta.title);
    upsertMeta('name', 'twitter:description', meta.description);
    upsertMeta('name', 'twitter:image', `${SITE_CONFIG.baseUrl}${meta.image || SITE_CONFIG.image}`);
  }, [meta.title, meta.description, meta.path, meta.image, meta.type]);
}
