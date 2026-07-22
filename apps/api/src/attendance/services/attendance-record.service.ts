import { Injectable } from '@nestjs/common';
import {
  ATTENDANCE_CONCLUSION_STATUS,
  ATTENDANCE_MODE,
  ATTENDANCE_RECORD_STATUS,
} from '@vinaup-platform/validation';
import type {
  AttendanceRecordFilterRequestInterface,
  CheckOutAttendanceRecordRequestInterface,
  CreateAttendanceRecordRequestInterface,
  UpdateAttendanceRecordRequestInterface,
} from '@vinaup-platform/validation';

import { ORGANIZATION_MEMBER_STATUS } from 'src/_common/constants/organization.constant';
import {
  AttendanceDayLockedException,
  AttendanceHasOpenRecordException,
  AttendanceNoOpenRecordException,
  AttendanceRecordNotFoundException,
  AttendanceRecordNotOwnerException,
} from 'src/_common/exceptions/attendance.exception';
import {
  OrganizationMemberLockedException,
  OrganizationNotFoundException,
  OrganizationNotMemberException,
} from 'src/_common/exceptions/organization.exception';
import { generateCalendarDate } from 'src/_common/utils/generator/generate-calendar-date';
import { PrismaService } from 'src/prisma/prisma.service';

import {
  attendanceRecordQueryArgs,
  type AttendanceRecordResponse,
} from '../dtos/attendance-record.response.dto';

@Injectable()
export class AttendanceRecordService {
  constructor(private readonly prismaService: PrismaService) {}

  // Check-in: server stamps the instant and derives the frozen workDate.
  async checkIn(
    input: CreateAttendanceRecordRequestInterface,
    currentUserId: string,
  ): Promise<AttendanceRecordResponse> {
    const member = await this.resolveActiveMember(input.organizationId, currentUserId);
    const timezone = await this.resolveOrganizationTimezone(input.organizationId);

    const checkInAt = new Date();
    const workDate = generateCalendarDate(checkInAt, timezone);

    await this.assertDayNotLocked(member.id, workDate);

    // CHECK_IN_OUT opens a session that a later check-out closes, only one may be open at a time.
    // CHECK_IN is a standalone punch, born closed and repeatable.
    const isCheckInOut = input.mode === ATTENDANCE_MODE.CHECK_IN_OUT;
    if (isCheckInOut) {
      await this.assertNoOpenAttendanceRecord(member.id);
    }

    return this.prismaService.attendanceRecord.create({
      data: {
        organizationId: input.organizationId,
        organizationMemberId: member.id,
        checkInAt,
        workDate,
        mode: input.mode,
        status: isCheckInOut ? ATTENDANCE_RECORD_STATUS.OPEN : ATTENDANCE_RECORD_STATUS.CLOSED,
        note: input.note ?? null,
        createdByUserId: currentUserId,
      },
      ...attendanceRecordQueryArgs,
    });
  }

  // Check-out closes the caller's single open session — workDate is NOT recomputed (frozen at check-in).
  async checkOut(
    input: CheckOutAttendanceRecordRequestInterface,
    currentUserId: string,
  ): Promise<AttendanceRecordResponse> {
    const member = await this.resolveActiveMember(input.organizationId, currentUserId);

    const openAttendanceRecord = await this.prismaService.attendanceRecord.findFirst({
      where: { organizationMemberId: member.id, status: ATTENDANCE_RECORD_STATUS.OPEN },
      orderBy: { checkInAt: 'desc' },
      select: { id: true, workDate: true, createdByUserId: true },
    });
    if (!openAttendanceRecord) {
      throw new AttendanceNoOpenRecordException();
    }
    if (openAttendanceRecord.createdByUserId !== currentUserId) {
      throw new AttendanceRecordNotOwnerException();
    }
    await this.assertDayNotLocked(member.id, openAttendanceRecord.workDate);

    return this.prismaService.attendanceRecord.update({
      where: { id: openAttendanceRecord.id },
      data: {
        checkOutAt: new Date(),
        status: ATTENDANCE_RECORD_STATUS.CLOSED,
        note: input.note ?? undefined,
      },
      ...attendanceRecordQueryArgs,
    });
  }

