import { Injectable } from '@nestjs/common';
import { ATTENDANCE_CONCLUSION_STATUS, ATTENDANCE_RECORD_STATUS } from '@vinaup-platform/validation';
import type {
  AttendanceRecordFilterRequestInterface,
  CreateAttendanceConclusionRequestInterface,
  UpdateAttendanceConclusionRequestInterface,
} from '@vinaup-platform/validation';

import {
  AttendanceConclusionAlreadyExistsException,
  AttendanceConclusionLockedException,
  AttendanceConclusionNotFoundException,
} from 'src/_common/exceptions/attendance.exception';
import { OrganizationMemberNotFoundException } from 'src/_common/exceptions/organization.exception';
import { Prisma } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';

import {
  toAttendanceConclusionResponse, attendanceConclusionQueryArgs,
  type AttendanceConclusionResponse,
} from '../dtos/attendance-conclusion.response.dto';

@Injectable()
export class AttendanceConclusionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async create(
    input: CreateAttendanceConclusionRequestInterface,
    currentUserId: string,
  ): Promise<AttendanceConclusionResponse> {
    await this.assertMemberBelongsToOrganization(input.organizationMemberId, input.organizationId);

    const existing = await this.prismaService.attendanceConclusion.findUnique({
      where: {
        organizationMemberId_workDate: {
          organizationMemberId: input.organizationMemberId,
          workDate: input.workDate,
        },
      },
      select: { id: true },
    });
    if (existing) {
      throw new AttendanceConclusionAlreadyExistsException();
    }

    const status = input.status ?? ATTENDANCE_CONCLUSION_STATUS.DRAFT;

    return this.prismaService.$transaction(async (tx) => {
      const attendanceConclusion = await tx.attendanceConclusion.create({
        data: {
          organizationId: input.organizationId,
          organizationMemberId: input.organizationMemberId,
          workDate: input.workDate,
          status,
          // Every metric is optional over a NOT NULL @default(0) column: omitting one lets the DB default apply.
          workdayUnit: input.workdayUnit,
          seasonalHours: input.seasonalHours,
          overtimeHours: input.overtimeHours,
          authorizedLeaveDayUnit: input.authorizedLeaveDayUnit,
          unauthorizedLeaveDayUnit: input.unauthorizedLeaveDayUnit,
          lateArrivalCount: input.lateArrivalCount,
          earlyDepartureCount: input.earlyDepartureCount,
          note: input.note,
          createdByUserId: currentUserId,
        },
        ...attendanceConclusionQueryArgs,
      });

      if (status === ATTENDANCE_CONCLUSION_STATUS.COMPLETED) {
        await this.closeOpenAttendanceRecords(tx, input.organizationMemberId, input.workDate);
      }

      return toAttendanceConclusionResponse(attendanceConclusion, this.storageService);
    });
  }

  async update(
    attendanceConclusionId: string,
    input: UpdateAttendanceConclusionRequestInterface,
  ): Promise<AttendanceConclusionResponse> {
    const existing = await this.prismaService.attendanceConclusion.findUnique({
      where: { id: attendanceConclusionId },
      select: { organizationMemberId: true, workDate: true },
    });
    if (!existing) {
      throw new AttendanceConclusionNotFoundException();
    }

    return this.prismaService.$transaction(async (tx) => {
      const attendanceConclusion = await tx.attendanceConclusion.update({
        where: { id: attendanceConclusionId },
        // Passed through as parsed: an omitted metric stays as it was, an explicit null clears the note.
        data: input,
        ...attendanceConclusionQueryArgs,
      });

      // A no-op when the day was already completed: it has no open record left to close.
      if (input.status === ATTENDANCE_CONCLUSION_STATUS.COMPLETED) {
        await this.closeOpenAttendanceRecords(tx, existing.organizationMemberId, existing.workDate);
      }

      return toAttendanceConclusionResponse(attendanceConclusion, this.storageService);
    });
  }

  async delete(attendanceConclusionId: string): Promise<void> {
    const existing = await this.prismaService.attendanceConclusion.findUnique({
      where: { id: attendanceConclusionId },
      select: { status: true },
    });
    if (!existing) {
      throw new AttendanceConclusionNotFoundException();
    }
    if (existing.status === ATTENDANCE_CONCLUSION_STATUS.COMPLETED) {
      throw new AttendanceConclusionLockedException();
    }
    await this.prismaService.attendanceConclusion.delete({ where: { id: attendanceConclusionId } });
  }

  async findByOrganizationId(
    organizationId: string,
    filter: AttendanceRecordFilterRequestInterface,
  ): Promise<AttendanceConclusionResponse[]> {
    const rows = await this.prismaService.attendanceConclusion.findMany({
      where: {
        organizationId,
        ...(filter.workDateFrom && filter.workDateTo
          ? { workDate: { gte: filter.workDateFrom, lte: filter.workDateTo } }
          : {}),
      },
      orderBy: [{ workDate: 'desc' }, { organizationMemberId: 'asc' }],
      ...attendanceConclusionQueryArgs,
    });

    return rows.map((row) => toAttendanceConclusionResponse(row, this.storageService));
  }

  private async closeOpenAttendanceRecords(
    tx: Prisma.TransactionClient,
    organizationMemberId: string,
    workDate: string,
  ): Promise<void> {
    await tx.attendanceRecord.updateMany({
      where: { organizationMemberId, workDate, status: ATTENDANCE_RECORD_STATUS.OPEN },
      data: { status: ATTENDANCE_RECORD_STATUS.CLOSED, checkOutAt: null },
    });
  }

  private async assertMemberBelongsToOrganization(
    organizationMemberId: string,
    organizationId: string,
  ): Promise<void> {
    const member = await this.prismaService.organizationMember.findFirst({
      where: { id: organizationMemberId, organizationId },
      select: { id: true },
    });
    if (!member) {
      throw new OrganizationMemberNotFoundException();
    }
  }
}
