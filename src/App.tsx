import { useSyncExternalStore, useTransition, Suspense } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import ProfilePhoto, { ProfileHeader } from './all/profile';
import Bio from './all/bio/bio';
import GithubRepos from './all/github_reps/github_repos';
import GithubProject, { ProjectsHistory } from './all/project';
import Blog from './all/blog/blog';
import AllPosts from './all/blog/all_posts';
import PostDetail, { PostDetailSkeleton } from './all/blog/post_detail';
import TechStack, { TechStackHistory } from './all/tech_stack';
import Gallery, { GalleryHistory } from './all/gallery';
import Experience, { ExperienceHistory } from './all/experience';
import Certification, { CertificationHistory } from './all/certification';
import { RecommendationsHistory } from './all/recommendations';
import Resources, { ResourcesHistory, ResourcesSkeleton, ResourcesHistorySkeleton } from './all/resources';
import { RightNavigation } from './all/navigation';
import { useFacebookPosts } from './all/blog/queries';
import type { FacebookPost } from './all/blog/types';

// ── Hash routing store (useSyncExternalStore) ─────────────────────────────────
function subscribeToHash(callback: () => void): () => void {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

function getHash(): string {
  return window.location.hash;
}

function getServerHash(): string {
  return '';
}

function viewFromHash(hash: string): 'post' | 'all-posts' | 'experience' | 'tech-stack' | 'projects' | 'certifications' | 'recommendations' | 'gallery' | 'resources' | 'home' {
  if (hash.startsWith('#post/')) return 'post';
  if (hash === '#all-posts' || hash === '#blog') return 'all-posts';
  if (hash === '#experience' || hash === '#experience-history') return 'experience';
  if (hash === '#tech-stack' || hash === '#tech' || hash === '#stack' || hash === '#technology-stack') return 'tech-stack';
  if (hash === '#projects' || hash === '#all-projects' || hash === '#project') return 'projects';
  if (hash === '#certifications' || hash === '#certification') return 'certifications';
  if (hash === '#recommendations' || hash === '#recommendation') return 'recommendations';
  if (hash === '#gallery' || hash === '#all-gallery' || hash === '#photos' || hash === '#gallery-history') return 'gallery';
  if (hash === '#resources' || hash === '#all-resources' || hash === '#developer-resources') return 'resources';
  return 'home';
}



function slugFromHash(hash: string): string | null {
  if (hash.startsWith('#post/')) {
    return hash.replace('#post/', '');
  }
  return null;
}

export default function App() {
  const hash = useSyncExternalStore(subscribeToHash, getHash, getServerHash);
  const currentView = viewFromHash(hash);
  const currentSlug = slugFromHash(hash);
  const [, startTransition] = useTransition();

  // ── 100% Live Facebook Feed via React Query v5 ─────────────────────────────
  const {
    data: posts = [],
    isPending: postsPending,
    isFetching: postsFetching,
    isError: postsError,
    error: postsErrorObj,
    refetch: refetchPosts,
  } = useFacebookPosts();

  // ── Resolve active post for reader view from live query cache ──────────────
  const activePost = currentSlug
    ? posts.find((p) => p.slug === currentSlug || p.id === currentSlug) ?? null
    : null;

  // ── Coordinated View Transition (React 19 Concurrent Primitives) ───────────
  const navigateTo = (newHash: string) => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
        startTransition(() => {
          window.location.hash = newHash;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
    } else {
      startTransition(() => {
        window.location.hash = newHash;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  };

  const goToAllPosts = () => navigateTo('#all-posts');
  const goToExperience = () => navigateTo('#experience');
  const goToTechStack = () => navigateTo('#tech-stack');
  const goToProjects = () => navigateTo('#projects');
  const goToCertifications = () => navigateTo('#certifications');
  const goToGallery = () => navigateTo('#gallery');
  const goToResources = () => navigateTo('#resources');
  const goToPost = (post: FacebookPost) => navigateTo(`#post/${post.slug || post.id}`);
  const goToHome = () => navigateTo('');

  const username = import.meta.env.VITE_GITHUB_USERNAME || 'joshuapalero';
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  return (
    <div className="container">
        <RightNavigation />

        {currentView === 'post' ? (
          activePost ? (
            <PostDetail post={activePost} onBack={goToAllPosts} />
          ) : postsPending ? (
            <PostDetailSkeleton onBack={goToAllPosts} />
          ) : (
            <div className="post-not-found" role="alert">
              <AlertCircle size={28} />
              <h2>Post Not Found</h2>
              <p>This Facebook post might have been removed or the URL is invalid.</p>
              <button type="button" className="post-detail-back-btn" onClick={goToAllPosts}>
                <ArrowLeft size={16} />
                <span>Back to all posts</span>
              </button>
            </div>
          )
        ) : currentView === 'all-posts' ? (
          <AllPosts
            posts={posts}
            isPending={postsPending}
            isFetching={postsFetching}
            isError={postsError}
            error={postsErrorObj}
            onRetry={refetchPosts}
            onBack={goToHome}
            onSelectPost={goToPost}
          />
        ) : currentView === 'experience' ? (
          <ExperienceHistory
            username={username}
            token={token ?? ''}
            onBack={goToHome}
          />
        ) : currentView === 'tech-stack' ? (
          <TechStackHistory
            username={username}
            onBack={goToHome}
          />
        ) : currentView === 'projects' ? (
          <ProjectsHistory
            username={username}
            token={token ?? ''}
            onBack={goToHome}
          />
        ) : currentView === 'certifications' ? (
          <CertificationHistory
            username={username}
            token={token ?? ''}
            onBack={goToHome}
          />
        ) : currentView === 'recommendations' ? (
          <RecommendationsHistory
            onBack={goToHome}
          />
        ) : currentView === 'resources' ? (
          <Suspense fallback={<ResourcesHistorySkeleton />}>
            <ResourcesHistory
              username={username}
              token={token ?? ''}
              onBack={goToHome}
            />
          </Suspense>
        ) : currentView === 'gallery' ? (
          <GalleryHistory
            posts={posts}
            isPending={postsPending}
            isError={postsError}
            error={postsErrorObj}
            onRetry={refetchPosts}
            onBack={goToHome}
          />
        ) : (
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

            <Blog
              posts={posts}
              isPending={postsPending}
              isFetching={postsFetching}
              isError={postsError}
              error={postsErrorObj}
              onRetry={refetchPosts}
              onViewAllPosts={goToAllPosts}
              onSelectPost={goToPost}
              sectionNumber="01"
              sectionTitle="Blog"
            />
            <GithubProject
              username={username}
              token={token ?? ''}
              sectionNumber="02"
              sectionTitle="Projects"
              onViewAllProjects={goToProjects}
            />
            <Experience
              username={username}
              token={token ?? ''}
              sectionNumber="03"
              sectionTitle="Experience"
              onViewHistory={goToExperience}
            />
            <Certification
              username={username}
              token={token ?? ''}
              sectionNumber="04"
              sectionTitle="Certifications"
              onViewAllCertifications={goToCertifications}
            />
            <GithubRepos
              username={username}
              token={token ?? ''}
              sectionNumber="05"
              sectionTitle="Contributions"
            />
            <TechStack
              username={username}
              sectionNumber="06"
              sectionTitle="Technology Stack"
              onViewAllTech={goToTechStack}
            />
            <Suspense fallback={<ResourcesSkeleton />}>
              <Resources
                username={username}
                token={token ?? ''}
                sectionNumber="07"
                sectionTitle="Resources"
                onViewAllResources={goToResources}
              />
            </Suspense>
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
          </>
        )}
      </div>
  );
}
