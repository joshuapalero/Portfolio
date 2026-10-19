import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { SITE_CONFIG, ROUTE_SEO, buildSchemaGraph, useSeoHead } from './index';

describe('SEO & Schema.org Configuration', () => {
  it('defines valid site metadata defaults', () => {
    expect(SITE_CONFIG.name).toBe('Joshua Pasacay Palero');
    expect(SITE_CONFIG.shortName).toBe('Joshua Palero');
    expect(SITE_CONFIG.jobTitle).toBeDefined();
    expect(SITE_CONFIG.baseUrl).toContain('http');
    expect(SITE_CONFIG.social.github).toContain('github.com');
    expect(SITE_CONFIG.social.linkedin).toContain('linkedin.com');
  });

  it('defines all primary sitelink routes with titles and descriptions', () => {
    const requiredRoutes = [
      'home',
      'projects',
      'experience',
      'certifications',
      'recommendations',
      'blog',
      'resources',
      'resume',
      'techStack',
    ];

    for (const key of requiredRoutes) {
      const meta = ROUTE_SEO[key];
      expect(meta).toBeDefined();
      expect(meta.title).toContain('Joshua');
      expect(meta.description.length).toBeGreaterThan(20);
      expect(meta.path.startsWith('/')).toBe(true);
    }
  });

  it('builds a Schema.org Knowledge Graph with Person, WebSite, ProfilePage, and Sitelinks', () => {
    const graph = buildSchemaGraph('https://joshuapalero.com');
    expect(graph['@context']).toBe('https://schema.org');

    const types = graph['@graph'].map((item: { '@type': string }) => item['@type']);
    expect(types).toContain('Person');
    expect(types).toContain('WebSite');
    expect(types).toContain('ProfilePage');
    expect(types).toContain('ItemList');

    const sitelinksList = graph['@graph'].find((item: { '@type': string }) => item['@type'] === 'ItemList') as {
      itemListElement: Array<{ '@type': string; name: string; url: string }>;
    };

    expect(sitelinksList).toBeDefined();
    expect(sitelinksList.itemListElement.length).toBe(8);

    const names = sitelinksList.itemListElement.map((nav) => nav.name);
    expect(names).toContain('Projects');
    expect(names).toContain('Experience');
    expect(names).toContain('Certifications');
    expect(names).toContain('Recommendations');
    expect(names).toContain('Blog');
    expect(names).toContain('Resources');
    expect(names).toContain('Resume');
    expect(names).toContain('Tech Stack');
  });

  describe('useSeoHead hook', () => {
    beforeEach(() => {
      document.title = '';
      document.head.querySelectorAll('meta, link[rel="canonical"]').forEach((el) => el.remove());
    });

    it('updates document.title, meta description, and canonical tag reactively', () => {
      renderHook(() => useSeoHead('projects'));

      expect(document.title).toBe(ROUTE_SEO.projects.title);

      const descMeta = document.head.querySelector('meta[name="description"]');
      expect(descMeta?.getAttribute('content')).toBe(ROUTE_SEO.projects.description);

      const canonicalLink = document.head.querySelector('link[rel="canonical"]');
      expect(canonicalLink?.getAttribute('href')).toContain('/projects');

      const ogTitle = document.head.querySelector('meta[property="og:title"]');
      expect(ogTitle?.getAttribute('content')).toBe(ROUTE_SEO.projects.title);
    });

    it('supports custom dynamic route overrides', () => {
      renderHook(() =>
        useSeoHead({
          title: 'Custom Article Title',
          description: 'Custom description for blog post.',
          path: '/blog/custom-slug',
          type: 'article',
        })
      );

      expect(document.title).toBe('Custom Article Title');

      const descMeta = document.head.querySelector('meta[name="description"]');
      expect(descMeta?.getAttribute('content')).toBe('Custom description for blog post.');

      const ogType = document.head.querySelector('meta[property="og:type"]');
      expect(ogType?.getAttribute('content')).toBe('article');

      const canonicalLink = document.head.querySelector('link[rel="canonical"]');
      expect(canonicalLink?.getAttribute('href')).toContain('/blog/custom-slug');
    });
  });
});
