/**
 * Comprehensive SEO, OpenGraph, and Schema.org Metadata Configuration
 *
 * Centralizes technical SEO metadata and Schema.org Knowledge Graph generator
 * to power Google Sitelinks, social cards, and LLM search discoverability.
 */

export interface RouteMeta {
  readonly title: string;
  readonly description: string;
  readonly path: string;
}

export const SITE_CONFIG = {
  name: 'Joshua Pasacay Palero',
  shortName: 'Joshua Palero',
  title: 'Joshua Pasacay Palero — Software Engineer',
  jobTitle: 'Software Engineer & Full-Stack Developer',
  tagline: 'Full-stack software engineer building resilient web apps, cloud systems, and generative AI products.',
  defaultDescription:
    "I'm Joshua Pasacay Palero — a full-stack software engineer in Metro Manila, Philippines. I build modern web apps, scalable backend services, and interactive digital products.",
  baseUrl:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL
      ? (import.meta.env.VITE_SITE_URL as string).replace(/\/+$/, '')
      : 'https://joshuapalero.com'),
  image: '/profile.png',
  locale: 'en_PH',
  social: {
    github: 'https://github.com/joshuapalero',
    linkedin: 'https://linkedin.com/in/joshuapalero',
    facebook: 'https://facebook.com/joshuapalero',
    instagram: 'https://instagram.com/joshuapalero',
  },
  knowsAbout: [
    'Software Engineering',
    'Web Development',
    'React',
    'TypeScript',
    'Full-Stack Architecture',
    'Distributed Systems',
    'Cloudflare Workers',
    'Generative AI',
  ],
} as const;

export const ROUTE_SEO: Record<string, RouteMeta> = {
  home: {
    path: '/',
    title: 'Joshua Pasacay Palero — Software Engineer',
    description:
      "I'm Joshua Pasacay Palero — a full-stack software engineer in Metro Manila. I build modern web apps, cloud services, and interactive digital products.",
  },
  projects: {
    path: '/projects',
    title: 'Projects — Joshua Pasacay Palero',
    description:
      'Products, open-source software, and engineering systems Joshua Pasacay Palero has designed and built.',
  },
  experience: {
    path: '/experience',
    title: 'Experience — Joshua Pasacay Palero',
    description:
      "Joshua Pasacay Palero's full professional career experience, engineering roles, and track record across software and AI.",
  },
  certifications: {
    path: '/certifications',
    title: 'Certifications — Joshua Pasacay Palero',
    description:
      'Professional certifications, engineering licenses, and technical credentials earned by Joshua Pasacay Palero.',
  },
  recommendations: {
    path: '/recommendations',
    title: 'Recommendations — Joshua Pasacay Palero',
    description:
      'Peer endorsements, mentor testimonials, and professional recommendations for Joshua Pasacay Palero.',
  },
  blog: {
    path: '/blog',
    title: 'Blog & Writing — Joshua Pasacay Palero',
    description:
      'Engineering notes, architecture deep-dives, and technical updates written by Joshua Pasacay Palero.',
  },
  resources: {
    path: '/resources',
    title: 'Resources Directory — Joshua Pasacay Palero',
    description:
      'Curated developer resources, learning tracks, and full-stack roadmaps created and compiled by Joshua Pasacay Palero.',
  },
  resume: {
    path: '/resume',
    title: 'Resume & Curriculum Vitae — Joshua Pasacay Palero',
    description:
      'Official Curriculum Vitae, skill proficiencies, and downloadable PDF resume of Joshua Pasacay Palero.',
  },
  techStack: {
    path: '/tech-stack',
    title: 'Technology Stack — Joshua Pasacay Palero',
    description:
      'Programming languages, frameworks, developer tooling, and cloud infrastructure mastered by Joshua Pasacay Palero.',
  },
  gallery: {
    path: '/gallery',
    title: 'Photo Gallery & Moments — Joshua Pasacay Palero',
    description:
      'Photos, community events, moments, and life updates from Joshua Pasacay Palero.',
  },
  practiceActivity: {
    path: '/practice-activity',
    title: 'Practice Activity & Git Guides — Joshua Pasacay Palero',
    description:
      'Interactive GitHub practice activities, command-line walkthroughs, and developer exercises.',
  },
};

/**
 * Builds the Schema.org JSON-LD Knowledge Graph
 * Includes Person, WebSite, ProfilePage, and SiteNavigationElement
 * (specifically used by Googlebot to populate sitelinks in search results).
 */
export function buildSchemaGraph(baseUrl = SITE_CONFIG.baseUrl) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${baseUrl}#person`,
        name: SITE_CONFIG.name,
        alternateName: SITE_CONFIG.shortName,
        url: baseUrl,
        image: `${baseUrl}${SITE_CONFIG.image}`,
        jobTitle: SITE_CONFIG.jobTitle,
        description: SITE_CONFIG.tagline,
        sameAs: [
          SITE_CONFIG.social.github,
          SITE_CONFIG.social.linkedin,
          SITE_CONFIG.social.facebook,
          SITE_CONFIG.social.instagram,
        ],
        knowsAbout: [...SITE_CONFIG.knowsAbout],
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}#website`,
        name: SITE_CONFIG.name,
        url: baseUrl,
        description: SITE_CONFIG.defaultDescription,
        inLanguage: 'en-PH',
        publisher: { '@id': `${baseUrl}#person` },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${baseUrl}#profile`,
        url: baseUrl,
        name: SITE_CONFIG.title,
        isPartOf: { '@id': `${baseUrl}#website` },
        mainEntity: { '@id': `${baseUrl}#person` },
      },
      {
        '@type': 'ItemList',
        '@id': `${baseUrl}#sitelinks`,
        name: 'Portfolio Core Navigation',
        description: 'Main sections of Joshua Pasacay Palero portfolio',
        itemListElement: [
          {
            '@type': 'SiteNavigationElement',
            position: 1,
            name: 'Projects',
            description: ROUTE_SEO.projects.description,
            url: `${baseUrl}${ROUTE_SEO.projects.path}`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 2,
            name: 'Experience',
            description: ROUTE_SEO.experience.description,
            url: `${baseUrl}${ROUTE_SEO.experience.path}`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 3,
            name: 'Certifications',
            description: ROUTE_SEO.certifications.description,
            url: `${baseUrl}${ROUTE_SEO.certifications.path}`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 4,
            name: 'Recommendations',
            description: ROUTE_SEO.recommendations.description,
            url: `${baseUrl}${ROUTE_SEO.recommendations.path}`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 5,
            name: 'Blog',
            description: ROUTE_SEO.blog.description,
            url: `${baseUrl}${ROUTE_SEO.blog.path}`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 6,
            name: 'Resources',
            description: ROUTE_SEO.resources.description,
            url: `${baseUrl}${ROUTE_SEO.resources.path}`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 7,
            name: 'Resume',
            description: ROUTE_SEO.resume.description,
            url: `${baseUrl}${ROUTE_SEO.resume.path}`,
          },
          {
            '@type': 'SiteNavigationElement',
            position: 8,
            name: 'Tech Stack',
            description: ROUTE_SEO.techStack.description,
            url: `${baseUrl}${ROUTE_SEO.techStack.path}`,
          },
        ],
      },
    ],
  };
}
