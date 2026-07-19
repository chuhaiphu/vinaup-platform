import { Suspense, useRef, useState } from 'react';
import { StyleSheet, RefreshControl, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import { TourDetailHeader } from '@/components/organization/tour/detail/tour-detail-header';
import { TourSignatureInfoPopover } from '@/components/organization/tour/shared/popovers/tour-signature-info-popover';
import TourCalculationSignature, {
  TourCalculationSignatureRef,
} from '@/components/organization/tour/tour-calculation/sections/tour-calculation-signature-section';
import { TourCalculationTicketSummaryReceiptPaymentList } from '@/components/organization/tour/tour-calculation/sections/tour-calculation-ticket-summary-receipt-payment-list';
import { TourCalculationTicketSummarySkeleton } from '@/components/organization/tour/tour-calculation/sections/tour-calculation-ticket-summary-skeleton';
import { COLORS, RADIUS, SPACING } from '@/constants/style-constants';
import { ReceiptPaymentCategoryProvider } from '@/providers/commons/receipt-payment/receipt-payment-category-provider';
import { OrganizationCustomerProvider } from '@/providers/organization/customer/organization-customer-provider';
import { TourCalculationProvider } from '@/providers/organization/tour/tour-calculation-provider';
import { useTourDetailContext } from '@/providers/organization/tour/tour-detail-provider';

type TourCalculationContentRef = {
  refreshData: {
    refreshTourCalculation: () => void;
    refreshReceiptPaymentsByTourCalculation: () => void;
  };
};

export function TourCalculationScreenContent() {
  const [isSignatureInfoPopoverVisible, setIsSignatureInfoPopoverVisible] = useState(false);
  const calcRef = useRef<TourCalculationContentRef>(null);
  const signatureRef = useRef<TourCalculationSignatureRef>(null);

  const { tourId, tour, isRefreshingTour, isUpdatingTour, handleUpdateTour, refreshTour } =
    useTourDetailContext();

  const handleRefresh = () => {
    refreshTour();
    calcRef.current?.refreshData.refreshTourCalculation();
    calcRef.current?.refreshData.refreshReceiptPaymentsByTourCalculation();
    signatureRef.current?.refresh();
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        bottomOffset={8}
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
                <TourCalculationTicketSummarySkeleton />
                <EntityListSectionSkeleton />
              </>
            }
          >
            <TourCalculationProvider key={tourId} tourId={tourId}>
              <TourCalculationTicketSummaryReceiptPaymentList
                ref={calcRef}
                tourId={tourId}
                organizationId={tour?.organization?.id}
              />
            </TourCalculationProvider>
          </Suspense>
        </ReceiptPaymentCategoryProvider>
      </KeyboardAwareScrollView>
      <TourSignatureInfoPopover
        isVisible={isSignatureInfoPopoverVisible}
        onClose={() => setIsSignatureInfoPopoverVisible(false)}
      />
      <Suspense fallback={null}>
        <View style={styles.tourCalculationSignatureContainer}>
          <TourCalculationProvider tourId={tourId}>
            <TourCalculationSignature
              ref={signatureRef}
              onOpenSignatureInfoPopover={() => setIsSignatureInfoPopoverVisible(true)}
            />
          </TourCalculationProvider>
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
  tourCalculationSignatureContainer: {
    backgroundColor: COLORS.green50,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
  },
});
