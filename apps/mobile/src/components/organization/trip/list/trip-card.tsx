import { StyleSheet, Text, View } from 'react-native';

import { DateRangeText } from '@/components/commons/texts/date-range-text';
import VinaupUserCouple from '@/components/icons/vinaup-user-couple.native';
import VinaupVan from '@/components/icons/vinaup-van.native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';
import { TripStatusDisplay } from '@/constants/trip-constants';
import { TripResponse } from '@/interfaces/trip-interfaces';

interface TripCardProps {
  trip?: TripResponse;
}

export function TripCard({ trip }: TripCardProps) {
  if (!trip) {
    return (
      <View style={styles.container}>
        <View style={styles.contentTop}>
          <Text>Không có dữ liệu</Text>
        </View>
      </View>
    );
  }

  const title = trip.description || 'Chuyến chưa đặt tên';

  const organizationName = trip.externalOrganizationName || trip.organization?.name || '';
  const customerName = trip.organizationCustomer?.name || trip.externalCustomerName || '';
  const subInfo = [organizationName, customerName].filter(Boolean).join(' - ') || '—';

  // ─── content-bottom: drivers + cars gathered across every assignment ─────
  // A driver/car can repeat across turns, so dedupe by id (Map keeps first-seen order).
  const assignments = trip.tripAssignments ?? [];

  const driverNameByIdMap = new Map<string, string>();
  for (const assignment of assignments) {
    for (const member of assignment.members ?? []) {
      const name = member.organizationMember?.name;
      if (name) driverNameByIdMap.set(member.organizationMemberId, name);
    }
  }
  const driverNames = [...driverNameByIdMap.values()].join('; ');

  const carNameByIdMap = new Map<string, string>();
  for (const assignment of assignments) {
    if (assignment.car) {
      carNameByIdMap.set(assignment.car.id, assignment.car.name || 'Xe chưa đặt tên');
    }
  }
  const carNames = [...carNameByIdMap.values()].join('; ');

  const showDriverRow = driverNames.length > 0;
  const showCarRow = carNames.length > 0;
  const showContentBottom = showDriverRow || showCarRow;

  return (
    <View style={styles.container}>
      {/* Date header above the card box, like the tour/invoice list cards. */}
      <View style={styles.dateHeader}>
        <DateRangeText start={trip.startDate} end={trip.endDate} />
      </View>

      <View style={[styles.contentTop, showContentBottom && styles.contentTopAttached]}>
        <View style={styles.row}>
          <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
          <Text style={styles.statusText}>{TripStatusDisplay[trip.status]}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.subInfoText} numberOfLines={1} ellipsizeMode="tail">
            {subInfo}
          </Text>
        </View>
      </View>

      {showContentBottom && (
        <View style={styles.contentBottom}>
          {showCarRow && (
            <View style={styles.bottomRow}>
              <View style={styles.bottomLeftColumn}>
                <VinaupVan width={18} height={18} color={COLORS.teal700} />
              </View>
              <View style={styles.bottomRightColumn}>
                <Text style={styles.bottomText}>{carNames}</Text>
              </View>
            </View>
          )}
          {showDriverRow && (
            <View style={styles.bottomRow}>
              <View style={styles.bottomLeftColumn}>
                <VinaupUserCouple width={16} height={16} />
              </View>
              <View style={styles.bottomRightColumn}>
                <Text style={styles.bottomText}>{driverNames}</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm,
  },
  dateHeader: {
    marginVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentTop: {
    gap: SPACING.xs,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderWidth: 0.5,
  },
  // Square off the bottom edge so the card reads as one piece with the attached bottom.
  contentTopAttached: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  titleText: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  subInfoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  contentBottom: {
    gap: SPACING.xs,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 0.5,
    borderTopWidth: 0,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  bottomLeftColumn: {
    width: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bottomRightColumn: {
    flex: 1,
  },
  bottomText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
});
