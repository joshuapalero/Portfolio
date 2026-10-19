import { createFileRoute } from '@tanstack/react-router';
import { TechStackHistory } from '../all/tech_stack';
import { useSeoHead } from '../all/seo';
import WorldMapAscii from '../components/registry/world-map-ascii/world-map-ascii';
import { useTheme } from '../all/theme/useTheme';
import { useState, useEffect } from 'react';

import { TechStackHistorySkeleton, techStackQueryOptions } from '../all/tech_stack';

export const Route = createFileRoute('/tech-stack')({
  loader: ({ context: { queryClient } }) => {
    const username = import.meta.env.VITE_GITHUB_USERNAME || 'joshuapalero';
    return queryClient.query({
      ...techStackQueryOptions({ username }),
      staleTime: 'static',
    });
  },
  pendingComponent: () => <div style={{ position: 'relative', zIndex: 1 }}><TechStackHistorySkeleton /></div>,
  component: TechStackPage,
});

function TechStackPage() {
  const navigate = Route.useNavigate();
  const username = import.meta.env.VITE_GITHUB_USERNAME || 'joshuapalero';
  const { resolvedTheme } = useTheme();
  
  const [reduceMotion, setReduceMotion] = useState(() => 
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useSeoHead('techStack');

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      <div style={{ 
        position: 'fixed', 
        top: '120px', 
        left: '50%', 
        transform: 'translateX(-60%)',
        width: '100%', 
        maxWidth: '1150px', 
        aspectRatio: '2 / 1', 
        zIndex: 0, 
        opacity: 0.6 
      }}>
        <WorldMapAscii
          color={resolvedTheme === 'dark' ? '#ffffff' : '#000000'}
          particleSize={1}
          density={8}
          mouseRadius={20}
          drift={0.06}
          paused={reduceMotion}
        />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <TechStackHistory
          username={username}
          onBack={() => navigate({ to: '/' })}
        />
      </div>
    </div>
  );
}
