import { StyleSheet } from 'react-native';

import VinaupLeftRightArrows from '@/components/icons/vinaup-left-right-arrows.native';
import { TextToggler } from '@/components/primitives/text-toggler';
import { ATTENDANCE_MODE } from '@/constants/attendance-constants';
import { COLORS, FONT_SIZES } from '@/constants/style-constants';
import { useOrganizationAttendancePunchContext } from '@/providers/organization/attendance/organization-attendance-punch-provider';

export function AttendanceModeToggler() {
  const { attendanceMode, openAttendanceRecord, isPunchPending, handleToggleAttendanceMode } =
    useOrganizationAttendancePunchContext();

  const isLocked = Boolean(openAttendanceRecord);
  const isDisabled = isLocked || isPunchPending;
  const currentIndex = isLocked || attendanceMode === ATTENDANCE_MODE.CHECK_IN_OUT ? 1 : 0;
  const arrowColor = isDisabled ? COLORS.gray300 : undefined;

  return (
    <TextToggler
      textPair={['In', 'In + Out']}
      currentIndex={currentIndex}
      disabled={isDisabled}
      onToggle={handleToggleAttendanceMode}
      style={{ text: styles.togglerText }}
      iconPosition="right"
      iconPair={[
        <VinaupLeftRightArrows
          key="left-right-arrows"
          leftArrowColor={COLORS.gray300}
          rightArrowColor={arrowColor}
        />,
        <VinaupLeftRightArrows
          key="left-right-arrows-active"
          leftArrowColor={arrowColor}
          rightArrowColor={arrowColor}
        />,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  togglerText: {
    fontSize: FONT_SIZES.sm,
  },
});
