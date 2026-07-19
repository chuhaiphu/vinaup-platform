import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { type ApiError } from 'fetchwire';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import VinaupAddNew from '@/components/icons/vinaup-add-new.native';
import { VinaupPenLineOutline } from '@/components/icons/vinaup-pen-line-outline.native';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SingleSelect, SingleSelectOption } from '@/components/primitives/single-select';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { ReceiptPaymentCategoryResponse } from '@/interfaces/receipt-payment-interfaces';
import {
  ReceiptPaymentCategoryProvider,
  useReceiptPaymentCategoryContext,
} from '@/providers/commons/receipt-payment/receipt-payment-category-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

import { ReceiptPaymentCategoryCreateModal } from '../receipt-payment-category-input/receipt-payment-category-create-modal';
import { ReceiptPaymentCategoryUpdateModal } from '../receipt-payment-category-input/receipt-payment-category-update-modal';

interface ReceiptPaymentCategorySelectModalContentProps {
  selectedCategoryId?: string | null;
  organizationId?: string;
  onSelectAndClose?: (category: ReceiptPaymentCategoryResponse | null) => void;
  onCategoryUpdated?: (category: ReceiptPaymentCategoryResponse) => void;
  onCategoryDeleted?: (categoryId: string) => void;
  onCloseRequest?: () => void;
}

function ReceiptPaymentCategorySelectModalContentInner({
  selectedCategoryId,
  organizationId,
  onSelectAndClose,
  onCategoryUpdated,
  onCategoryDeleted,
  onCloseRequest,
}: ReceiptPaymentCategorySelectModalContentProps) {
  const insets = useSafeAreaInsets();
  const createModalRef = useRef<SlideSheetRef | null>(null);
  const updateModalRef = useRef<SlideSheetRef | null>(null);

  const { categories, isLoading, deleteCategory } = useReceiptPaymentCategoryContext();

  const [editingCategory, setEditingCategory] = useState<ReceiptPaymentCategoryResponse | null>(
    null,
  );
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const options: SingleSelectOption[] = (categories ?? [])
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .sort((a, b) => Number(b.isSystem) - Number(a.isSystem))
    .map((cat) => ({
      value: cat.id,
      label: cat.name,
    }));

  const handleSelect = (value: string) => {
    const selectedCategory = categories?.find((cat) => cat.id === value) ?? null;
    onSelectAndClose?.(selectedCategory);
  };

  const handleOpenUpdateModal = (categoryId: string | null) => {
    const category = categories?.find((cat) => cat.id === categoryId);
    if (category) {
      setEditingCategory(category);
      updateModalRef.current?.open();
    }
  };

  const handleDeleteCategory = (categoryId: string | null) => {
    if (!categoryId) return;
    Alert.alert('Xoá phân loại', `Bạn có chắc muốn xoá không?`, [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: () => {
          setDeletingCategoryId(categoryId);
          deleteCategory(categoryId, {
            onError: (error: ApiError) => {
              Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi xoá phân loại.'));
            },
          });
          setDeletingCategoryId(null);
          if (categoryId === selectedCategoryId) {
            onCategoryDeleted?.(categoryId);
          }
        },
      },
    ]);
  };

  return (
    <>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Phân loại</Text>
          <PressableOpacity
            style={styles.createButtonContainer}
            onPress={() => createModalRef.current?.open()}
            hitSlop={8}
          >
            <Text style={styles.createButtonText}>Tạo mới</Text>
            <VinaupAddNew
              width={28}
              height={28}
              iconColor={COLORS.white}
              backgroundColor={COLORS.teal700}
            />
          </PressableOpacity>
        </View>

        {isLoading && (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="small" color={COLORS.teal700} />
          </View>
        )}

        {!isLoading && options.length === 0 && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>Chưa có thể loại.</Text>
          </View>
        )}

        {!isLoading && options.length > 0 && (
          <SingleSelect
            options={options}
            value={selectedCategoryId ?? ''}
            onSelectOption={handleSelect}
            renderOption={(option, isSelected, select) => {
              if (!option.value) return null;
              const category = categories?.find((c) => c.id === option.value);
              const isSystem = category?.isSystem ?? false;

              return (
                <Pressable
                  key={option.value}
                  style={({ pressed }) => [
                    styles.optionRow,
                    (pressed || isSelected) && styles.optionRowActive,
                  ]}
                  onPress={select}
                >
                  <View>
                    {!isSystem && (
                      <View style={styles.actions}>
                        {deletingCategoryId === option.value ? (
                          <ActivityIndicator size={18} color={COLORS.teal700} />
                        ) : (
                          <>
                            <PressableOpacity
                              onPress={() => handleDeleteCategory(option.value)}
                              hitSlop={8}
                            >
                              <FontAwesome5
                                name="trash-alt"
                                size={ICON_SIZES.sm}
                                color={COLORS.teal700}
                              />
                            </PressableOpacity>
                            <PressableOpacity
                              onPress={() => handleOpenUpdateModal(option.value)}
                              hitSlop={8}
                            >
                              <VinaupPenLineOutline
                                width={18}
                                height={18}
                                style={{ transform: [{ scaleX: -1 }] }}
                              />
                            </PressableOpacity>
                          </>
                        )}
                      </View>
                    )}
                  </View>
                  <View style={styles.optionRight}>
                    <Text style={styles.optionLabel} numberOfLines={1}>
                      {option.label}
                    </Text>
                    <Ionicons
                      name={isSelected ? 'radio-button-on-sharp' : 'radio-button-off-sharp'}
                      size={ICON_SIZES.lg}
                      color={isSelected ? COLORS.teal700 : COLORS.gray300}
                    />
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </View>

      <ReceiptPaymentCategoryCreateModal
        modalRef={createModalRef}
        existingCategoryNames={(categories ?? []).map((c) => c.name)}
        onCreated={(category) => {
          if (category) onSelectAndClose?.(category);
        }}
      />

      <ReceiptPaymentCategoryUpdateModal
        modalRef={updateModalRef}
        existingCategoryNames={(categories ?? []).map((c) => c.name)}
        currentCategory={editingCategory}
        onUpdated={(updated) => {
          if (updated && updated.id === selectedCategoryId) {
            onCategoryUpdated?.(updated);
          }
        }}
      />
    </>
  );
}

export function ReceiptPaymentCategorySelectModalContent(
  props: ReceiptPaymentCategorySelectModalContentProps,
) {
  return (
    <ReceiptPaymentCategoryProvider organizationId={props.organizationId}>
      <ReceiptPaymentCategorySelectModalContentInner {...props} />
    </ReceiptPaymentCategoryProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  createButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  createButtonText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xl,
  },
  stateText: {
    color: COLORS.gray600,
    fontSize: FONT_SIZES.sm,
  },
  optionRow: {
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  optionRowActive: {
    backgroundColor: '#F2FBFA',
    paddingHorizontal: SPACING.lg,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  optionLabel: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
    marginRight: SPACING.xs,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
