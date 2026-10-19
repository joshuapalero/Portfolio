import { useEffect } from 'react';
import { createRootRouteWithContext, Outlet, Link } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { RightNavigation } from '../all/navigation';

interface RouterContext {
  queryClient: QueryClient;
}

function RootNotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>404 - Page Not Found</h1>
      <p style={{ color: 'var(--text-secondary, #666)', marginBottom: '1.5rem' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1.25rem',
          borderRadius: '5px',
          background: 'var(--accent, #2563eb)',
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 500,
        }}
      >
        Return to Home
      </Link>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: RootNotFound,
});

function RootLayout() {
  const navigate = Route.useNavigate();

  // Backward compatibility: gracefully migrate any legacy hash links (e.g., #experience, #post/123) to real routes
  useEffect(() => {
    const handleHashSync = () => {
      const currentHash = window.location.hash;
      if (!currentHash || currentHash === '#chat' || currentHash === '#community-chat') return;

      if (currentHash.startsWith('#post/')) {
        const slug = currentHash.replace('#post/', '');
        if (slug) {
          navigate({ to: '/blog/$slug', params: { slug }, replace: true });
        }
      } else if (currentHash === '#all-posts' || currentHash === '#blog') {
        navigate({ to: '/blog', replace: true });
      } else if (currentHash === '#experience' || currentHash === '#experience-history') {
        navigate({ to: '/experience', replace: true });
      } else if (currentHash === '#tech-stack' || currentHash === '#tech' || currentHash === '#stack' || currentHash === '#technology-stack') {
        navigate({ to: '/tech-stack', replace: true });
      } else if (currentHash === '#projects' || currentHash === '#all-projects' || currentHash === '#project') {
        navigate({ to: '/projects', replace: true });
      } else if (currentHash === '#certifications' || currentHash === '#certification') {
        navigate({ to: '/certifications', replace: true });
      } else if (currentHash === '#recommendations' || currentHash === '#recommendation') {
        navigate({ to: '/recommendations', replace: true });
      } else if (currentHash === '#gallery' || currentHash === '#all-gallery' || currentHash === '#photos' || currentHash === '#gallery-history') {
        navigate({ to: '/gallery', replace: true });
      } else if (currentHash === '#resources' || currentHash === '#all-resources' || currentHash === '#developer-resources') {
        navigate({ to: '/resources', replace: true });
      } else if (
        currentHash === '#practice-activity' ||
        currentHash === '#github-activity' ||
        currentHash === '#activity' ||
        currentHash === '#git'
      ) {
        navigate({ to: '/practice-activity', replace: true });
      } else if (currentHash === '#resume' || currentHash === '#cv') {
        navigate({ to: '/resume', replace: true });
      }
    };

    handleHashSync();
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, [navigate]);

  return (
    <div className="container">
      <Outlet />
      <RightNavigation />
    </div>
  );
}
