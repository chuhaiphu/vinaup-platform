import Feather from '@react-native-vector-icons/feather/static';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/primitives/button';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  LINE_HEIGHTS,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { TourSettlementCancelLogResponse } from '@/interfaces/tour-settlement-interfaces';
import { useTourSettlementContext } from '@/providers/organization/tour/tour-settlement-provider';

interface TourSettlementCancelLogModalContentProps {
  onCloseRequest?: () => void;
}

export function TourSettlementCancelLogModalContent({
  onCloseRequest,
}: TourSettlementCancelLogModalContentProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    cancelLogs,
    isLoadingCancelLogs: isLoading,
    fetchCancelLogs,
    tourSettlement,
  } = useTourSettlementContext();
  const tourData = tourSettlement?.tour;

  const handleRetry = () => {
    fetchCancelLogs();
  };

  const handlePressLog = (log: TourSettlementCancelLogResponse) => {
    router.push({
      pathname: '/(protected)/tour-settlement-cancel-log-detail/[tourSettlementCancelLogId]',
      params: {
        tourSettlementId: log.tourSettlementId,
        tourSettlementCancelLogId: log.id,
        organizationId: tourData?.organization?.id,
      },
    });
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nhật ký</Text>
        <Pressable onPress={onCloseRequest} hitSlop={8}>
          <Feather name="x" size={ICON_SIZES.lg} color="#D35400" />
        </Pressable>
      </View>
      <View style={styles.headerDivider} />

      <Text style={styles.orgName}>{tourData?.organization?.name}</Text>

      {isLoading && (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="small" color={COLORS.teal700} />
        </View>
      )}

      {!isLoading && (!cancelLogs || cancelLogs.length === 0) && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>Chưa có nhật ký hủy ký.</Text>
          <Button style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Tải lại</Text>
          </Button>
        </View>
      )}

      {!isLoading && cancelLogs && cancelLogs.length > 0 && (
        <FlatList
          data={cancelLogs}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handlePressLog(item)}
              style={({ pressed }) => [styles.logRowItem, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.tourTitleText} numberOfLines={1}>
                {tourData?.description}
              </Text>
              <Text style={styles.timeText}>{dayjs(item.createdAt).format('DD/MM/YY HH:mm')}</Text>
            </Pressable>
          )}
        />
      )}
      <View style={styles.footerContainer}>
        <View>
          <Text style={styles.creatorText}>Người tạo: {tourData?.createdBy?.name || '---'}</Text>
        </View>
        <View style={styles.doubleLineSeparator} />
        <Text style={styles.footerNoteText}>* Nhật ký lưu tối đa 5 lần</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.teal900,
  },
  headerDivider: {
    height: 3,
    backgroundColor: COLORS.gray400,
    marginBottom: SPACING.lg,
  },
  orgName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
    marginBottom: SPACING.lg,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xl,
  },
  stateText: {
    color: COLORS.gray600,
    fontSize: FONT_SIZES.sm,
  },
  retryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  retryButtonText: {
    color: COLORS.teal700,
    fontSize: FONT_SIZES.sm,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: SPACING.xs,
  },
  logRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray100,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  tourTitleText: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
    marginRight: SPACING.sm,
  },
  timeText: {
    color: COLORS.gray600,
  },
  footerContainer: {
    marginTop: SPACING.lg,
  },
  creatorText: {
    fontSize: FONT_SIZES.base,
  },
  doubleLineSeparator: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    height: 4,
    marginVertical: SPACING.md,
  },
  footerNoteText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: LINE_HEIGHTS.sm,
    color: COLORS.teal900,
  },
});
