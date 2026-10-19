import { createFileRoute } from '@tanstack/react-router';
import { ResumeViewer, ResumeSkeleton } from '../all/resume';
import { useSeoHead } from '../all/seo';

export const Route = createFileRoute('/resume')({
  pendingComponent: ResumeSkeleton,
  component: ResumePage,
});

function ResumePage() {
  const navigate = Route.useNavigate();

  useSeoHead('resume');

  return (
    <ResumeViewer
      sectionNumber=""
      sectionTitle="Resume"
      onBack={() => navigate({ to: '/' })}
    />
  );
}
