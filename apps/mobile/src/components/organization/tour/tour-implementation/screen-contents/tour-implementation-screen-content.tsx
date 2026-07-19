import React, { Suspense, useRef, useState, useTransition } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import { TourImplementationSummaryBarTourGuide } from '@/components/organization/tour/tour-implementation/bars/tour-imlementation-summary-bar-tour-guide';
import { TourImplementationSummaryBar } from '@/components/organization/tour/tour-implementation/bars/tour-implementation-summary-bar';
import { TourImplementationAssignmentSection } from '@/components/organization/tour/tour-implementation/sections/tour-implementation-assignment-section';
import { TourImplementationHomeSkeleton } from '@/components/organization/tour/tour-implementation/sections/tour-implementation-home-skeleton';
import { BookingTourImplementationTabPanel } from '@/components/organization/tour/tour-implementation/tab-panels/booking-tour-implementation-tab-panel';
import {
  TourImplementationEstimateTabPanel,
  SubTab,
} from '@/components/organization/tour/tour-implementation/tab-panels/tour-implementation-estimate-tab-panel';
import { TourImplementationHomeTabPanel } from '@/components/organization/tour/tour-implementation/tab-panels/tour-implementation-home-tab-panel';
import Tabs from '@/components/primitives/tabs';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';
import { ReceiptPaymentCategoryProvider } from '@/providers/commons/receipt-payment/receipt-payment-category-provider';
import { OrganizationCustomerProvider } from '@/providers/organization/customer/organization-customer-provider';
import { OrganizationMemberListProvider } from '@/providers/organization/member/organization-member-list-provider';
import { ReceiptPaymentListInTourImplementationProvider } from '@/providers/organization/tour/receipt-payment-list-in-tour-implementation-provider';
import { useTourDetailContext } from '@/providers/organization/tour/tour-detail-provider';
import {
  TourImplementationProvider,
  useTourImplementationContext,
} from '@/providers/organization/tour/tour-implementation-provider';

export function TourImplementationScreenContent() {
  const { tour } = useTourDetailContext();
  const tourId = tour?.id ?? '';

  return (
    <Suspense fallback={<TourImplementationHomeSkeleton />}>
      <TourImplementationProvider key={tourId} tourId={tourId}>
        <TourImplementationDetail />
      </TourImplementationProvider>
    </Suspense>
  );
}

