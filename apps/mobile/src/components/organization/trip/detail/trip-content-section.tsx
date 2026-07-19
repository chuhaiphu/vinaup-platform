import FontAwesome from '@react-native-vector-icons/fontawesome/static';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import * as Clipboard from 'expo-clipboard';
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SimpleTextInputModal } from '@/components/commons/modals/simple-text-input-modal/simple-text-input-modal';
import { VinaupPenLineOutline } from '@/components/icons/vinaup-pen-line-outline.native';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { COLORS, FONT_SIZES, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { useToastStore } from '@/hooks/use-toast-store';
import { useTripDetailContext } from '@/providers/organization/trip/trip-detail-provider';

export function TripContentSection() {
  const [isExpanded, setIsExpanded] = useState(true);
  const contentModalRef = useRef<SlideSheetRef>(null);

  const { trip, isUpdatingTrip, handleUpdateTrip } = useTripDetailContext();

  const handleOpenModal = () => {
    contentModalRef.current?.open();
  };

  const handleCopy = async () => {
    const text = trip.content ?? '';
    await Clipboard.setStringAsync(text);
    useToastStore.getState().showToast('Đã sao chép Nội dung');
  };

  const handleConfirmUpdate = (value: string, onSuccessCallback?: () => void) => {
    handleUpdateTrip({ content: value }, () => onSuccessCallback?.());
  };

  return (
    <>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>Nội dung</Text>
            <PressableOpacity onPress={handleCopy} hitSlop={8}>
              <FontAwesome5 name="copy" size={ICON_SIZES.sm} color={COLORS.teal700} />
            </PressableOpacity>
          </View>
          <View style={styles.headerActions}>
            <PressableOpacity onPress={handleOpenModal} hitSlop={4}>
              <VinaupPenLineOutline width={16} height={16} color={COLORS.teal700} />
            </PressableOpacity>
            <PressableOpacity onPress={() => setIsExpanded(!isExpanded)} hitSlop={4}>
              <View style={styles.expandToggle}>
                <FontAwesome
                  name={isExpanded ? 'caret-down' : 'caret-up'}
                  size={ICON_SIZES.lg}
                  color={COLORS.teal700}
                />
              </View>
            </PressableOpacity>
          </View>
        </View>
        <View style={[styles.section, !isExpanded && styles.sectionCollapsed]}>
          {isExpanded && (
            <View style={styles.sectionContent}>
              <Text style={trip.content ? styles.contentText : styles.placeholderText}>
                {trip.content || '...'}
              </Text>
            </View>
          )}
        </View>
      </View>
      <SimpleTextInputModal
        title="Nội dung"
        numberOfLines={10}
        maxLength={1000}
        modalRef={contentModalRef}
        value={trip.content ?? ''}
        placeholder="Nhập Nội dung..."
        isLoading={isUpdatingTrip}
        onConfirm={(value, closeModal) => handleConfirmUpdate(value, closeModal)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.sm,
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
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
  },
  sectionCollapsed: {
    padding: 0,
  },
  sectionContent: {},
  headerTitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  expandToggle: {},
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  placeholderText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    fontStyle: 'italic',
  },
  contentText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal900,
  },
});
