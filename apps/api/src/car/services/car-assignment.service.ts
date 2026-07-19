import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import type { CreateCarAssignmentRequestInterface } from '@vinaup-platform/validation';

import { CAR_ASSIGNMENT_EVENT_ACTION } from 'src/_common/constants/car.constant';
import { CarAssignmentMemberNotFoundException, CarNotFoundException } from 'src/_common/exceptions/car.exception';
import { PrismaService } from 'src/prisma/prisma.service';

import type { CarAssignmentEventResponse } from '../dtos/car-assignment-event.response.dto';
import { carAssignmentQueryArgs, type CarAssignmentResponse } from '../dtos/car-assignment.response.dto';

@Injectable()
export class CarAssignmentService {
  constructor(private readonly prismaService: PrismaService) {}

  async findCarAssignmentsByCarId(carId: string): Promise<CarAssignmentResponse[]> {
    return this.findActiveAssignmentsByCarId(carId);
  }

  async findCarAssignmentsByOrganizationMemberId(
    organizationMemberId: string,
  ): Promise<CarAssignmentResponse[]> {
    return this.prismaService.carAssignment.findMany({
      where: { organizationMemberId },
      orderBy: { startTime: 'desc' },
      ...carAssignmentQueryArgs,
    });
  }

  // ─── History: the append-only audit trail for one car ────────────────────────
  async findCarAssignmentEventsByCarId(carId: string): Promise<CarAssignmentEventResponse[]> {
    return this.prismaService.carAssignmentEvent.findMany({
      where: { carId },
      orderBy: { performedAt: 'desc' },
    });
  }

  async createCarAssignment(
    createCarAssignmentReq: CreateCarAssignmentRequestInterface,
  ): Promise<CarAssignmentResponse[]> {
    // ─── Step 1: Verify car exists and get its organizationId ────────────
    const car = await this.prismaService.car.findUnique({
      where: { id: createCarAssignmentReq.carId },
    });

    if (!car) {
      throw new CarNotFoundException();
    }

    // ─── Step 2: Normalize the target member set ─────────────────────────
    const targetMemberIdList = Array.from(new Set(createCarAssignmentReq.organizationMemberIds));
    const targetMemberIdSet = new Set(targetMemberIdList);

    // ─── Step 3: Load target members — validate existence AND snapshot ───
    const targetMemberList = await this.prismaService.organizationMember.findMany({
      where: { id: { in: targetMemberIdList }, organizationId: car.organizationId },
      select: { id: true, name: true, avatarUrl: true },
    });

    if (targetMemberList.length !== targetMemberIdList.length) {
      throw new CarAssignmentMemberNotFoundException();
    }

    // ─── Step 4: Read the car's current ACTIVE state ─────────────────────
    // Include the member snapshot for rows we may remove (they are not in the target list).
    const activeAssignmentList = await this.prismaService.carAssignment.findMany({
      where: { carId: createCarAssignmentReq.carId },
      select: {
        id: true,
        organizationMemberId: true,
        organizationMember: { select: { name: true, avatarUrl: true } },
      },
    });
    const activeMemberIdSet = new Set(activeAssignmentList.map((a) => a.organizationMemberId));

    // ─── Step 5: Compute the set difference ──────────────────────────────
    const memberToAddList = targetMemberList.filter((member) => !activeMemberIdSet.has(member.id));
    const assignmentToRemoveList = activeAssignmentList.filter(
      (assignment) => !targetMemberIdSet.has(assignment.organizationMemberId),
    );

    // ─── Step 6: No-op guard — never write an empty history operation ────
    // If the target set already equals the active set, there is nothing to record.
    if (memberToAddList.length === 0 && assignmentToRemoveList.length === 0) {
      return this.findActiveAssignmentsByCarId(createCarAssignmentReq.carId);
    }

    const startTime = createCarAssignmentReq.startTime
      ? new Date(createCarAssignmentReq.startTime)
      : new Date();
    // operationId groups every event of THIS reconcile into one "pairing operation";
    // performedAt is the server-owned action instant, shared by all those events.
    const operationId = randomUUID();
    const performedAt = new Date();

    // ─── Step 7: Apply state change + append history atomically ──────────
    await this.prismaService.$transaction([
      this.prismaService.carAssignment.deleteMany({
        where: { id: { in: assignmentToRemoveList.map((assignment) => assignment.id) } },
      }),
      this.prismaService.carAssignment.createMany({
        data: memberToAddList.map((member) => ({
          carId: createCarAssignmentReq.carId,
          organizationMemberId: member.id,
          startTime,
          note: createCarAssignmentReq.note,
        })),
      }),
      this.prismaService.carAssignmentEvent.createMany({
        data: [
          ...memberToAddList.map((member) => ({
            carId: createCarAssignmentReq.carId,
            operationId,
            action: CAR_ASSIGNMENT_EVENT_ACTION.ASSIGNED,
            organizationMemberId: member.id,
            memberName: member.name,
            memberAvatarUrl: member.avatarUrl,
            note: createCarAssignmentReq.note,
            performedAt,
          })),
          ...assignmentToRemoveList.map((assignment) => ({
            carId: createCarAssignmentReq.carId,
            operationId,
            action: CAR_ASSIGNMENT_EVENT_ACTION.UNASSIGNED,
            organizationMemberId: assignment.organizationMemberId,
            memberName: assignment.organizationMember.name,
            memberAvatarUrl: assignment.organizationMember.avatarUrl,
            performedAt,
          })),
        ],
      }),
    ]);

    // ─── Step 8: Return the car's resulting ACTIVE state ─────────────────
    return this.findActiveAssignmentsByCarId(createCarAssignmentReq.carId);
  }

  private async findActiveAssignmentsByCarId(carId: string): Promise<CarAssignmentResponse[]> {
    return this.prismaService.carAssignment.findMany({
      where: { carId },
      orderBy: { startTime: 'desc' },
      ...carAssignmentQueryArgs,
    });
  }
}
