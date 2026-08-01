import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AttendanceRecordCard } from '@/components/organization/attendance/attendance-record-card';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/style-constants';
import { useCurrentMinute } from '@/hooks/use-current-minute';
import { AttendanceRecordResponse } from '@/interfaces/attendance-interfaces';

interface AttendanceRecordListSectionProps {
  attendanceRecords: AttendanceRecordResponse[];
  organizationTimezone: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function AttendanceRecordListSection({
  attendanceRecords,
  organizationTimezone,
  isRefreshing,
  onRefresh,
}: AttendanceRecordListSectionProps) {
  // One timer here drives every open card's running total.
  const now = useCurrentMinute();

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={attendanceRecords}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <AttendanceRecordCard
            attendanceRecord={item}
            organizationTimezone={organizationTimezone}
            now={now}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có lượt chấm công nào trong ngày</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.teal700]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: SPACING.lg,
  },
  separator: {
    height: SPACING.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    fontStyle: 'italic',
  },
});
