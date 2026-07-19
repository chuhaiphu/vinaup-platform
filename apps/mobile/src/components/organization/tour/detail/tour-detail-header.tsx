import dayjs from 'dayjs';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { VinaupPenLineOutline } from '@/components/icons/vinaup-pen-line-outline.native';
import { VinaupPenLine } from '@/components/icons/vinaup-pen-line.native';
import { TourInfoModal } from '@/components/organization/tour/detail/modals/tour-info-modal/tour-info-modal';
import { TourOrgCustomerSelectModal } from '@/components/organization/tour/detail/modals/tour-org-customer-select-modal/tour-org-customer-select-modal';
import { PressableCard } from '@/components/primitives/pressable-card';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { DD_MM_DATE_FORMAT_SHORT, HH_MM_DATE_FORMAT_SHORT } from '@/constants/app-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';
import { TourResponse } from '@/interfaces/tour-interfaces';

interface TourDetailHeaderProps {
  tour?: TourResponse;
  isLoading?: boolean;
  onConfirm?: (
    data: {
      description: string;
      startDate: string;
      endDate: string;
      code?: string;
      note?: string;
    },
    onSuccessCallback?: () => void,
  ) => void;
}

export function TourDetailHeader({ tour, isLoading, onConfirm }: TourDetailHeaderProps) {
  const modalRef = useRef<SlideSheetRef>(null);
  const selectCustomerModalRef = useRef<SlideSheetRef>(null);

  const organizationName = tour?.organization?.name ?? '';
  const customerName = tour?.organizationCustomer?.name ?? '';

  const handleOpen = () => {
    modalRef.current?.open();
  };

  const getDateRangeText = () => {
    const start = dayjs(tour?.startDate);
    const end = dayjs(tour?.endDate);

    if (start.isSame(end, 'day')) {
      return (
        <>
          <Text style={styles.dateText}>Ngày {start.format(DD_MM_DATE_FORMAT_SHORT)} </Text>
          <Text style={styles.hourText}>({start.format(HH_MM_DATE_FORMAT_SHORT)})</Text>
        </>
      );
    }
    return (
      <>
        <Text style={styles.dateText}>Từ {start.format(DD_MM_DATE_FORMAT_SHORT)} </Text>
        <Text style={styles.hourText}>({start.format(HH_MM_DATE_FORMAT_SHORT)})</Text>
        <Text style={styles.dateText}> đến {end.format(DD_MM_DATE_FORMAT_SHORT)}</Text>
        <Text style={styles.hourText}> ({end.format(HH_MM_DATE_FORMAT_SHORT)})</Text>
      </>
    );
  };

  return (
    <>
      <PressableCard
        onPress={handleOpen}
        style={{
          container: styles.cardContainer,
          card: styles.card,
        }}
      >
        <View style={styles.infoRow}>
          <View style={styles.leftInfo}>
            <Text ellipsizeMode="tail" style={styles.entityName}>
              {tour?.description}
            </Text>
            <View style={styles.dateRow}>{getDateRangeText()}</View>
          </View>
          <View style={styles.rightInfo}>
            <View style={styles.topRight}>
              <View style={styles.editButton}>
                <VinaupPenLine width={14} height={14} fill={COLORS.teal700} />
              </View>
            </View>
            {tour?.code ? <Text style={styles.codeText}>No. {tour.code}</Text> : null}
          </View>
        </View>
        <Pressable
          style={styles.orgCusRow}
          onPress={() => selectCustomerModalRef.current?.open()}
          disabled={isLoading}
        >
          <View style={styles.orgCol}>
            <Text style={styles.label}>Tổ chức</Text>
            <Text style={[styles.value, styles.valueLeft]}>{organizationName || ''}</Text>
          </View>
          <View style={styles.customerCol}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Khách hàng</Text>
              <VinaupPenLineOutline width={14} height={14} />
            </View>
            <Text numberOfLines={2} ellipsizeMode="tail" style={[styles.value, styles.valueRight]}>
              {customerName || ''}
            </Text>
          </View>
        </Pressable>
      </PressableCard>
      {tour && (
        <TourInfoModal
          tour={tour}
          isLoading={isLoading}
          modalRef={modalRef}
          onConfirm={onConfirm}
        />
      )}
      <TourOrgCustomerSelectModal modalRef={selectCustomerModalRef} />
    </>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: SPACING.sm,
  },
  card: {
    borderWidth: 0,
    gap: SPACING.md,
    borderRadius: RADIUS.lg,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
    backgroundColor: COLORS.green50,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftInfo: {
    flex: 2,
    gap: SPACING['2xs'],
  },
  rightInfo: {
    flex: 1,
    gap: SPACING['2xs'],
    justifyContent: 'space-between',
  },
  topRight: {
    flexDirection: 'row',
    gap: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  entityName: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  codeText: {
    textAlign: 'right',
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal900,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  dateText: {
    fontSize: FONT_SIZES.sm,
  },
  hourText: {
    color: COLORS.gray400,
    fontSize: FONT_SIZES.sm,
  },
  editButton: {
    alignItems: 'flex-end',
  },
  orgCusRow: {
    flexDirection: 'row',
  },
  orgCol: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  customerCol: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
  },
  value: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
    marginTop: SPACING['2xs'],
  },
  valueLeft: {
    textAlign: 'left',
  },
  valueRight: {
    textAlign: 'right',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
});
