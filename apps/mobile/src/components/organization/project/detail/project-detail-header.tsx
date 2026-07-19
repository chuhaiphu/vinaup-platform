import dayjs from 'dayjs';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { VinaupPenLineOutline } from '@/components/icons/vinaup-pen-line-outline.native';
import { VinaupPenLine } from '@/components/icons/vinaup-pen-line.native';
import { ProjectInfoModal } from '@/components/organization/project/modals/project-info-modal/project-info-modal';
import { ProjectOrgCustomerSelectModal } from '@/components/organization/project/modals/project-org-customer-select-modal/project-org-customer-select-modal';
import { PressableCard } from '@/components/primitives/pressable-card';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { DD_MM_DATE_FORMAT_SHORT, HH_MM_DATE_FORMAT_SHORT } from '@/constants/app-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';
import { useProjectDetailContext } from '@/providers/organization/project/project-detail-provider';

export function ProjectDetailHeader() {
  const { project, isUpdatingProject, isRefreshingProject, handleUpdateProject } =
    useProjectDetailContext();
  const modalRef = useRef<SlideSheetRef>(null);
  const selectCustomerModalRef = useRef<SlideSheetRef>(null);
  const isLoading = isUpdatingProject || isRefreshingProject;

  const organizationName = project.organization?.name ?? '';
  const customerName = project.organizationCustomer?.name ?? '';

  const getDateRangeText = () => {
    const start = dayjs(project.startDate);
    const end = dayjs(project.endDate);

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
        onPress={() => modalRef.current?.open()}
        style={{
          container: styles.cardContainer,
          card: styles.card,
        }}
      >
        <View style={styles.infoRow}>
          <View style={styles.leftInfo}>
            <Text ellipsizeMode="tail" style={styles.entityName}>
              {project.description}
            </Text>
            <View style={styles.dateRow}>{getDateRangeText()}</View>
          </View>
          <View style={styles.rightInfo}>
            <View style={styles.topRight}>
              <View style={styles.editButton}>
                <VinaupPenLine width={14} height={14} fill={COLORS.teal700} />
              </View>
            </View>
            {project.code ? <Text style={styles.codeText}>No. {project.code}</Text> : null}
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
      <ProjectInfoModal
        project={project}
        isLoading={isLoading}
        modalRef={modalRef}
        onConfirm={(data, onSuccessCallback) => handleUpdateProject(data, onSuccessCallback)}
      />
      <ProjectOrgCustomerSelectModal modalRef={selectCustomerModalRef} />
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
    gap: SPACING['2xs'],
    flex: 2,
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
