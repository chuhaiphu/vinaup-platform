import { type ApiError } from 'fetchwire';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { TourDetailHeader } from '@/components/organization/tour/detail/tour-detail-header';
import { TourImplementationDescriptionSection } from '@/components/organization/tour/tour-implementation/sections/tour-implementation-description-section';
import { TourImplementationMembersAssignedSection } from '@/components/organization/tour/tour-implementation/sections/tour-implementation-members-assigned-section';
import { OutlinedTextInput } from '@/components/primitives/outlined-text-input';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';
import { useFormatIntegerInput } from '@/hooks/use-format-integer-input';
import { useTourDetailContext } from '@/providers/organization/tour/tour-detail-provider';
import { useTourImplementationContext } from '@/providers/organization/tour/tour-implementation-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';
import { generateRawDigitString } from '@/utils/generator/string-generator/generate-raw-digit-string';

export function TourImplementationHomeTabPanel() {
  const { tour, isRefreshingTour, isUpdatingTour, handleUpdateTour } = useTourDetailContext();
  const { tourImplementation, updateTourImplementation, isUpdatingImplementation } =
    useTourImplementationContext();

  const [adultCountRaw, setAdultCountRaw] = useState(
    generateRawDigitString(tourImplementation.adultTicketCount ?? 0),
  );
  const [childCountRaw, setChildCountRaw] = useState(
    generateRawDigitString(tourImplementation.childTicketCount ?? 0),
  );
  const [infantCountRaw, setInfantCountRaw] = useState(
    generateRawDigitString(tourImplementation.infantTicketCount ?? 0),
  );

  const { displayValue: adultCountDisplay, onDisplayValueChange: onAdultCountChange } =
    useFormatIntegerInput(adultCountRaw, setAdultCountRaw);
  const { displayValue: childCountDisplay, onDisplayValueChange: onChildCountChange } =
    useFormatIntegerInput(childCountRaw, setChildCountRaw);
  const { displayValue: infantCountDisplay, onDisplayValueChange: onInfantCountChange } =
    useFormatIntegerInput(infantCountRaw, setInfantCountRaw);

  const handleUpdateError = (error: ApiError) => {
    Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi cập nhật.'));
  };

  const commitAdultCount = () =>
    updateTourImplementation(
      { adultTicketCount: Number(adultCountRaw) || 0 },
      { onError: handleUpdateError },
    );
  const commitChildCount = () =>
    updateTourImplementation(
      { childTicketCount: Number(childCountRaw) || 0 },
      { onError: handleUpdateError },
    );
  const commitInfantCount = () =>
    updateTourImplementation(
      { infantTicketCount: Number(infantCountRaw) || 0 },
      { onError: handleUpdateError },
    );

  // ─── Tổng số khách ─────
  // Why: tính trực tiếp từ raw để cập nhật ngay khi gõ, không chờ commit về server.
  const adultCount = Number(adultCountRaw) || 0;
  const childCount = Number(childCountRaw) || 0;
  const infantCount = Number(infantCountRaw) || 0;
  const totalCount = adultCount + childCount + infantCount;

  return (
    <>
      <TourDetailHeader
        tour={tour ?? undefined}
        isLoading={isUpdatingTour || isRefreshingTour}
        onConfirm={(data, onSuccessCallback) => handleUpdateTour(data, onSuccessCallback)}
      />
      <View style={styles.ticketInfoContainer}>
        <View style={styles.innerContainer}>
          <View style={styles.inputRow}>
            <OutlinedTextInput
              style={{ container: styles.countInputContainer, input: styles.countInput }}
              value={adultCountDisplay}
              onChangeText={onAdultCountChange}
              onBlur={commitAdultCount}
              // isLoading={isUpdatingImplementation}
              keyboardType="numeric"
              placeholder="0"
              rightSection={<Text style={styles.countLabel}>Khách lớn</Text>}
            />
            <OutlinedTextInput
              style={{ container: styles.countInputContainer, input: styles.countInput }}
              value={childCountDisplay}
              onChangeText={onChildCountChange}
              onBlur={commitChildCount}
              // isLoading={isUpdatingImplementation}
              keyboardType="numeric"
              placeholder="0"
              rightSection={<Text style={styles.countLabel}>Trẻ em</Text>}
            />
            <OutlinedTextInput
              style={{ container: styles.countInputContainer, input: styles.countInput }}
              value={infantCountDisplay}
              onChangeText={onInfantCountChange}
              onBlur={commitInfantCount}
              // isLoading={isUpdatingImplementation}
              keyboardType="numeric"
              placeholder="0"
              rightSection={<Text style={styles.countLabel}>Em bé</Text>}
            />
            <Text style={styles.summaryText}>= {totalCount}</Text>
          </View>
        </View>
      </View>
      <TourImplementationDescriptionSection />
      <TourImplementationMembersAssignedSection />
    </>
  );
}

const styles = StyleSheet.create({
  ticketInfoContainer: {
    paddingHorizontal: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  innerContainer: {
    // padding: SPACING.sm,
    // borderRadius: RADIUS.md,
    // borderWidth: 1.5,
    // boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.3)',
    // borderColor: COLORS.teal700,
    gap: SPACING.sm,
  },
  summaryText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'left',
    color: COLORS.teal900,
  },
  inputRow: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: SPACING.xs,
    alignItems: 'center',
  },
  countInputContainer: {
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.white,
    gap: SPACING.xs,
  },
  countLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal900,
  },
  countInput: {
    fontSize: FONT_SIZES.base,
  },
});
