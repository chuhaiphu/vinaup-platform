import { createAttendanceRecordSchema } from '@vinaup-platform/validation';
import * as Linking from 'expo-linking';
import { useEffect, useImperativeHandle } from 'react';
import { ActivityIndicator, Keyboard, StyleSheet, Text, View } from 'react-native';

import { GoogleMapsLinkButton } from '@/components/commons/buttons/google-maps-link-button';
import { ConfirmSlideSheetContentRef } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { FlatTextInput } from '@/components/primitives/flat-text-input';
import {
  ATTENDANCE_PUNCH_ACTION,
  AttendanceMode,
  AttendancePunchAction,
} from '@/constants/attendance-constants';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { UseCurrentLocationResult } from '@/hooks/use-current-location';
import { FieldErrors, FieldValidator, useValidatedFields } from '@/hooks/use-validated-fields';
import {
  CheckOutAttendanceRecordRequest,
  CreateAttendanceRecordRequest,
} from '@/interfaces/attendance-interfaces';
import { useOrganizationAttendancePunchContext } from '@/providers/organization/attendance/organization-attendance-punch-provider';
import { generateCoordinateCode } from '@/utils/generator/string-generator/generate-coordinate-code';
import { generateFormatDateTime } from '@/utils/generator/string-generator/generate-format-date-time';

export type AttendancePunchFieldValues = {
  location: string;
  note: string;
};

// Discriminated so the caller narrows to the right request type instead of casting —
// check-in and check-out are separate endpoints with separate payloads.
export type AttendancePunchSubmitValue =
  | { punchAction: typeof ATTENDANCE_PUNCH_ACTION.CHECK_IN; request: CreateAttendanceRecordRequest }
  | {
      punchAction: typeof ATTENDANCE_PUNCH_ACTION.CHECK_OUT;
      request: CheckOutAttendanceRecordRequest;
    };

const DEFAULT_FIELD_VALUES: AttendancePunchFieldValues = {
  location: '',
  note: '',
};

const EMPTY_VALUE_PLACEHOLDER = '—';

interface AttendancePunchConfirmModalContentProps {
  organizationId: string;
  punchAction: AttendancePunchAction;
  attendanceMode: AttendanceMode;
  isLoading?: boolean;
  /** The sheet's own reading — the footer disables confirm off the same one. */
  currentLocationState: UseCurrentLocationResult;
  /** True while a fix is still being waited on, so the row and the footer agree on when. */
  isLocationLoading?: boolean;
  onSubmit?: (value: AttendancePunchSubmitValue) => void;
  ref?: React.RefObject<ConfirmSlideSheetContentRef | null>;
}

