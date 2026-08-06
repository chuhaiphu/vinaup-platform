import type { ImagePickerAsset } from 'expo-image-picker';
import { StyleSheet, View } from 'react-native';

import { removeCarAdditionalImage, uploadCarAdditionalImage } from '@/apis/upload/upload-apis';
import { ImageUpload } from '@/components/commons/image-upload/image-upload';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants/style-constants';
import { useImageUpload } from '@/hooks/use-image-upload';
import { useCarDetailContext } from '@/providers/organization/car/car-detail-provider';

const MAX_ADDITIONAL_IMAGES = 4;

export function CarAdditionalImagesSection() {
  const { car, refreshCar, isRefreshingCar } = useCarDetailContext();
  const { upload, remove, isUploading, deletingImage } = useImageUpload({
    uploadFn: (asset) => uploadCarAdditionalImage(car.id, asset),
    deleteFn: (imageUrl) => removeCarAdditionalImage(car.id, imageUrl),
  });

  const isBusy = isUploading || deletingImage !== null || isRefreshingCar;

  const handlePick = (asset: ImagePickerAsset) => upload(asset, refreshCar);

  const handleRemove = (url: string) => remove(url, refreshCar);

  return (
    <View style={styles.sectionContainer}>
      {/* <View style={styles.sectionHeader}>
        <Text style={styles.headerTitle}>Ảnh phụ đính kèm</Text>
      </View> */}
      <View style={styles.section}>
        <View style={styles.imageRow}>
          {car.additionalImageUrls.map((url) => (
            <ImageUpload
              key={url}
              imageUri={url}
              disabled={isBusy}
              isLoading={deletingImage === url}
              confirmRemoveMessage="Xoá ảnh này?"
              onRemove={() => handleRemove(url)}
            />
          ))}
          {car.additionalImageUrls.length < MAX_ADDITIONAL_IMAGES && (
            <ImageUpload disabled={isBusy} isLoading={isUploading} onPick={handlePick} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    borderColor: COLORS.teal700,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray300,
    paddingBottom: SPACING.xs,
  },
  section: {
    // marginTop: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    padding: SPACING.xs,
  },
});
