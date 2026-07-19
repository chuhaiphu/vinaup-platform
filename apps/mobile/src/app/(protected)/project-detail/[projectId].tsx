import { useLocalSearchParams } from 'expo-router';
import { Suspense } from 'react';

import { EntityDetailSkeleton } from '@/components/commons/skeletons/entity-detail-skeleton';
import { ProjectDetailScreenContent } from '@/components/organization/project/screen-contents/project-detail-screen-content';
import { PersonalProjectDetailScreenContent } from '@/components/personal/project/screen-contents/personal-project-detail-screen-content';
import { ErrorBoundary } from '@/components/primitives/error-boundary';
import { ProjectDetailProvider } from '@/providers/organization/project/project-detail-provider';
import { PersonalProjectDetailProvider } from '@/providers/personal/project/personal-project-detail-provider';

export default function ProjectDetailScreen() {
  const { projectId, organizationId } = useLocalSearchParams<{
    projectId: string;
    organizationId?: string;
  }>();

  if (organizationId) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<EntityDetailSkeleton />}>
          <ProjectDetailProvider projectId={projectId}>
            <ProjectDetailScreenContent />
          </ProjectDetailProvider>
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<EntityDetailSkeleton />}>
        <PersonalProjectDetailProvider projectId={projectId}>
          <PersonalProjectDetailScreenContent />
        </PersonalProjectDetailProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
