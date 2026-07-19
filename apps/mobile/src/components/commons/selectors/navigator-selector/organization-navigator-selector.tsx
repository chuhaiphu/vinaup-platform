import Ionicons from '@react-native-vector-icons/ionicons/static';
import Octicons from '@react-native-vector-icons/octicons/static';
import { Href, useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import VinaupCircleHorizontalHalfArrow from '@/components/icons/vinaup-circle-horizontal-half-arrow.native';
import VinaupInfoCircle from '@/components/icons/vinaup-info-circle.native';
import VinaupPlusMinusMultiplyEqual from '@/components/icons/vinaup-plus-minus-multiply-equal.native';
import VinaupPlusMinus from '@/components/icons/vinaup-plus-minus.native';
import VinaupSelector from '@/components/icons/vinaup-selector.native';
import VinaupSigningPenWithFrame from '@/components/icons/vinaup-signing-pen-with-frame.native';
import VinaupUtilityShape from '@/components/icons/vinaup-utility-shape.native';
import VinaupVan from '@/components/icons/vinaup-van.native';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SingleSelect, SingleSelectOption } from '@/components/primitives/single-select';
import { SlideSheet, SlideSheetRef } from '@/components/primitives/slide-sheet';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';

export default function OrganizationNavigatorSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();
  const sheetRef = useRef<SlideSheetRef>(null);
  const insets = useSafeAreaInsets();

  const navItems: SingleSelectOption[] = [
    {
      value: `/organization/${organizationId}/invoice`,
      label: 'Hoá đơn',
      leftSection: <VinaupPlusMinus width={26} height={26} color={COLORS.teal700} />,
    },
    {
      value: `/organization/${organizationId}/project`,
      label: 'Dự án',
      leftSection: <VinaupPlusMinusMultiplyEqual width={26} height={26} color={COLORS.teal700} />,
    },
    {
      value: `/organization/${organizationId}/tour`,
      label: 'Tour',
      leftSection: (
        <VinaupCircleHorizontalHalfArrow width={26} height={26} color={COLORS.teal700} />
      ),
    },
    {
      value: `/organization/${organizationId}/booking`,
      label: 'Booking',
      leftSection: <VinaupSigningPenWithFrame width={26} height={26} color={COLORS.teal700} />,
    },
    {
      value: `/organization/${organizationId}/car`,
      label: 'Xe',
      leftSection: <VinaupVan width={26} height={26} color={COLORS.teal700} />,
    },
    {
      value: `/organization/${organizationId}/profile`,
      label: 'Tổ chức',
      leftSection: <Octicons name="people" size={24} color={COLORS.teal700} />,
    },
  ];

  const handleNavigation = (path: string) => {
    router.navigate(path as Href);
  };

  const renderCustomHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        <VinaupUtilityShape />
        <Text style={styles.headerTitle}>Tiện ích</Text>
      </View>
      <PressableOpacity>
        <Ionicons name="settings-outline" size={ICON_SIZES.lg} color={COLORS.teal700} />
      </PressableOpacity>
    </View>
  );

  const renderCustomFooter = () => (
    <View style={styles.additionalInfo}>
      {/* Cột trái: Chỉ chứa Icon vừa đủ không gian */}
      <View style={styles.footerLeftColumn}>
        <VinaupInfoCircle width={28} height={28} />
      </View>

      {/* Cột phải: Chiếm phần không gian còn lại */}
      <View style={styles.footerRightColumn}>
        {/* Top Header */}
        <Text style={styles.topHeaderText}>Thông tin VinaUp</Text>

        {/* Bottom Header: Chứa 2 text trên 1 hàng có vạch ngăn cách */}
        <View style={styles.bottomHeader}>
          <Text style={styles.bottomHeaderText}>Giới thiệu</Text>
          <View style={styles.verticalDivider} />
          <Text style={styles.bottomHeaderText}>Hướng dẫn sử dụng</Text>
        </View>
      </View>
    </View>
  );

  const renderCustomOption = (
    option: SingleSelectOption,
    isSelected: boolean,
    onSelect: () => void,
  ) => {
    return (
      <PressableOpacity
        style={[styles.optionCard, isSelected && styles.optionCardSelected]}
        onPress={onSelect}
      >
        <View style={styles.optionContent}>
          {option.leftSection}
          <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
            {option.label}
          </Text>
        </View>
      </PressableOpacity>
    );
  };

  return (
    <>
      <PressableOpacity onPress={() => sheetRef.current?.open()}>
        <VinaupSelector width={28} height={28} />
      </PressableOpacity>
      <SlideSheet ref={sheetRef} heightPercentage={0.6}>
        {renderCustomHeader()}
        <SingleSelect
          options={navItems}
          value={pathname}
          onSelectOption={(val) => sheetRef.current?.close(() => handleNavigation(val))}
          renderOption={renderCustomOption}
        />
        {renderCustomFooter()}
        <View style={{ height: insets.bottom }} />
      </SlideSheet>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  optionCard: {
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  optionCardSelected: {
    backgroundColor: '#E8F2F2',
    borderWidth: 1,
    borderColor: COLORS.teal700,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  optionText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.teal700,
  },
  optionTextSelected: {
    fontWeight: FONT_WEIGHTS.medium,
  },
  additionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.yellow100,
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
  },
  footerLeftColumn: {
    alignSelf: 'flex-start',
  },
  footerRightColumn: {
    flex: 1,
    gap: SPACING.xs,
  },
  topHeaderText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray600,
  },
  bottomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  bottomHeaderText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
  },
  verticalDivider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.gray600,
    opacity: 0.4,
  },
});
