import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AttendanceRecordCard } from '@/components/organization/attendance/attendance-record-card';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/style-constants';
import { useCurrentMinute } from '@/hooks/use-current-minute';
import { useOrganizationAttendanceRecordListContext } from '@/providers/organization/attendance/organization-attendance-record-list-provider';

interface AttendanceRecordListSectionProps {
  organizationTimezone: string;
}

export function AttendanceRecordListSection({
  organizationTimezone,
}: AttendanceRecordListSectionProps) {
  const { attendanceRecords, isRefreshing, refreshFetch } =
    useOrganizationAttendanceRecordListContext();

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
            onRefresh={refreshFetch}
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
