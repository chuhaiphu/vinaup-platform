import FontAwesome from '@react-native-vector-icons/fontawesome/static';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DateTimePicker } from '@/components/primitives/date-time-picker';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { COLORS, FONT_SIZES, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { UpdateCarRequest } from '@/interfaces/car-interfaces';
import { useCarDetailContext } from '@/providers/organization/car/car-detail-provider';

// The 4 date columns live directly on the car; each row updates exactly one of them.
type CarExpiryField = Extract<
  keyof UpdateCarRequest,
  'inspectionExpiryDate' | 'roadFeeExpiryDate' | 'insuranceExpiryDate' | 'badgeExpiryDate'
>;

const EXPIRY_ROW_LIST: { field: CarExpiryField; label: string }[] = [
  { field: 'inspectionExpiryDate', label: 'Hạn đăng kiểm xe' },
  { field: 'roadFeeExpiryDate', label: 'Hạn phí đường bộ' },
  { field: 'insuranceExpiryDate', label: 'Hạn bảo hiểm xe' },
  { field: 'badgeExpiryDate', label: 'Hạn phù hiệu xe' },
];

export function CarExpirySection() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { car, handleUpdateCar, isUpdatingCar } = useCarDetailContext();

  // ─── Persist immediately on pick ─────
  // Server state is the single source of truth; on change we send just the one field
  // and let fetchwire invalidate + refetch the car, so no local mirror state is needed.
  const handleChangeDate = (field: CarExpiryField, date: Dayjs) => {
    handleUpdateCar({ [field]: date.toISOString() });
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.headerTitle}>Thời hạn xe</Text>
        <PressableOpacity onPress={() => setIsExpanded(!isExpanded)} hitSlop={4}>
          <FontAwesome
            name={isExpanded ? 'caret-down' : 'caret-up'}
            size={ICON_SIZES.lg}
            color={COLORS.teal700}
          />
        </PressableOpacity>
      </View>
      <View style={styles.section}>
        {isExpanded && (
          <View style={styles.sectionContent}>
            {EXPIRY_ROW_LIST.map((row, index) => (
              <View key={row.field}>
                {index > 0 && <View style={styles.separator} />}
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <DateTimePicker
                    mode="date"
                    value={car[row.field] ? dayjs(car[row.field]) : null}
                    onChange={(date) => handleChangeDate(row.field, date)}
                    displayFormat="DD/MM/YYYY"
                    placeholder="Chọn ngày"
                    disabled={isUpdatingCar}
                    style={{ dateText: styles.rowValue }}
                    leftSection={
                      <Ionicons name="arrow-forward" size={ICON_SIZES.sm} color={COLORS.teal700} />
                    }
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.green50,
    padding: SPACING.sm,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
  },
  section: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
  },
  sectionContent: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.gray200,
    marginVertical: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  rowLabel: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  rowValue: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
  },
});
