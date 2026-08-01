import { Suspense } from 'react';

import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import { AttendanceManagementScreenContent } from '@/components/organization/attendance/screen-contents/attendance-management-screen-content';
import { ErrorBoundary } from '@/components/primitives/error-boundary';

export default function AttendanceManagementScreen() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<EntityListSectionSkeleton />}>
        <AttendanceManagementScreenContent />
      </Suspense>
    </ErrorBoundary>
  );
}
