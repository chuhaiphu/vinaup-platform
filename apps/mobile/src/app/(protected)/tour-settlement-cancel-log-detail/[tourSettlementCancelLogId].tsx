import { useLocalSearchParams } from 'expo-router';

import { TourSettlementCancelLogDetailScreenContent } from '@/components/organization/tour/tour-settlement/screen-contents/tour-settlement-cancel-log-detail-screen-content';
import { TourSettlementCancelLogDetailProvider } from '@/providers/organization/tour/tour-settlement-cancel-log-detail-provider';

export default function TourSettlementCancelLogDetailScreen() {
  const { tourSettlementCancelLogId, organizationId } = useLocalSearchParams<{
    tourSettlementCancelLogId?: string;
    organizationId?: string;
  }>();
  return (
    <TourSettlementCancelLogDetailProvider
      cancelLogId={tourSettlementCancelLogId || ''}
      organizationId={organizationId}
    >
      <TourSettlementCancelLogDetailScreenContent />
    </TourSettlementCancelLogDetailProvider>
  );
}
