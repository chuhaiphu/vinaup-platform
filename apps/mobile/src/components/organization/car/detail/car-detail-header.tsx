import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { uploadCarFeatureImage } from '@/apis/upload/upload-apis';
import { VinaupPenLine } from '@/components/icons/vinaup-pen-line.native';
import VinaupVan from '@/components/icons/vinaup-van.native';
import {
  CarInfoModal,
  CarInfoModalData,
} from '@/components/organization/car/modals/car-info-modal/car-info-modal';
import { Avatar } from '@/components/primitives/avatar';
import { PressableCard } from '@/components/primitives/pressable-card';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import {
  AVATAR_SIZES,
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { useImageUpload } from '@/hooks/use-image-upload';
import { useCarDetailContext } from '@/providers/organization/car/car-detail-provider';

export function CarDetailHeader() {
  const { car, isUpdatingCar, isRefreshingCar, handleUpdateCar } = useCarDetailContext();
  const modalRef = useRef<SlideSheetRef>(null);
  const { upload, isUploading } = useImageUpload({
    uploadFn: (asset) => uploadCarFeatureImage(car.id, asset),
  });
  const isLoading = isUpdatingCar || isRefreshingCar || isUploading;

  const title = car.name ?? 'Xe chưa đặt tên';
  const seatCountLabel = car.seatCount != null ? `${car.seatCount} chỗ` : null;
  const manufacturerModelLine =
    [car.manufacturer, car.model ? `Đời ${car.model}` : null].filter(Boolean).join(' - ') || '—';
  const categorySeatLine = [car.category, seatCountLabel].filter(Boolean).join(' - ') || '—';

  const handleConfirm = async (data: CarInfoModalData, closeModal: () => void) => {
    if (data.pickedImage && !(await upload(data.pickedImage))) return;

    handleUpdateCar(
      {
        name: data.name,
        youtubeUrl: data.youtubeUrl,
        manufacturer: data.manufacturer,
        model: data.model,
        category: data.category,
        seatCount: data.seatCount,
        inServiceDate: data.inServiceDate,
      },
      closeModal,
    );
  };

  return (
    <>
      <PressableCard
        onPress={() => modalRef.current?.open()}
        style={{
          container: styles.cardContainer,
          card: styles.card,
        }}
      >
        <View style={styles.infoContainer}>
          <View style={styles.leftColumn}>
            <Avatar
              style={{
                container: {
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderStyle: 'dashed',
                },
              }}
              radius={8}
              imgSrc={car.featureImageUrl}
              size={AVATAR_SIZES.lg}
              icon={<VinaupVan width={48} height={44} color={COLORS.teal700} />}
            />
          </View>

          {/* INFO COLUMN */}
          <View style={styles.rightColumn}>
            <View style={styles.infoRow}>
              <View style={styles.leftInfo}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.entityName}>
                  {title}
                </Text>
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.subInfoText}>
                  {manufacturerModelLine}
                </Text>
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.subInfoText}>
                  {categorySeatLine}
                </Text>
              </View>
              <View style={styles.editButton}>
                <VinaupPenLine width={14} height={14} fill={COLORS.teal700} />
              </View>
            </View>
          </View>
        </View>
      </PressableCard>

      <CarInfoModal car={car} isLoading={isLoading} modalRef={modalRef} onConfirm={handleConfirm} />
    </>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  card: {
    borderWidth: 0,
    gap: SPACING.md,
    borderRadius: RADIUS.lg,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
    backgroundColor: COLORS.green50,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  leftColumn: {
    justifyContent: 'center',
  },
  rightColumn: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  leftInfo: {
    flex: 1,
    gap: SPACING['2xs'],
  },
  entityName: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  subInfoText: {
    fontSize: FONT_SIZES.sm,
  },
  editButton: {
    alignItems: 'flex-end',
  },
});
