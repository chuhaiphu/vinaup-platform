import { useLocalSearchParams } from 'expo-router';

import { TourCalculationCancelLogDetailScreenContent } from '@/components/organization/tour/tour-calculation/screen-contents/tour-calculation-cancel-log-detail-screen-content';
import { TourCalculationCancelLogDetailProvider } from '@/providers/organization/tour/tour-calculation-cancel-log-detail-provider';

export default function TourCalculationCancelLogDetailScreen() {
  const { tourCalculationCancelLogId, organizationId } = useLocalSearchParams<{
    tourCalculationCancelLogId?: string;
    organizationId?: string;
  }>();
  return (
    <TourCalculationCancelLogDetailProvider
      cancelLogId={tourCalculationCancelLogId || ''}
      organizationId={organizationId}
    >
      <TourCalculationCancelLogDetailScreenContent />
    </TourCalculationCancelLogDetailProvider>
  );
}