function TourImplementationDetail() {
  // ─── Split tab state into urgent (highlight) + not-urgent (content) ─────
  // Each content-panel mounts a heavy dayjs-bound receipt-payment list.
  // selectedTab flips the active tab color immediately,
  // new list will be rendered in the background (in a transition) while the previous list stays visible.
  const [selectedTab, setSelectedTab] = useState('home');
  const [contentTab, setContentTab] = useState('home');
  const [isPending, startTransition] = useTransition();

  const handleTabPress = (value: string) => {
    setSelectedTab(value);
    startTransition(() => setContentTab(value));
  };

  const { tour } = useTourDetailContext();
  const { tourImplementation, isMemberAssigned, canViewTourGuideReceiptPayments, canViewBooking } =
    useTourImplementationContext();

  // Director sees all sub-tabs;
  // An assigned user only see the estimate tab when granted tour-guide read.
  // For anyone else, so hide the whole "Dự toán" tab.
  const canViewEstimate = isMemberAssigned || canViewTourGuideReceiptPayments;

  // ─── Lift the estimate sub-tab selection up to the screen ─────
  const [selectedSubTab, setSelectedSubTab] = useState<SubTab | null>(null);
  // Default mirrors the panel's first available sub-tab (director first, else HDV).
  const defaultSubTab: SubTab | null = isMemberAssigned
    ? 'FOR_DIRECTOR'
    : canViewTourGuideReceiptPayments
      ? 'FOR_TOUR_GUIDE'
      : null;
  const activeSubTab = selectedSubTab ?? defaultSubTab;

  const scrollViewRef = useRef<ScrollView>(null);
  const pendingScrollToEndRef = useRef(false);

  const requestScrollToEnd = () => {
    pendingScrollToEndRef.current = true;
  };

  const handleContentSizeChange = () => {
    if (!pendingScrollToEndRef.current) return;
    pendingScrollToEndRef.current = false;
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        onContentSizeChange={handleContentSizeChange}
      >
        <Tabs.List styles={{ list: styles.tabList }} gap={12}>
          <Tabs.Tab
            value="home"
            currentValue={selectedTab}
            onPress={handleTabPress}
            styles={{
              tab: [styles.tab, selectedTab === 'home' && styles.activeTab],
              indicator: { height: 0 },
            }}
          >
            <Text style={[styles.tabText, selectedTab === 'estimate' && styles.activeTabText]}>
              Bàn giao
            </Text>
          </Tabs.Tab>

          {canViewEstimate && (
            <Tabs.Tab
              value="estimate"
              currentValue={selectedTab}
              onPress={handleTabPress}
              styles={{
                tab: [styles.tab, selectedTab === 'estimate' && styles.activeTab],
                indicator: { height: 0 },
              }}
            >
              <Text style={[styles.tabText, selectedTab === 'estimate' && styles.activeTabText]}>
                Dự toán
              </Text>
            </Tabs.Tab>
          )}

          {canViewBooking && (
            <Tabs.Tab
              value="booking"
              currentValue={selectedTab}
              onPress={handleTabPress}
              styles={{
                tab: [styles.tab, selectedTab === 'booking' && styles.activeTab],
                indicator: { height: 0 },
              }}
            >
              <Text style={[styles.tabText, selectedTab === 'booking' && styles.activeTabText]}>
                Booking
              </Text>
            </Tabs.Tab>
          )}
        </Tabs.List>

        <View
          style={[styles.content, isPending && styles.pendingContent]}
          pointerEvents={isPending ? 'none' : 'auto'}
        >
          <Tabs.Panel
            value="home"
            currentValue={contentTab}
            styles={{
              panel: styles.panel,
            }}
          >
            <OrganizationCustomerProvider organizationId={tour?.organization?.id}>
              <OrganizationMemberListProvider organizationId={tour?.organization?.id ?? ''}>
                <TourImplementationHomeTabPanel />
              </OrganizationMemberListProvider>
            </OrganizationCustomerProvider>
          </Tabs.Panel>

          {canViewEstimate && (
            <Tabs.Panel value="estimate" currentValue={contentTab} styles={{ panel: styles.panel }}>
              <Suspense fallback={<EntityListSectionSkeleton />}>
                <ReceiptPaymentCategoryProvider organizationId={tour?.organization?.id}>
                  <ReceiptPaymentListInTourImplementationProvider
                    tourImplementationId={tourImplementation.id}
                  >
                    <TourImplementationEstimateTabPanel
                      selectedSubTab={selectedSubTab}
                      onSubTabChange={setSelectedSubTab}
                    />
                  </ReceiptPaymentListInTourImplementationProvider>
                </ReceiptPaymentCategoryProvider>
              </Suspense>
            </Tabs.Panel>
          )}

          {canViewBooking && (
            <Tabs.Panel value="booking" currentValue={contentTab} styles={{ panel: styles.panel }}>
              <BookingTourImplementationTabPanel
                tourImplementationId={tourImplementation.id}
                organizationId={tour?.organization?.id ?? ''}
              />
            </Tabs.Panel>
          )}
        </View>
        {contentTab === 'home' && (
          <TourImplementationAssignmentSection
            assignments={tourImplementation.tourImplementationAssignments}
            organizationId={tour?.organization?.id ?? ''}
            onRequestScrollToEnd={requestScrollToEnd}
          />
        )}
      </ScrollView>

      {contentTab === 'estimate' && canViewEstimate && (
        <Suspense fallback={null}>
          <View style={styles.summaryContainer}>
            <ReceiptPaymentListInTourImplementationProvider
              tourImplementationId={tourImplementation.id}
            >
              {/* Tour-guide handover shows a minimal yellow summary; */}
              {/* every other sub-tab keeps the rich director summary. */}
              {activeSubTab === 'FOR_TOUR_GUIDE' ? (
                <TourImplementationSummaryBarTourGuide />
              ) : (
                <TourImplementationSummaryBar />
              )}
            </ReceiptPaymentListInTourImplementationProvider>
          </View>
        </Suspense>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {},
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingContent: {
    opacity: 0.6,
  },
  tabList: {
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
  },
  tab: {
    height: 32,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: SPACING.sm,
  },
  activeTab: {
    backgroundColor: COLORS.green50,
    borderColor: COLORS.teal700,
  },
  tabText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
  },
  activeTabText: {
    color: COLORS.teal700,
    fontWeight: FONT_WEIGHTS.bold,
  },
  panel: {
    width: '100%',
  },
  summaryContainer: {
    marginTop: SPACING.md,
  },
});
