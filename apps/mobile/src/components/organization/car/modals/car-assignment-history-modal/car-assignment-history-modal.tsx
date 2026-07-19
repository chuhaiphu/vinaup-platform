import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/primitives/avatar';
import { ConfirmSlideSheet } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { FieldsetView } from '@/components/primitives/fieldset-view';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SingleSelect, SingleSelectOption } from '@/components/primitives/single-select';
import { SlideSheet, SlideSheetRef } from '@/components/primitives/slide-sheet';
import {
  CAR_ASSIGNMENT_EVENT_ACTION,
  CarAssignmentEventActionDisplay,
} from '@/constants/car-constants';
import {
  AVATAR_SIZES,
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  SPACING,
} from '@/constants/style-constants';
import { CarAssignmentEventResponse } from '@/interfaces/car-interfaces';

const ALL_OPTION_VALUE = '';
const ALL_OPTION_LABEL = 'Tất cả';

interface CarAssignmentHistoryModalProps {
  carName: string | null;
  events: CarAssignmentEventResponse[] | null;
  isLoading: boolean;
  modalRef: React.RefObject<SlideSheetRef | null>;
}

interface AssignmentOperation {
  operationId: string;
  performedAt: string;
  events: CarAssignmentEventResponse[];
}

// A member may be deleted (organizationMemberId === null)
// yet still appear in history via its snapshot name
function memberKeyOf(event: CarAssignmentEventResponse): string {
  return event.organizationMemberId ?? `name:${event.memberName}`;
}

// ─── Group the flat (performedAt-desc) event list into "operations" ────────────
function groupEventsByOperation(events: CarAssignmentEventResponse[]): AssignmentOperation[] {
  const operationList: AssignmentOperation[] = [];
  const operationById = new Map<string, AssignmentOperation>();

  for (const event of events) {
    const existingOperation = operationById.get(event.operationId);
    if (existingOperation) {
      existingOperation.events.push(event);
      continue;
    }
    const operation: AssignmentOperation = {
      operationId: event.operationId,
      performedAt: event.performedAt,
      events: [event],
    };
    operationById.set(event.operationId, operation);
    operationList.push(operation);
  }

  return operationList;
}

