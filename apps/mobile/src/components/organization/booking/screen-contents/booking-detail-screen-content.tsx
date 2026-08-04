import DeleteIcon from '@expo/material-symbols/delete.xml';
import VisibilityIcon from '@expo/material-symbols/visibility.xml';
import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';
import { Stack, useRouter } from 'expo-router';
import { Suspense, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import { BookingContentSection } from '@/components/organization/booking/detail/booking-content-section';
import { BookingDetailHeader } from '@/components/organization/booking/detail/booking-detail-header';
import BookingSignatureSection from '@/components/organization/booking/detail/booking-signature-section';
import { BookingSignaturePopover } from '@/components/organization/booking/popovers/booking-signature-popover';
import {
  ReceiptPaymentListInBooking,
  ReceiptPaymentListInBookingRef,
} from '@/components/organization/booking/receipt-payment-list-in-booking';
import { Badge } from '@/components/primitives/badge';
import { BOOKING_STATUS, BookingStatus, BookingStatusDisplay } from '@/constants/booking-constants';
import { BADGE_VARIANT, BadgeVariant, COLORS, RADIUS, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import type { ToolbarIcon } from '@/interfaces/navigation-interfaces';
import { ReceiptPaymentListInBookingProvider } from '@/providers/commons/receipt-payment/receipt-payment-list-in-booking-provider';
import { useBookingDetailContext } from '@/providers/organization/booking/booking-detail-provider';
import { OrganizationCustomerProvider } from '@/providers/organization/customer/organization-customer-provider';
import { useOrganizationAbility } from '@/providers/organization/organization-ability-provider';

const bookingStatusBadgeVariant: Record<BookingStatus, BadgeVariant> = {
  [BOOKING_STATUS.DRAFT]: BADGE_VARIANT.GRAY,
  [BOOKING_STATUS.SENDER_SIGNED]: BADGE_VARIANT.ORANGE,
  [BOOKING_STATUS.COMPLETED]: BADGE_VARIANT.GREEN,
};

export function BookingDetailScreenContent() {
  const [isSignatureInfoPopoverVisible, setIsSignatureInfoPopoverVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    booking,
    isRefreshingBooking,
    isDeletingBooking,
    bookingId,
    canEdit,
    handleDelete,
    refreshBooking,
    refreshSignatures,
  } = useBookingDetailContext();
  const { can } = useOrganizationAbility();
  const receiptListRef = useRef<ReceiptPaymentListInBookingRef>(null);
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);

  const canDelete = canEdit && can(PERMISSION_ACTION.DELETE, PERMISSION_RESOURCE.BOOKING);

  const bookingStatus = booking.status ?? BOOKING_STATUS.DRAFT;

  function handleDeleteBooking() {
    return handleDelete(
      () => setIsNavigating(true),
      () => setIsNavigating(false),
    );
  }

  const handleRefresh = () => {
    refreshBooking();
    refreshSignatures();
    receiptListRef.current?.refresh();
  };

  const handlePressPreview = () => {
    router.push({
      pathname: '/(protected)/booking-detail/[bookingId]/booking-detail-preview',
      params: { bookingId },
    });
  };

  return (
    <OrganizationCustomerProvider organizationId={booking.organization?.id}>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={Platform.select<ToolbarIcon>({ ios: 'eye', android: VisibilityIcon })}
          accessibilityLabel="Xem trước"
          onPress={handlePressPreview}
        />
        {canDelete && (
          <Stack.Toolbar.Button
            icon={Platform.select<ToolbarIcon>({ ios: 'trash', android: DeleteIcon })}
            accessibilityLabel="Xoá"
            disabled={isDeletingBooking}
            onPress={handleDeleteBooking}
          />
        )}
      </Stack.Toolbar>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.actionContainer}>
          <Badge variant={bookingStatusBadgeVariant[bookingStatus]}>
            {BookingStatusDisplay[bookingStatus]}
          </Badge>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshingBooking}
              onRefresh={handleRefresh}
              colors={[COLORS.teal700]}
              tintColor={COLORS.teal700}
            />
          }
        >
          <BookingDetailHeader />
          <BookingContentSection />
          <Suspense fallback={<EntityListSectionSkeleton />}>
            <ReceiptPaymentListInBookingProvider
              key={`receipt-payment-list-in-booking-${bookingId}`}
              bookingId={bookingId}
            >
              <ReceiptPaymentListInBooking
                ref={receiptListRef}
                onRefresh={handleRefresh}
                startDate={booking.startDate}
                endDate={booking.endDate}
                bookingId={bookingId}
                organizationId={booking.organization?.id}
                canEdit={canEdit}
              />
            </ReceiptPaymentListInBookingProvider>
          </Suspense>
        </ScrollView>

        <BookingSignaturePopover
          isVisible={isSignatureInfoPopoverVisible}
          onClose={() => setIsSignatureInfoPopoverVisible(false)}
        />
        <View style={styles.bookingSignatureContainer}>
          <BookingSignatureSection
            onOpenSignatureInfoPopover={() => setIsSignatureInfoPopoverVisible(true)}
          />
        </View>
      </View>
    </OrganizationCustomerProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  actionContainer: {
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookingSignatureContainer: {
    backgroundColor: COLORS.green50,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
  },
});
