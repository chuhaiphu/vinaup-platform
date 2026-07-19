import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';
import dayjs, { Dayjs } from 'dayjs';
import type { ImagePickerAsset } from 'expo-image-picker';
import { useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ImageUpload } from '@/components/commons/image-upload/image-upload';
import { CarPropertySelectModal } from '@/components/organization/car/modals/car-property-select-modal/car-property-select-modal';
import { ConfirmSlideSheetContentRef } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { DateTimePicker } from '@/components/primitives/date-time-picker';
import { FlatTextInput } from '@/components/primitives/flat-text-input';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SingleSelectOption } from '@/components/primitives/single-select/types';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import {
  CAR_CATEGORY_LIST,
  CAR_MANUFACTURER_LIST,
  getCarSeatCountList,
  getCarYearList,
} from '@/constants/car-constants';
import {
  AVATAR_SIZES,
  COLORS,
  FONT_SIZES,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';

import { CarInfoModalData } from './car-info-modal';

type CarAttribute = 'manufacturer' | 'model' | 'category' | 'seatCount';

interface CarInfoModalContentProps {
  carName?: string | null;
  carYoutubeUrl?: string | null;
  carFeatureImageUrl?: string | null;
  carManufacturer?: string | null;
  carModel?: string | null;
  carCategory?: string | null;
  carSeatCount?: number | null;
  carInServiceDate?: string | null;
  isLoading?: boolean;
  onSubmit?: (data: CarInfoModalData) => void;
  ref?: React.RefObject<ConfirmSlideSheetContentRef | null>;
}

export function CarInfoModalContent({
  carName,
  carYoutubeUrl,
  carFeatureImageUrl,
  carManufacturer,
  carModel,
  carCategory,
  carSeatCount,
  carInServiceDate,
  isLoading = false,
  onSubmit,
  ref,
}: CarInfoModalContentProps) {
  const [name, setName] = useState(carName ?? '');
  const [youtubeUrl, setYoutubeUrl] = useState(carYoutubeUrl ?? '');
  const [pickedImage, setPickedImage] = useState<ImagePickerAsset | null>(null);

  const [manufacturer, setManufacturer] = useState(carManufacturer ?? '');
  const [model, setModel] = useState(carModel ?? '');
  const [category, setCategory] = useState(carCategory ?? '');
  const [seatCount, setSeatCount] = useState(carSeatCount != null ? String(carSeatCount) : '');
  // null = chưa đặt ngày; chỉ gửi lên API khi người dùng thực sự chọn (giữ nguyên giá trị null cũ).
  const [inServiceDate, setInServiceDate] = useState<Dayjs | null>(
    carInServiceDate ? dayjs(carInServiceDate) : null,
  );

  const [activeAttribute, setActiveAttribute] = useState<CarAttribute | null>(null);
  const optionSelectModalRef = useRef<SlideSheetRef | null>(null);

  const manufacturerOptions: SingleSelectOption[] = CAR_MANUFACTURER_LIST.map((item) => ({
    label: item,
    value: item,
  }));
  const categoryOptions: SingleSelectOption[] = CAR_CATEGORY_LIST.map((item) => ({
    label: item,
    value: item,
  }));
  const yearOptions: SingleSelectOption[] = getCarYearList().map((year) => ({
    label: String(year),
    value: String(year),
  }));
  const seatCountOptions: SingleSelectOption[] = getCarSeatCountList().map((count) => ({
    label: `${count} chỗ`,
    value: String(count),
  }));

  const attributeConfig: Record<
    CarAttribute,
    {
      title: string;
      options: SingleSelectOption[];
      value: string;
      onConfirm: (value: string) => void;
    }
  > = {
    manufacturer: {
      title: 'Hãng xe',
      options: manufacturerOptions,
      value: manufacturer,
      onConfirm: setManufacturer,
    },
    model: { title: 'Đời xe', options: yearOptions, value: model, onConfirm: setModel },
    category: {
      title: 'Kiểu xe',
      options: categoryOptions,
      value: category,
      onConfirm: setCategory,
    },
    seatCount: {
      title: 'Số chỗ',
      options: seatCountOptions,
      value: seatCount,
      onConfirm: setSeatCount,
    },
  };

  const attributeRowList: { key: CarAttribute; label: string; displayValue: string }[] = [
    { key: 'manufacturer', label: 'Hãng xe', displayValue: manufacturer },
    { key: 'model', label: 'Đời xe', displayValue: model },
    { key: 'category', label: 'Kiểu xe', displayValue: category },
    { key: 'seatCount', label: 'Số chỗ', displayValue: seatCount ? `${seatCount} chỗ` : '' },
  ];

  const activeConfig = activeAttribute ? attributeConfig[activeAttribute] : null;

  const handleOpenAttribute = (attribute: CarAttribute) => {
    if (isLoading) return;
    setActiveAttribute(attribute);
    optionSelectModalRef.current?.open();
  };

  const handleConfirm = () => {
    onSubmit?.({
      name: name.trim() || undefined,
      youtubeUrl: youtubeUrl.trim() || undefined,
      manufacturer: manufacturer.trim() || undefined,
      model: model.trim() || undefined,
      category: category.trim() || undefined,
      // Empty -> omit; otherwise parse. Avoid `Number(x) || undefined`, which turns a
      // legitimate 0 into undefined and silently drops it.
      seatCount: seatCount.trim() === '' ? undefined : Number(seatCount),
      inServiceDate: inServiceDate ? inServiceDate.toISOString() : undefined,
      pickedImage: pickedImage ?? undefined,
    });
  };

  useImperativeHandle(ref, () => ({ submit: handleConfirm }));

  return (
    <>
      <FlatTextInput
        label="Tên / Biển số xe"
        value={name}
        onChangeText={setName}
        alignLabel="left"
        alignValue="left"
        placeholder="..."
        maxLength={40}
        editable={!isLoading}
      />

      <FlatTextInput
        label="Link Youtube"
        value={youtubeUrl}
        onChangeText={setYoutubeUrl}
        alignLabel="left"
        alignValue="left"
        keyboardType="url"
        placeholder="https://..."
        editable={!isLoading}
      />

      <View style={styles.avatarSection}>
        <View style={styles.avatarTitleContainer}>
          <Text style={styles.avatarTitle}>Ảnh đại diện</Text>
          <Text style={styles.avatarSubtitle}>(png, jpg, jpeg; Size &lt; 2Mb)</Text>
        </View>
        <View style={styles.avatarUploadRow}>
          <ImageUpload
            imageUri={pickedImage?.uri ?? carFeatureImageUrl}
            size={AVATAR_SIZES.lg}
            disabled={isLoading}
            onPick={setPickedImage}
            onRemove={() => setPickedImage(null)}
          />
        </View>
      </View>

      <View style={styles.attributeTitleRow}>
        <Text style={styles.attributeTitle}>Thuộc tính</Text>
      </View>
      <View style={styles.attributeGroupContainer}>
        {attributeRowList.map((row, index) => (
          <View key={row.key}>
            {index > 0 && <View style={styles.divider} />}
            <PressableOpacity
              style={styles.attributeRow}
              onPress={() => handleOpenAttribute(row.key)}
              disabled={isLoading}
            >
              <Text style={styles.attributeLabel}>{row.label}</Text>
              <View style={styles.attributeValueContainer}>
                <Text
                  style={[
                    styles.attributeValue,
                    !row.displayValue && styles.attributeValuePlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {row.displayValue || 'Chọn...'}
                </Text>
                <FontAwesome6
                  iconStyle="solid"
                  name="caret-down"
                  size={ICON_SIZES.md}
                  color={COLORS.teal700}
                />
              </View>
            </PressableOpacity>
          </View>
        ))}

        <View style={styles.divider} />
        <View style={styles.attributeRow}>
          <Text style={styles.attributeLabel}>Ngày bắt đầu sử dụng</Text>
          <DateTimePicker
            mode="date"
            value={inServiceDate}
            onChange={setInServiceDate}
            displayFormat="DD/MM/YYYY"
            placeholder="Chọn ngày"
            disabled={isLoading}
            style={{ dateText: styles.attributeValue }}
            rightSection={
              <FontAwesome6
                iconStyle="solid"
                name="caret-down"
                size={ICON_SIZES.md}
                color={COLORS.teal700}
              />
            }
          />
        </View>
      </View>

      <CarPropertySelectModal
        modalRef={optionSelectModalRef}
        title={activeConfig?.title ?? ''}
        options={activeConfig?.options ?? []}
        value={activeConfig?.value ?? ''}
        onConfirm={(value) => activeConfig?.onConfirm(value)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    marginVertical: SPACING.sm,
  },
  avatarUploadRow: {
    flexDirection: 'row',
  },
  avatarTitleContainer: {
    marginBottom: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  avatarSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray400,
  },
  attributeTitleRow: {
    marginVertical: SPACING.xs,
  },
  attributeTitle: {
    fontSize: FONT_SIZES.base,
  },
  attributeGroupContainer: {
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  attributeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  attributeLabel: {
    fontSize: FONT_SIZES.base,
    color: '#333',
  },
  attributeValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginLeft: SPACING.md,
  },
  attributeValue: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
  },
  attributeValuePlaceholder: {
    color: COLORS.gray400,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray300,
    width: '100%',
  },
});