export function CarAssignmentHistoryModal({
  carName,
  events,
  isLoading,
  modalRef,
}: CarAssignmentHistoryModalProps) {
  const insets = useSafeAreaInsets();
  const yearSheetRef = useRef<SlideSheetRef>(null);
  const memberSheetRef = useRef<SlideSheetRef>(null);

  // ALL_OPTION_VALUE ('') means "no filter".
  const [selectedYear, setSelectedYear] = useState(ALL_OPTION_VALUE);
  const [selectedMemberKey, setSelectedMemberKey] = useState(ALL_OPTION_VALUE);

  const eventList = events ?? [];

  // ─── Filter option lists are derived from the full history ───────────────────
  // Years: distinct, newest first. Members: distinct, keyed to survive deletion.
  const yearOptionList: SingleSelectOption[] = [
    { label: ALL_OPTION_LABEL, value: ALL_OPTION_VALUE },
    ...Array.from(new Set(eventList.map((event) => dayjs(event.performedAt).year())))
      .sort((a, b) => b - a)
      .map((year) => ({ label: String(year), value: String(year) })),
  ];

  const memberByKey = new Map<string, CarAssignmentEventResponse>();
  for (const event of eventList) {
    const key = memberKeyOf(event);
    if (!memberByKey.has(key)) memberByKey.set(key, event);
  }
  const memberOptionList: SingleSelectOption[] = [
    { label: ALL_OPTION_LABEL, value: ALL_OPTION_VALUE },
    ...Array.from(memberByKey.entries())
      .sort(([, a], [, b]) => a.memberName.localeCompare(b.memberName))
      .map(([key, event]) => ({
        label: event.memberName,
        value: key,
        leftSection: <Avatar imgSrc={event.memberAvatarUrl} size={AVATAR_SIZES.sm} />,
      })),
  ];

  // ─── Apply both filters (AND), then regroup into operations ──────────────────
  const filteredEventList = eventList.filter((event) => {
    const matchesYear =
      selectedYear === ALL_OPTION_VALUE || dayjs(event.performedAt).year() === Number(selectedYear);
    const matchesMember =
      selectedMemberKey === ALL_OPTION_VALUE || memberKeyOf(event) === selectedMemberKey;
    return matchesYear && matchesMember;
  });
  const operationList = groupEventsByOperation(filteredEventList);

  const yearTriggerLabel = selectedYear === ALL_OPTION_VALUE ? ALL_OPTION_LABEL : selectedYear;
  const memberTriggerLabel =
    memberOptionList.find((option) => option.value === selectedMemberKey)?.label ??
    ALL_OPTION_LABEL;

  return (
    <>
      <ConfirmSlideSheet
        heightPercentage={0.8}
        ref={modalRef}
        hideConfirm
        cancelText="Đóng"
        renderHeader={() => (
          <View>
            <Text style={styles.title}>
              Lịch sử ghép <Text style={styles.carName}>{carName}</Text>
            </Text>
            <View style={styles.filterBar}>
              {/* Left: year filter behind a calendar icon */}
              <PressableTrigger onPress={() => yearSheetRef.current?.open()}>
                <FontAwesome5 name="calendar-alt" size={ICON_SIZES.md} color={COLORS.teal700} />
                <Text style={styles.triggerText}>{yearTriggerLabel}</Text>
              </PressableTrigger>
              {/* Right: single-select of members */}
              <PressableTrigger onPress={() => memberSheetRef.current?.open()}>
                <Text style={styles.triggerText} numberOfLines={1}>
                  {memberTriggerLabel}
                </Text>
                <FontAwesome6
                  iconStyle="solid"
                  name="caret-down"
                  size={ICON_SIZES.md}
                  color={COLORS.teal700}
                />
              </PressableTrigger>
            </View>
          </View>
        )}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.teal700} style={styles.loading} />
        ) : operationList.length ? (
          operationList.map((operation) => (
            <FieldsetView
              key={operation.operationId}
              legendLeft={
                <Text style={styles.operationTime}>
                  {dayjs(operation.performedAt).format('DD/MM/YYYY HH:mm')}
                </Text>
              }
              style={{ border: styles.operation }}
            >
              {operation.events.map((event) => {
                const isAssigned = event.action === CAR_ASSIGNMENT_EVENT_ACTION.ASSIGNED;
                return (
                  <View key={event.id} style={styles.row}>
                    <Avatar imgSrc={event.memberAvatarUrl} size={AVATAR_SIZES.md} />
                    <View style={styles.info}>
                      <Text style={styles.name}>{event.memberName}</Text>
                      <Text
                        style={[styles.action, isAssigned ? styles.assigned : styles.unassigned]}
                      >
                        {isAssigned ? '+ ' : '− '}
                        {CarAssignmentEventActionDisplay[event.action]}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </FieldsetView>
          ))
        ) : (
          <Text style={styles.placeholder}>
            {eventList.length ? 'Không có lịch sử phù hợp bộ lọc' : 'Chưa có lịch sử ghép'}
          </Text>
        )}
      </ConfirmSlideSheet>

      {/* Selecting closes the sheet immediately — no confirm step. */}
      <SlideSheet ref={yearSheetRef}>
        <Text style={styles.sheetTitle}>Chọn năm</Text>
        <SingleSelect
          options={yearOptionList}
          value={selectedYear}
          onSelectOption={(value) => {
            setSelectedYear(value);
            yearSheetRef.current?.close();
          }}
        />
        <View style={{ height: insets.bottom }} />
      </SlideSheet>

      <SlideSheet ref={memberSheetRef}>
        <Text style={styles.sheetTitle}>Chọn tài xế</Text>
        <SingleSelect
          options={memberOptionList}
          value={selectedMemberKey}
          onSelectOption={(value) => {
            setSelectedMemberKey(value);
            memberSheetRef.current?.close();
          }}
        />
        <View style={{ height: insets.bottom }} />
      </SlideSheet>
    </>
  );
}

// Small compact trigger shared by both filters (icon + label row).
function PressableTrigger({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <PressableOpacity style={styles.trigger} onPress={onPress} hitSlop={4}>
      {children}
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.teal900,
    marginBottom: SPACING.md,
  },
  carName: {
    fontWeight: FONT_WEIGHTS.bold,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    maxWidth: '55%',
  },
  triggerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  sheetTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
    textAlign: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray300,
  },
  loading: {
    paddingVertical: SPACING.xl,
  },
  // Fieldset border override: just spacing so the date legend never clips the
  // previous group; the bordered box + padding come from FieldsetView defaults.
  operation: {
    marginTop: SPACING.md,
    marginBottom: SPACING['2xs'],
  },
  // Date legend text: vinaup teal, not the default gray.
  operationTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  info: {
    flex: 1,
    marginLeft: SPACING['2xs'],
  },
  name: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
    fontWeight: FONT_WEIGHTS.bold,
  },
  action: {
    fontSize: FONT_SIZES.sm,
  },
  assigned: {
    color: COLORS.teal700,
  },
  unassigned: {
    color: COLORS.red600,
  },
  placeholder: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    fontStyle: 'italic',
    paddingVertical: SPACING.sm,
  },
});