export function AttendancePunchConfirmModalContent({
  organizationId,
  punchAction,
  attendanceMode,
  isLoading = false,
  currentLocationState,
  isLocationLoading = false,
  onSubmit,
  ref,
}: AttendancePunchConfirmModalContentProps) {
  const { openAttendanceRecord } = useOrganizationAttendancePunchContext();

  const isCheckOut = punchAction === ATTENDANCE_PUNCH_ACTION.CHECK_OUT;

  const { currentLocation, locationAddress, isPreciseLocationGranted } = currentLocationState;

  const coordinateCode = currentLocation ? generateCoordinateCode(currentLocation.coords) : null;

  // The measured fix travels as one unit, spread whole into the payload
  const measuredPositionFields = currentLocation
    ? {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        locationAccuracy: currentLocation.coords.accuracy,
      }
    : {};

  const validate: FieldValidator<
    AttendancePunchFieldValues,
    keyof AttendancePunchFieldValues,
    AttendancePunchSubmitValue
  > = (values) => {
    // Check-out carries no form data — the sheet only shows the open session, so skip to the payload.
    if (isCheckOut) {
      return {
        success: true,
        data: { punchAction: ATTENDANCE_PUNCH_ACTION.CHECK_OUT, request: { organizationId } },
      };
    }

    // Both fields are nullish on the wire, so an untouched sheet submits as a bare punch.
    const location = values.location.trim() || null;
    const note = values.note.trim() || null;

    const request: CreateAttendanceRecordRequest = {
      organizationId,
      mode: attendanceMode,
      location,
      note,
      ...measuredPositionFields,
    };

    const result = createAttendanceRecordSchema.safeParse(request);
    const fieldErrors: FieldErrors<keyof AttendancePunchFieldValues> = {};

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof AttendancePunchFieldValues;
        if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
      }
    }

    if (Object.keys(fieldErrors).length > 0) return { success: false, fieldErrors };
    return { success: true, data: { punchAction: ATTENDANCE_PUNCH_ACTION.CHECK_IN, request } };
  };

  const { fieldValues, fieldErrors, setFieldValue, setFieldValues, validateAll } =
    useValidatedFields(DEFAULT_FIELD_VALUES, validate);

  useEffect(() => {
    if (locationAddress) setFieldValues({ location: locationAddress });
  }, [locationAddress, setFieldValues]);

  const handleOpenLocationSettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      // Opening Settings is supplementary to the punch — a failure here must not surface as an error.
    }
  };

  const handleConfirm = () => {
    Keyboard.dismiss();
    const submitValue = validateAll();
    // A field error only ever comes from an expanded field, so surface the section holding it.
    if (submitValue) {
      onSubmit?.(submitValue);
    }
  };

  useImperativeHandle(ref, () => ({ submit: handleConfirm }));

  if (isCheckOut) {
    // The check-in fix is already persisted, so check-out replays it instead of measuring again —
    // the punch being closed happened at that coordinate, not wherever the phone is right now.
    const openCoordinateCode =
      openAttendanceRecord?.latitude != null && openAttendanceRecord.longitude != null
        ? generateCoordinateCode({
            latitude: openAttendanceRecord.latitude,
            longitude: openAttendanceRecord.longitude,
          })
        : null;

    return (
      <View style={styles.container}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabelText}>Mã vị trí</Text>
          <View style={styles.summaryValueContainer}>
            <Text style={styles.summaryValueText}>
              {openCoordinateCode ?? EMPTY_VALUE_PLACEHOLDER}
              {openAttendanceRecord?.locationAccuracy != null &&
                ` (±${Math.round(openAttendanceRecord.locationAccuracy)} m)`}
            </Text>
            <GoogleMapsLinkButton
              latitude={openAttendanceRecord?.latitude}
              longitude={openAttendanceRecord?.longitude}
              size={ICON_SIZES.lg}
            />
          </View>
        </View>
        <View style={styles.fieldContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelText}>Check in lúc</Text>
            <Text style={styles.summaryValueText}>
              {openAttendanceRecord
                ? generateFormatDateTime(openAttendanceRecord.checkInAt)
                : EMPTY_VALUE_PLACEHOLDER}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelText}>Địa điểm</Text>
            <Text style={styles.summaryValueText}>
              {openAttendanceRecord?.location || EMPTY_VALUE_PLACEHOLDER}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelText}>Ghi chú</Text>
            <Text style={styles.summaryValueText}>
              {openAttendanceRecord?.note || EMPTY_VALUE_PLACEHOLDER}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const renderLocationCodeValue = () => {
    if (isLocationLoading) {
      return <Text style={styles.locationCodeValueText}>đang lấy vị trí...</Text>;
    }

    if (!isPreciseLocationGranted) {
      return (
        <Text style={styles.locationCodeActionText} onPress={handleOpenLocationSettings}>
          bật vị trí chính xác
        </Text>
      );
    }

    return (
      <>
        <Text style={styles.locationCodeValueText}>{coordinateCode ?? 'không có'}</Text>
        {currentLocation?.coords.accuracy != null &&
          ` (±${Math.round(currentLocation.coords.accuracy)} m)`}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.locationCodeRow}>
        <Text style={styles.locationCodeText}>
          <Text style={styles.locationCodeLabelText}>Mã vị trí: </Text>
          {renderLocationCodeValue()}
        </Text>
        <GoogleMapsLinkButton
          latitude={currentLocation?.coords.latitude}
          longitude={currentLocation?.coords.longitude}
          size={ICON_SIZES.lg}
        />
      </View>
      <View style={styles.fieldContainer}>
        <FlatTextInput
          label="Địa điểm"
          value={fieldValues.location}
          onChangeText={(value) => setFieldValue('location', value)}
          alignLabel="left"
          alignValue="left"
          error={fieldErrors.location}
          placeholder="..."
          editable={!isLoading}
        />
        <FlatTextInput
          label="Ghi chú"
          value={fieldValues.note}
          onChangeText={(value) => setFieldValue('note', value)}
          alignLabel="left"
          alignValue="left"
          error={fieldErrors.note}
          placeholder="..."
          editable={!isLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  titleText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  fieldContainer: {
    borderWidth: 1,
    borderColor: COLORS.teal700,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  locationCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  locationCodeText: {
    flexShrink: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
  },
  locationCodeLabelText: {
    color: COLORS.teal700,
  },
  locationCodeValueText: {
    fontWeight: FONT_WEIGHTS.bold,
  },
  locationCodeActionText: {
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.blue600,
    textDecorationLine: 'underline',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  summaryLabelText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  // Keeps the map button pinned to the row's right edge while the value wraps to its left.
  summaryValueContainer: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  summaryValueText: {
    // A typed location or note runs long, so it wraps inside the row instead of pushing the label out.
    flexShrink: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    textAlign: 'right',
  },
});
