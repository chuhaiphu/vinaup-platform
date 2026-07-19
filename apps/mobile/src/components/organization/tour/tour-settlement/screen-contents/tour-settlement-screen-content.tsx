import { Suspense, useRef, useState } from 'react';
import { StyleSheet, ScrollView, RefreshControl, View } from 'react-native';

import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import { TourDetailHeader } from '@/components/organization/tour/detail/tour-detail-header';
import { TourSignatureInfoPopover } from '@/components/organization/tour/shared/popovers/tour-signature-info-popover';
import TourSettlementSignature, {
  TourSettlementSignatureRef,
} from '@/components/organization/tour/tour-settlement/sections/tour-settlement-signature-section';
import { TourSettlementTicketSummaryReceiptPaymentList } from '@/components/organization/tour/tour-settlement/sections/tour-settlement-ticket-summary-receipt-payment-list';
import { TourSettlementTicketSummarySkeleton } from '@/components/organization/tour/tour-settlement/sections/tour-settlement-ticket-summary-skeleton';
import { COLORS, RADIUS, SPACING } from '@/constants/style-constants';
import { ReceiptPaymentCategoryProvider } from '@/providers/commons/receipt-payment/receipt-payment-category-provider';
import { OrganizationCustomerProvider } from '@/providers/organization/customer/organization-customer-provider';
import { useTourDetailContext } from '@/providers/organization/tour/tour-detail-provider';
import { TourSettlementProvider } from '@/providers/organization/tour/tour-settlement-provider';

type TourSettlementContentRef = {
  refreshData: {
    refreshTourSettlement: () => void;
    refreshReceiptPaymentsByTourSettlement: () => void;
  };
};

export function TourSettlementScreenContent() {
  const [isSignatureInfoPopoverVisible, setIsSignatureInfoPopoverVisible] = useState(false);
  const settleRef = useRef<TourSettlementContentRef>(null);
  const signatureRef = useRef<TourSettlementSignatureRef>(null);

  const { tourId, tour, isRefreshingTour, isUpdatingTour, handleUpdateTour, refreshTour } =
    useTourDetailContext();

  const handleRefresh = () => {
    refreshTour();
    settleRef.current?.refreshData.refreshTourSettlement();
    settleRef.current?.refreshData.refreshReceiptPaymentsByTourSettlement();
    signatureRef.current?.refresh();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshingTour}
            onRefresh={handleRefresh}
            colors={[COLORS.teal700]}
            tintColor={COLORS.teal700}
          />
        }
      >
        {/* Organization Customers are only consumed by the TourOrgCustomerSelectModal inside TourDetailHeader */}
        <OrganizationCustomerProvider organizationId={tour?.organization?.id}>
          <TourDetailHeader
            tour={tour ?? undefined}
            isLoading={isUpdatingTour || isRefreshingTour}
            onConfirm={(data, onSuccessCallback) => handleUpdateTour(data, onSuccessCallback)}
          />
        </OrganizationCustomerProvider>
        {/* Receipt Payment Categories are only consumed by the receipt-payment list */}
        <ReceiptPaymentCategoryProvider organizationId={tour?.organization?.id}>
          <Suspense
            fallback={
              <>
                <TourSettlementTicketSummarySkeleton />
                <EntityListSectionSkeleton />
              </>
            }
          >
            <TourSettlementProvider key={tourId} tourId={tourId}>
              <TourSettlementTicketSummaryReceiptPaymentList
                ref={settleRef}
                tourId={tourId}
                organizationId={tour?.organization?.id}
              />
            </TourSettlementProvider>
          </Suspense>
        </ReceiptPaymentCategoryProvider>
      </ScrollView>
      <TourSignatureInfoPopover
        isVisible={isSignatureInfoPopoverVisible}
        onClose={() => setIsSignatureInfoPopoverVisible(false)}
      />
      <Suspense fallback={null}>
        <View style={styles.tourSettlementSignatureContainer}>
          <TourSettlementProvider tourId={tourId}>
            <TourSettlementSignature
              ref={signatureRef}
              onOpenSignatureInfoPopover={() => setIsSignatureInfoPopoverVisible(true)}
            />
          </TourSettlementProvider>
        </View>
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {},
  tourSettlementSignatureContainer: {
    backgroundColor: COLORS.green50,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
  },
});