  // Edit is ownership-enforced here (never through the role matrix),
  // no one — not even the organization owner — can change another person's punch.
  async updateAttendanceRecord(
    recordId: string,
    input: UpdateAttendanceRecordRequestInterface,
    currentUserId: string,
  ): Promise<AttendanceRecordResponse> {
    const existing = await this.findOwnAttendanceRecord(recordId, currentUserId);
    await this.assertDayNotLocked(existing.organizationMemberId, existing.workDate);

    return this.prismaService.attendanceRecord.update({
      where: { id: recordId },
      data: { note: input.note ?? null },
      ...attendanceRecordQueryArgs,
    });
  }

  async deleteAttendanceRecord(recordId: string, currentUserId: string): Promise<void> {
    const existing = await this.findOwnAttendanceRecord(recordId, currentUserId);
    await this.assertDayNotLocked(existing.organizationMemberId, existing.workDate);

    await this.prismaService.attendanceRecord.delete({ where: { id: recordId } });
  }

  async findMyAttendanceRecords(
    currentUserId: string,
    filter: AttendanceRecordFilterRequestInterface,
  ): Promise<AttendanceRecordResponse[]> {
    return this.prismaService.attendanceRecord.findMany({
      where: {
        createdByUserId: currentUserId,
        // Add the workDate range only when BOTH bounds are present
        ...(filter.workDateFrom && filter.workDateTo
          ? { workDate: { gte: filter.workDateFrom, lte: filter.workDateTo } }
          : {}),
      },
      orderBy: { checkInAt: 'desc' },
      ...attendanceRecordQueryArgs,
    });
  }

  async findByOrganizationId(
    organizationId: string,
    filter: AttendanceRecordFilterRequestInterface,
  ): Promise<AttendanceRecordResponse[]> {
    return this.prismaService.attendanceRecord.findMany({
      where: {
        organizationId,
        // Add the workDate range only when BOTH bounds are present
        ...(filter.workDateFrom && filter.workDateTo
          ? { workDate: { gte: filter.workDateFrom, lte: filter.workDateTo } }
          : {}),
      },
      orderBy: { checkInAt: 'desc' },
      ...attendanceRecordQueryArgs,
    });
  }

  private async findOwnAttendanceRecord(recordId: string, currentUserId: string) {
    const existing = await this.prismaService.attendanceRecord.findUnique({
      where: { id: recordId },
      select: { id: true, organizationMemberId: true, workDate: true, createdByUserId: true },
    });
    if (!existing) {
      throw new AttendanceRecordNotFoundException();
    }
    if (existing.createdByUserId !== currentUserId) {
      throw new AttendanceRecordNotOwnerException();
    }
    return existing;
  }

  private async resolveActiveMember(organizationId: string, userId: string) {
    const member = await this.prismaService.organizationMember.findFirst({
      where: { userId, organizationId },
      select: { id: true, status: true },
    });
    if (!member) {
      throw new OrganizationNotMemberException();
    }
    if (member.status === ORGANIZATION_MEMBER_STATUS.LOCKED) {
      throw new OrganizationMemberLockedException();
    }
    return member;
  }

  private async resolveOrganizationTimezone(organizationId: string): Promise<string> {
    const organization = await this.prismaService.organization.findUnique({
      where: { id: organizationId },
      select: { timezone: true },
    });
    if (!organization) {
      throw new OrganizationNotFoundException();
    }
    return organization.timezone;
  }

  private async assertNoOpenAttendanceRecord(organizationMemberId: string): Promise<void> {
    const openAttendanceRecord = await this.prismaService.attendanceRecord.findFirst({
      where: { organizationMemberId, status: ATTENDANCE_RECORD_STATUS.OPEN },
      select: { id: true },
    });
    if (openAttendanceRecord) {
      throw new AttendanceHasOpenRecordException();
    }
  }

  // A day whose conclusion is COMPLETED is finalized: its records can no longer be created or changed.
  private async assertDayNotLocked(organizationMemberId: string, workDate: string): Promise<void> {
    const attendanceConclusion = await this.prismaService.attendanceConclusion.findUnique({
      where: { organizationMemberId_workDate: { organizationMemberId, workDate } },
      select: { status: true },
    });
    if (attendanceConclusion?.status === ATTENDANCE_CONCLUSION_STATUS.COMPLETED) {
      throw new AttendanceDayLockedException();
    }
  }
}
