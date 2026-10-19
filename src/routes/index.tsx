import { createFileRoute } from '@tanstack/react-router';
import ProfilePhoto, { ProfileHeader } from '../all/profile';
import Bio from '../all/bio/bio';
import GithubRepos from '../all/github_reps/github_repos';
import GithubProject from '../all/project';
import Blog from '../all/blog/blog';
import TechStack from '../all/tech_stack';
import Gallery from '../all/gallery';
import Experience from '../all/experience';
import Certification from '../all/certification';
import Resources from '../all/resources';
import { profileQueryOptions } from '../all/profile/queries';
import { bioQueryOptions } from '../all/bio/queries';
import { useFacebookPosts } from '../all/blog/queries';
import { facebookPostsQueryOptions } from '../all/blog/queries';
import { githubProjectsQueryOptions } from '../all/project/queries';
import { experienceQueryOptions } from '../all/experience/queries';
import { certificationQueryOptions } from '../all/certification/queries';
import { resourcesQueryOptions } from '../all/resources/queries';
import type { FacebookPost } from '../all/blog/types';
import { useSeoHead } from '../all/seo';

export const Route = createFileRoute('/')({
  loader: async ({ context: { queryClient } }) => {
    const username = import.meta.env.VITE_GITHUB_USERNAME || 'joshuapalero';
    const token = import.meta.env.VITE_GITHUB_TOKEN;

    // Parallel background prefetch of critical front-page feeds (TanStack Router & Query v5 pattern)
    await Promise.allSettled([
      queryClient.prefetchQuery(profileQueryOptions({ username, token })),
      queryClient.prefetchQuery(bioQueryOptions({ username, repo: 'About-me', token })),
      queryClient.prefetchQuery(facebookPostsQueryOptions),
      queryClient.prefetchQuery(githubProjectsQueryOptions({ username, token })),
      queryClient.prefetchQuery(experienceQueryOptions({ username, token })),
      queryClient.prefetchQuery(certificationQueryOptions({ username, token })),
      queryClient.prefetchQuery(resourcesQueryOptions({ username, token })),
    ]);
  },
  component: HomePage,
});

function HomePage() {
  const navigate = Route.useNavigate();

  useSeoHead('home');

  const {
    data: posts = [],
    isPending: postsPending,
    isFetching: postsFetching,
    isError: postsError,
    error: postsErrorObj,
    refetch: refetchPosts,
  } = useFacebookPosts();

  const username = import.meta.env.VITE_GITHUB_USERNAME || 'joshuapalero';
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  const goToAllPosts = () => navigate({ to: '/blog' });
  const goToPost = (post: FacebookPost) =>
    navigate({ to: '/blog/$slug', params: { slug: post.slug || post.id } });
  const goToProjects = () => navigate({ to: '/projects' });
  const goToExperience = () => navigate({ to: '/experience' });
  const goToCertifications = () => navigate({ to: '/certifications' });
  const goToTechStack = () => navigate({ to: '/tech-stack' });
  const goToResources = () => navigate({ to: '/resources' });
  const goToResourceTrack = (trackId: string) =>
    navigate({ to: '/resources/$slug', params: { slug: trackId } });
  const goToGallery = () => navigate({ to: '/gallery' });

  return (
    <>
      <section className="profile-section" aria-label="Profile">
        <div className="profile-top">
          <div className="image-section">
            <div className="image-wrapper profile-photo-wrapper">
              <ProfilePhoto
                username={username}
                token={token}
                alt="Joshua Pasacay Palero"
                gridSize={22}
                animationStepDuration={0.95}
              />
            </div>
          </div>

          <div className="card-info">
            <ProfileHeader username={username} token={token} />
            <Bio username={username} token={token ?? ''} repo="About-me" />
          </div>
        </div>

        <hr className="divider profile-divider" />
      </section>

      <div className="reveal" style={{ width: '100%' }}>
        <Blog
          posts={posts}
          isPending={postsPending}
          isFetching={postsFetching}
          isError={postsError}
          error={postsErrorObj}
          onRetry={refetchPosts}
          onViewAllPosts={goToAllPosts}
          onSelectPost={goToPost}
          allPostsUrl="/blog"
          sectionNumber="01"
          sectionTitle="Blog"
        />
      </div>

      <div className="reveal" style={{ width: '100%' }}>
        <GithubProject
          username={username}
          token={token ?? ''}
          sectionNumber="02"
          sectionTitle="Projects"
          onViewAllProjects={goToProjects}
        />
      </div>

      <div className="reveal" style={{ width: '100%' }}>
        <Experience
          username={username}
          token={token ?? ''}
          sectionNumber="03"
          sectionTitle="Experience"
          onViewHistory={goToExperience}
        />
      </div>

      <div className="reveal" style={{ width: '100%' }}>
        <Certification
          username={username}
          token={token ?? ''}
          sectionNumber="04"
          sectionTitle="Certifications"
          onViewAllCertifications={goToCertifications}
        />
      </div>

      <div className="reveal" style={{ width: '100%' }}>
        <GithubRepos
          username={username}
          token={token ?? ''}
          sectionNumber="05"
          sectionTitle="Contributions"
        />
      </div>

      <div className="reveal" style={{ width: '100%' }}>
        <TechStack
          username={username}
          sectionNumber="06"
          sectionTitle="Technology Stack"
          onViewAllTech={goToTechStack}
        />
      </div>

      <div className="reveal" style={{ width: '100%' }}>
        <Resources
          username={username}
          token={token ?? ''}
          sectionNumber="07"
          sectionTitle="Resources"
          onViewAllResources={goToResources}
          onSelectTrack={goToResourceTrack}
        />
      </div>

      <div className="reveal" style={{ width: '100%' }}>
        <Gallery
          sectionNumber="08"
          sectionTitle="Gallery"
          posts={posts}
          isPending={postsPending}
          isError={postsError}
          error={postsErrorObj}
          onRetry={refetchPosts}
          onViewAllGallery={goToGallery}
        />
      </div>
    </>
  );
}
