import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import { StyleSheet, Text, View } from 'react-native';

import VinaupUserCouple from '@/components/icons/vinaup-user-couple.native';
import VinaupVan from '@/components/icons/vinaup-van.native';
import { Avatar } from '@/components/primitives/avatar';
import {
  CAR_OPERATIONAL_STATUS,
  CarOperationalStatusDisplay,
  CarStatusDisplay,
} from '@/constants/car-constants';
import {
  AVATAR_SIZES,
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { CarResponse } from '@/interfaces/car-interfaces';

interface CarCardProps {
  car?: CarResponse;
}

export function CarCard({ car }: CarCardProps) {
  if (!car) {
    return (
      <View style={styles.container}>
        <View style={styles.contentTop}>
          <Text>Không có dữ liệu</Text>
        </View>
      </View>
    );
  }
  // Mirror the trip-assignment display: "tên - nhà sản xuất" on top, "Đời … - loại - số chỗ" below.
  const carName = car.name ?? 'Xe chưa đặt tên';
  const title = car.manufacturer ? `${carName} - ${car.manufacturer}` : carName;
  const subInfo =
    [
      car.model ? `Đời ${car.model}` : null,
      car.category,
      car.seatCount != null ? `${car.seatCount} chỗ` : null,
    ]
      .filter(Boolean)
      .join(' - ') || '—';

  // Operational status is derived from server-side
  const operationalStatus = car.meta?.operationalStatus ?? CAR_OPERATIONAL_STATUS.RESTING;
  const operationLabel = CarOperationalStatusDisplay[operationalStatus];

  // ─── Content bottom: the drivers currently assigned to this car ─────
  // carAssignments is current-state (active pairings only), so a simple join is enough.
  // Hide the whole bottom section when no driver is assigned.
  const driverNames = (car.carAssignments ?? [])
    .map((assignment) => assignment.organizationMember?.name)
    .filter(Boolean)
    .join('; ');
  const showContentBottom = driverNames.length > 0;

  return (
    <View style={styles.container}>
      <View style={[styles.contentTop, showContentBottom && styles.contentTopAttached]}>
        <View style={styles.leftColumn}>
          <Avatar
            style={{
              container: {
                backgroundColor: COLORS.white,
                borderWidth: 0,
              },
            }}
            radius={6}
            imgSrc={car.featureImageUrl}
            size={AVATAR_SIZES.md}
            icon={<VinaupVan width={36} height={28} color={COLORS.teal700} />}
          />
        </View>
        <View style={styles.rightColumn}>
          <View style={styles.row}>
            <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
            <View style={styles.statusGroup}>
              <FontAwesome5
                iconStyle="solid"
                name="map-pin"
                size={ICON_SIZES.xs}
                color={COLORS.gray700}
              />
              <Text style={styles.operationText}>{operationLabel}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.subInfoText} numberOfLines={1} ellipsizeMode="tail">
              {subInfo}
            </Text>
            <View style={styles.statusGroup}>
              <FontAwesome5
                iconStyle="solid"
                name="tools"
                size={ICON_SIZES.xs}
                color={COLORS.gray700}
              />
              <Text style={styles.statusText}>{CarStatusDisplay[car.status]}</Text>
            </View>
          </View>
        </View>
      </View>

      {showContentBottom && (
        <View style={styles.contentBottom}>
          <View style={styles.bottomLeftColumn}>
            <VinaupUserCouple width={20} height={20} />
          </View>
          <View style={styles.bottomRightColumn}>
            <Text style={styles.driverNamesText}>{driverNames}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm,
  },
  contentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
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
  leftColumn: {
    justifyContent: 'center',
  },
  rightColumn: {
    flex: 1,
    gap: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  contentBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 0.5,
    borderTopWidth: 0,
  },
  bottomLeftColumn: {
    width: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bottomRightColumn: {
    flex: 1,
  },
  titleText: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  operationText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray700,
  },
  subInfoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  driverNamesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
});
