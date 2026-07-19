import dayjs from 'dayjs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DD_MM_DATE_FORMAT_SHORT, HH_MM_DATE_FORMAT_SHORT } from '@/constants/app-constants';
import { ProjectStatusDisplay } from '@/constants/project-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';
import { ProjectResponse } from '@/interfaces/project-interfaces';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';

interface ProjectCardProps {
  project?: ProjectResponse;
  onPress?: () => void;
  totalRemaining?: number;
}

export function ProjectCard({ project, onPress, totalRemaining }: ProjectCardProps) {
  const getProjectInfoText = () => {
    if (!project) return '';
    if (project.organizationId) {
      return `${project.organization?.name || ''}`;
    }
    return `${project.externalOrganizationName || ''}`;
  };

  if (!project) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text>Không có dữ liệu</Text>
        </View>
      </View>
    );
  }

  const getDateRangeText = () => {
    const start = dayjs(project.startDate);
    const end = dayjs(project.endDate);
    if (start.isSame(end, 'day')) {
      return (
        <Text style={styles.dateRangeText}>
          {start.format(DD_MM_DATE_FORMAT_SHORT)}{' '}
          <Text style={styles.hourText}>({start.format(HH_MM_DATE_FORMAT_SHORT)})</Text>
        </Text>
      );
    }
    return (
      <Text style={styles.dateRangeText}>
        {start.format(DD_MM_DATE_FORMAT_SHORT)}{' '}
        <Text style={styles.hourText}>({start.format(HH_MM_DATE_FORMAT_SHORT)})</Text>
        {' - '}
        {end.format(DD_MM_DATE_FORMAT_SHORT)}{' '}
        <Text style={styles.hourText}>({end.format(HH_MM_DATE_FORMAT_SHORT)})</Text>
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerHeader}>
        <View style={styles.left}>{getDateRangeText()}</View>
        <View style={styles.right}>
          <Text style={styles.statusText}>{ProjectStatusDisplay[project.status]}</Text>
        </View>
      </View>
      <Pressable onPress={onPress}>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.descriptionContainer}>
              <Text ellipsizeMode="tail" numberOfLines={2} style={styles.descriptionText}>
                {project.description}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.totalPriceText}>
                {generateLocaleFormatString(totalRemaining ?? 0, 'vi-VN')}
              </Text>
              <Text style={styles.unitText}>đ</Text>
            </View>
          </View>
          <View style={styles.bottomRow}>
            <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">
              {getProjectInfoText()}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  innerHeader: {
    marginVertical: SPACING.sm,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  left: {
    flexDirection: 'row',
    gap: SPACING.xs,
    alignItems: 'center',
  },
  right: {},
  dateRangeText: {
    fontSize: FONT_SIZES.sm,
  },
  hourText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal900,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  descriptionContainer: {
    flex: 2,
  },
  descriptionText: {
    fontSize: FONT_SIZES.base,
    lineHeight: 22,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  totalPriceText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray700,
  },
  unitText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
});
