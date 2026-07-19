import Ionicons from '@react-native-vector-icons/ionicons/static';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import VinaupVan from '@/components/icons/vinaup-van.native';
import { Avatar } from '@/components/primitives/avatar';
import { SingleSelect } from '@/components/primitives/single-select';
import { SlideSheet, SlideSheetRef } from '@/components/primitives/slide-sheet';
import { CAR_STATUS, CarStatusDisplay } from '@/constants/car-constants';
import {
  AVATAR_SIZES,
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  SPACING,
} from '@/constants/style-constants';
import { CarResponse } from '@/interfaces/car-interfaces';

interface CarSelectModalProps {
  modalRef: React.RefObject<SlideSheetRef | null>;
  cars?: CarResponse[] | null;
  selectedCarId?: string | null;
  isLoading?: boolean;
  onSelect?: (car: CarResponse) => void;
  disableLockedCars?: boolean;
}

export function CarSelectModal({
  modalRef,
  cars,
  selectedCarId,
  isLoading,
  onSelect,
  disableLockedCars = true,
}: CarSelectModalProps) {
  const insets = useSafeAreaInsets();

  // If a LOCKED car is disabled, we keep it visible but push it to the bottom so assignable cars surface first.
  // Else we keep the original order of cars.
  const sortedCars = [...(cars ?? [])].sort((thisCar, nextCar) => {
    if (!disableLockedCars) return 0;
    const isThisCarLocked = thisCar.status === CAR_STATUS.LOCKED;
    const isNextCarLocked = nextCar.status === CAR_STATUS.LOCKED;

    if (isThisCarLocked === isNextCarLocked) return 0; // same status → keep order
    return isThisCarLocked ? 1 : -1; // this car is locked → push it down, else pull it up
  });

  const options = sortedCars.map((car) => ({
    value: car.id,
    label: car.name || 'Chưa có tên xe',
  }));

  const handleSelect = (carId: string) => {
    const selectedCar = cars?.find((car) => car.id === carId);
    if (!selectedCar) return;
    if (disableLockedCars && selectedCar.status === CAR_STATUS.LOCKED) return;
    modalRef.current?.close(() => {
      onSelect?.(selectedCar);
    });
  };

  return (
    <SlideSheet ref={modalRef}>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chọn xe</Text>
        </View>

        {isLoading && (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="small" color={COLORS.teal700} />
          </View>
        )}

        {!isLoading && options.length === 0 && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>Chưa có xe trong tổ chức.</Text>
          </View>
        )}

        {!isLoading && options.length > 0 && (
          <SingleSelect
            options={options}
            value={selectedCarId ?? ''}
            onSelectOption={handleSelect}
            renderOption={(option, isSelected, select) => {
              const car = cars?.find((c) => c.id === option.value);
              if (!car) return null;

              const isNotSelectable = disableLockedCars && car.status === CAR_STATUS.LOCKED;

              const carDetail =
                [
                  car.model ? `Đời ${car.model}` : null,
                  car.category,
                  car.seatCount != null ? `${car.seatCount} chỗ` : null,
                ]
                  .filter(Boolean)
                  .join(' - ') || '—';

              return (
                <Pressable
                  style={[styles.carItem, isNotSelectable && styles.carItemLocked]}
                  onPress={select}
                  disabled={isNotSelectable}
                >
                  <Avatar
                    size={AVATAR_SIZES.md}
                    imgSrc={car.featureImageUrl}
                    icon={<VinaupVan width={22} height={22} color={COLORS.teal700} />}
                  />
                  <View style={styles.carInfo}>
                    <Text style={styles.carName}>
                      {car.name || 'Chưa có tên xe'}
                      {car.manufacturer ? ` - ${car.manufacturer}` : ''}
                    </Text>
                    <Text style={styles.carDetail}>{carDetail}</Text>
                    {/* Tell the user WHY the car is greyed out, and what to fix (unlock it). */}
                    {isNotSelectable && (
                      <Text style={styles.carLockedReason}>
                        {CarStatusDisplay[CAR_STATUS.LOCKED]}
                      </Text>
                    )}
                  </View>
                  {isNotSelectable ? (
                    <Ionicons name="lock-closed" size={ICON_SIZES.lg} color={COLORS.gray600} />
                  ) : (
                    <Ionicons
                      name={isSelected ? 'radio-button-on-sharp' : 'radio-button-off-sharp'}
                      size={ICON_SIZES.lg}
                      color={isSelected ? COLORS.teal700 : COLORS.gray300}
                    />
                  )}
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </SlideSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: SPACING.lg,
  },
  header: {
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  stateText: {
    color: COLORS.gray600,
    fontSize: FONT_SIZES.sm,
  },
  carItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  carItemLocked: {
    opacity: 0.45,
  },
  carLockedReason: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.red500,
  },
  carInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  carName: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
    marginBottom: SPACING.xs,
  },
  carDetail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal900,
    opacity: 0.7,
  },
});
