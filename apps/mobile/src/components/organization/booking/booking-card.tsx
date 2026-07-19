import Feather from '@react-native-vector-icons/feather/static';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getBookingById } from '@/apis/booking/booking-apis';
import VinaupUserArrowUpRight from '@/components/icons/vinaup-user-arrow-up-right.native';
import VinaupUserChecked from '@/components/icons/vinaup-user-checked.native';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { DD_MM_DATE_FORMAT_SHORT } from '@/constants/app-constants';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { BookingResponse, BookingWithMeta } from '@/interfaces/booking-interfaces';
interface BookingCardProps {
  booking?: BookingWithMeta | BookingResponse;
  isReceiver?: boolean;
}

export function BookingCard({ booking, isReceiver }: BookingCardProps) {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);

  const startDate = booking?.startDate
    ? dayjs(booking.startDate).format(DD_MM_DATE_FORMAT_SHORT)
    : '--';
  const endDate = booking?.endDate ? dayjs(booking.endDate).format('DD/MM/YY') : '--';
  const description = booking?.description || 'Booking mới';
  const senderName = booking?.organization?.name || '---';
  const receiverName = booking?.organizationCustomer?.name || 'Chưa xác định';
  const meta = booking && 'meta' in booking ? booking.meta : undefined;
  const isSenderSigned = meta?.isSenderSigned ?? false;
  const isReceiverSigned = meta?.isReceiverSigned ?? false;

  const navigateToDetail = async (bookingId: string) => {
    setIsNavigating(true);
    try {
      await prefetch(() => getBookingById(bookingId), {
        fetchKey: `organization-booking-${bookingId}`,
      });
    } catch {
      // Fallback to normal navigation if prefetch fails.
    }
    router.push({
      pathname: '/(protected)/booking-detail/[bookingId]',
      params: { bookingId },
    });
    setIsNavigating(false);
  };

  const handlePressPreview = (bookingId: string) => {
    router.push({
      pathname: '/(protected)/booking-detail/[bookingId]/booking-detail-preview',
      params: { bookingId },
    });
  };

  return (
    <Pressable onPress={() => booking && navigateToDetail(booking.id)}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View
            style={[
              styles.contentTop,
              {
                backgroundColor: isReceiver ? COLORS.green50 : COLORS.yellow100,
              },
            ]}
          >
            <View style={styles.topRow}>
              <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
                {description}
              </Text>
              <View style={styles.iconGroup}>
                <PressableOpacity onPress={() => booking && handlePressPreview(booking.id)}>
                  <Feather name="eye" size={ICON_SIZES.lg} color={COLORS.teal700} />
                </PressableOpacity>
              </View>
            </View>
            <View style={styles.topRow}>
              <Text style={styles.dateText}>
                Từ {startDate} đến {endDate}
              </Text>
              <Text style={styles.codeText}>{booking?.code}</Text>
            </View>
          </View>
          <View style={styles.contentBottom}>
            <View style={styles.senderContainer}>
              <View style={styles.labelRow}>
                <VinaupUserArrowUpRight width={13} height={15} />
                <Text style={styles.label}>Gửi bởi</Text>
              </View>
              <View style={styles.valueRow}>
                <Text style={styles.senderText} numberOfLines={2}>
                  {senderName}
                </Text>
                {isSenderSigned && <Text style={styles.senderSignedText}>(đã ký)</Text>}
              </View>
            </View>
            <View style={styles.receiverContainer}>
              <View style={[styles.labelRow, styles.receiverLabelRow]}>
                <Text style={styles.label}>Nhận bởi</Text>
                <VinaupUserChecked width={13} height={15} />
              </View>
              <View style={styles.valueRow}>
                <Text style={[styles.receiverText, styles.receiverTextRight]} numberOfLines={2}>
                  {receiverName}
                </Text>
                {isReceiverSigned && (
                  <Text style={[styles.receiverSignedText, styles.receiverTextRight]}>(đã ký)</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  card: {
    borderRadius: RADIUS.lg,
  },
  contentTop: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
    borderWidth: 0.5,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  contentBottom: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  dateText: {
    fontSize: FONT_SIZES.sm,
  },
  codeText: {
    fontSize: FONT_SIZES.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  valueRow: {},
  receiverLabelRow: {
    justifyContent: 'flex-end',
  },
  label: {
    fontSize: FONT_SIZES.sm,
  },
  senderContainer: {
    gap: SPACING['2xs'],
  },
  receiverContainer: {
    gap: SPACING['2xs'],
  },
  senderText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.orange500,
  },
  senderSignedText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.orange500,
  },
  receiverText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  receiverSignedText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
  receiverTextRight: {
    textAlign: 'right',
  },
});
