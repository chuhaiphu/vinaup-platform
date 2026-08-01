import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import MaterialIcons from '@react-native-vector-icons/material-icons/static';
import { useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import { StyleSheet, Text, View } from 'react-native';

import { getTripById } from '@/apis/trip/trip-apis';
import VinaupUserCouple from '@/components/icons/vinaup-user-couple.native';
import VinaupVan from '@/components/icons/vinaup-van.native';
import { Avatar } from '@/components/primitives/avatar';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
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
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { CarResponse } from '@/interfaces/car-interfaces';
import { generateDateRange } from '@/utils/generator/string-generator/generate-date-range';

interface CarCardProps {
  car?: CarResponse;
}

export function CarCard({ car }: CarCardProps) {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);

  const navigateToTripDetail = async (id: string) => {
    setIsNavigating(true);
    try {
      await prefetch(() => getTripById(id), { fetchKey: `organization-trip-${id}` });
    } catch {
      // Fallback to normal navigation if prefetch fails.
    }
    router.push({
      pathname: '/(protected)/trip-detail/[tripId]',
      params: { tripId: id },
    });
    setIsNavigating(false);
  };

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

  // ─── Content bottom: drivers, then the trips of the picked period ─────
  // carAssignments is current-state (active pairings only), so a simple join is enough.
  const driverNames = (car.carAssignments ?? [])
    .map((assignment) => assignment.organizationMember?.name)
    .filter(Boolean)
    .join('; ');
  const showDriverRow = driverNames.length > 0;

  const tripAssignments = car.tripAssignments ?? [];
  const showContentBottom = showDriverRow || tripAssignments.length > 0;

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
          {tripAssignments.map((tripAssignment) => (
            <View key={tripAssignment.id} style={styles.bottomRow}>
              <View style={styles.bottomLeftColumn}>
                <MaterialIcons name="tour" size={16} color={COLORS.teal700} />
              </View>
              <View style={styles.bottomRightColumn}>
                <PressableOpacity onPress={() => navigateToTripDetail(tripAssignment.trip.id)}>
                  <Text style={styles.tripText} numberOfLines={1} ellipsizeMode="tail">
                    <Text style={styles.tripDateText}>
                      {generateDateRange(
                        tripAssignment.trip.startDate,
                        tripAssignment.trip.endDate,
                      )}
                    </Text>
                    {'  '}
                    {tripAssignment.trip.description || 'Chuyến chưa đặt tên'}
                  </Text>
                </PressableOpacity>
              </View>
            </View>
          ))}
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
  bottomText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  // Blue marks the row as a link to the trip, matching the conflict popover's trip titles.
  tripText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.blue600,
  },
  // The date is context, not part of the link target's name — it stays neutral.
  tripDateText: {
    color: COLORS.gray700,
  },
});
