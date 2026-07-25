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

import {
  attendanceConclusionQueryArgs,
  type AttendanceConclusionResponse,
} from '../dtos/attendance-conclusion.response.dto';

@Injectable()
export class AttendanceConclusionService {
  constructor(private readonly prismaService: PrismaService) {}

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
          workdayUnit: input.workdayUnit ?? undefined,
          seasonalHours: input.seasonalHours ?? undefined,
          overtimeHours: input.overtimeHours ?? undefined,
          authorizedLeaveDayUnit: input.authorizedLeaveDayUnit ?? undefined,
          unauthorizedLeaveDayUnit: input.unauthorizedLeaveDayUnit ?? undefined,
          lateArrivalCount: input.lateArrivalCount ?? undefined,
          earlyDepartureCount: input.earlyDepartureCount ?? undefined,
          note: input.note ?? null,
          createdByUserId: currentUserId,
        },
        ...attendanceConclusionQueryArgs,
      });

      if (status === ATTENDANCE_CONCLUSION_STATUS.COMPLETED) {
        await this.closeOpenAttendanceRecords(tx, input.organizationMemberId, input.workDate);
      }

      return attendanceConclusion;
    });
  }

  async update(
    attendanceConclusionId: string,
    input: UpdateAttendanceConclusionRequestInterface,
  ): Promise<AttendanceConclusionResponse> {
    const existing = await this.prismaService.attendanceConclusion.findUnique({
      where: { id: attendanceConclusionId },
      select: { status: true, organizationMemberId: true, workDate: true },
    });
    if (!existing) {
      throw new AttendanceConclusionNotFoundException();
    }
    const isReopening = input.status === ATTENDANCE_CONCLUSION_STATUS.DRAFT;
    if (existing.status === ATTENDANCE_CONCLUSION_STATUS.COMPLETED && !isReopening) {
      throw new AttendanceConclusionLockedException();
    }

    const isCompleting = input.status === ATTENDANCE_CONCLUSION_STATUS.COMPLETED;

    return this.prismaService.$transaction(async (tx) => {
      const attendanceConclusion = await tx.attendanceConclusion.update({
        where: { id: attendanceConclusionId },
        data: {
          status: input.status ?? undefined,
          workdayUnit: input.workdayUnit ?? undefined,
          seasonalHours: input.seasonalHours ?? undefined,
          overtimeHours: input.overtimeHours ?? undefined,
          authorizedLeaveDayUnit: input.authorizedLeaveDayUnit ?? undefined,
          unauthorizedLeaveDayUnit: input.unauthorizedLeaveDayUnit ?? undefined,
          lateArrivalCount: input.lateArrivalCount ?? undefined,
          earlyDepartureCount: input.earlyDepartureCount ?? undefined,
          note: input.note ?? undefined,
        },
        ...attendanceConclusionQueryArgs,
      });

      if (isCompleting) {
        await this.closeOpenAttendanceRecords(tx, existing.organizationMemberId, existing.workDate);
      }

      return attendanceConclusion;
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
    return this.prismaService.attendanceConclusion.findMany({
      where: {
        organizationId,
        ...(filter.workDateFrom && filter.workDateTo
          ? { workDate: { gte: filter.workDateFrom, lte: filter.workDateTo } }
          : {}),
      },
      orderBy: [{ workDate: 'desc' }, { organizationMemberId: 'asc' }],
      ...attendanceConclusionQueryArgs,
    });
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
