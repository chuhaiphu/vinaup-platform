import Entypo from '@react-native-vector-icons/entypo/static';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import { useRouter } from 'expo-router';
import { Suspense, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import VinaupEyeSquare from '@/components/icons/vinaup-eye-square.native';
import { BookingContentSection } from '@/components/organization/booking/detail/booking-content-section';
import { BookingDetailHeader } from '@/components/organization/booking/detail/booking-detail-header';
import BookingSignatureSection from '@/components/organization/booking/detail/booking-signature-section';
import { BookingSignaturePopover } from '@/components/organization/booking/popovers/booking-signature-popover';
import {
  ReceiptPaymentListInBooking,
  ReceiptPaymentListInBookingRef,
} from '@/components/organization/booking/receipt-payment-list-in-booking';
import { Badge } from '@/components/primitives/badge';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { BOOKING_STATUS, BookingStatus, BookingStatusDisplay } from '@/constants/booking-constants';
import {
  BADGE_VARIANT,
  BadgeVariant,
  COLORS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { useScreenHeader } from '@/hooks/use-screen-header';
import { ReceiptPaymentListInBookingProvider } from '@/providers/commons/receipt-payment/receipt-payment-list-in-booking-provider';
import { useBookingDetailContext } from '@/providers/organization/booking/booking-detail-provider';
import { OrganizationCustomerProvider } from '@/providers/organization/customer/organization-customer-provider';

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
  const receiptListRef = useRef<ReceiptPaymentListInBookingRef>(null);
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);

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

  const handleSaveAndExit = () => {
    refreshBooking();
    router.back();
  };

  const handlePressPreview = () => {
    router.push({
      pathname: '/(protected)/booking-detail/[bookingId]/booking-detail-preview',
      params: { bookingId },
    });
  };

  useScreenHeader({
    title: 'Chi tiết Booking',
    onDelete: canEdit ? handleDeleteBooking : undefined,
    onSave: canEdit ? handleSaveAndExit : undefined,
    isDeleting: isDeletingBooking,
  });

  return (
    <OrganizationCustomerProvider organizationId={booking.organization?.id}>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.actionContainer}>
          <Badge variant={bookingStatusBadgeVariant[bookingStatus]}>
            {BookingStatusDisplay[bookingStatus]}
          </Badge>
          <View style={styles.actionButton}>
            <PressableOpacity style={styles.actionButtonItem} onPress={handlePressPreview}>
              <VinaupEyeSquare />
            </PressableOpacity>
            <PressableOpacity style={styles.actionButtonItem}>
              <FontAwesome5 name="copy" size={ICON_SIZES.md} color={COLORS.teal700} />
            </PressableOpacity>
            <PressableOpacity style={styles.actionButtonItem}>
              <Entypo name="dots-three-horizontal" size={ICON_SIZES.md} color={COLORS.teal700} />
            </PressableOpacity>
          </View>
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
  actionButton: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButtonItem: {},
  bookingSignatureContainer: {
    backgroundColor: COLORS.green50,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
  },
});
