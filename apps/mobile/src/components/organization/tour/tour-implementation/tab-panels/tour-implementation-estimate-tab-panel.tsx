import React, { useState, useTransition } from 'react';
import { StyleSheet, View } from 'react-native';

import { ReceiptPaymentListInTourImplementation } from '@/components/organization/tour/tour-implementation/sections/receipt-payment-list-in-tour-implementation';
import { SegmentedControl } from '@/components/primitives/segmented-control';
import Tabs from '@/components/primitives/tabs';
import { COLORS, RADIUS, SPACING } from '@/constants/style-constants';
import { useReceiptPaymentListInTourImplementationContext } from '@/providers/organization/tour/receipt-payment-list-in-tour-implementation-provider';
import { useTourDetailContext } from '@/providers/organization/tour/tour-detail-provider';
import { useTourImplementationContext } from '@/providers/organization/tour/tour-implementation-provider';

export type SubTab = 'FOR_DIRECTOR' | 'FOR_TOUR_GUIDE';

interface TourImplementationEstimateTabPanelProps {
  // ─── Selection state is lifted to the parent screen ─────
  // The sticky summary bar (a sibling rendered outside this panel's tree)
  // must know the active sub-tab to switch between the director / tour-guide summary.
  selectedSubTab: SubTab | null;
  onSubTabChange: (value: SubTab) => void;
}

export function TourImplementationEstimateTabPanel({
  selectedSubTab,
  onSubTabChange,
}: TourImplementationEstimateTabPanelProps) {
  const { tour } = useTourDetailContext();
  const { tourImplementation, isMemberAssigned, canViewTourGuideReceiptPayments } =
    useTourImplementationContext();
  const { allReceiptPayments, tourGuideReceiptPayments, isRefreshing } =
    useReceiptPaymentListInTourImplementationContext();

  // ─── Split sub-tab state into urgent (actived segment) + not-urgent (content) ─────
  // Each sub-panel mounts a heavy dayjs-bound receipt-payment list.
  // selectedSubTab (owned by parent) flips the active tab color immediately,
  // contentSubTab is updated in a transition,
  // new list will be rendered in the background while the previous list stays visible.
  const [contentSubTab, setContentSubTab] = useState<SubTab | null>(null);
  const [isPending, startTransition] = useTransition();

  // ─── Pill moves immediately (urgent) for instant feedback on tap ─────
  const handleSubTabPress = (value: SubTab) => {
    onSubTabChange(value);
  };

  // ─── Content switches in a transition (not urgent) to keep the UI responsive while the heavy list renders ─────
  const handleSubTabSettled = (value: SubTab) => {
    startTransition(() => setContentSubTab(value));
  };

  if (!tour) return null;

  // ─── Sub-tabs ─────
  // - "Điều hành" (all groups): only the director (memberAssigned) can see.
  // - "Bàn giao HDV": director OR an assigned user holding the RECEIPT_PAYMENT_FOR_TOUR_GUIDE_READ can see.
  const subTabs: { value: SubTab; label: string }[] = [];
  if (isMemberAssigned) {
    subTabs.push({ value: 'FOR_DIRECTOR', label: 'Điều hành tất cả' });
  }
  if (canViewTourGuideReceiptPayments) {
    subTabs.push({ value: 'FOR_TOUR_GUIDE', label: 'Bàn giao HDV' });
  }

  if (subTabs.length === 0) return null;

  // Default to active first available tab; otherwise active the tab the user tapped.
  const activeSubTab = selectedSubTab ?? subTabs[0].value;
  const activeContentSubTab = contentSubTab ?? subTabs[0].value;

  return (
    <View style={styles.container}>
      <View style={styles.subTabListContainer}>
        <SegmentedControl
          items={subTabs}
          value={activeSubTab}
          onChange={handleSubTabPress}
          onSettled={handleSubTabSettled}
          style={{
            pill: { backgroundColor: COLORS.white, boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)' },
          }}
        />
      </View>

      <View style={isPending && styles.pendingPanel} pointerEvents={isPending ? 'none' : 'auto'}>
        {isMemberAssigned && (
          <Tabs.Panel value="FOR_DIRECTOR" currentValue={activeContentSubTab}>
            <ReceiptPaymentListInTourImplementation
              receiptPayments={allReceiptPayments}
              startDate={tour.startDate}
              endDate={tour.endDate}
              loading={false}
              isRefreshing={isRefreshing}
              tourImplementationId={tourImplementation.id}
              organizationId={tour.organization?.id}
              groupCode="FOR_DIRECTOR"
            />
          </Tabs.Panel>
        )}

        {canViewTourGuideReceiptPayments && (
          <Tabs.Panel value="FOR_TOUR_GUIDE" currentValue={activeContentSubTab}>
            <ReceiptPaymentListInTourImplementation
              receiptPayments={tourGuideReceiptPayments}
              startDate={tour.startDate}
              endDate={tour.endDate}
              loading={false}
              isRefreshing={isRefreshing}
              tourImplementationId={tourImplementation.id}
              organizationId={tour.organization?.id}
              groupCode="FOR_TOUR_GUIDE"
            />
          </Tabs.Panel>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: RADIUS.md,
  },
  subTabListContainer: {
    paddingHorizontal: SPACING.sm,
  },
  // ─── Dim + block taps while the deferred sub-panel renders ─────
  pendingPanel: {
    opacity: 0.6,
  },
});
