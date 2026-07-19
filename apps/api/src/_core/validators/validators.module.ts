import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';

import { IsBookingExistConstraint } from './booking.validator';
import { IsCarMaintenanceLogExistConstraint } from './car-maintenance-log.validator';
import { IsInvoiceTypeExistConstraint, IsInvoiceExistConstraint } from './invoice.validator';
import { IsOrganizationExistConstraint, IsOrganizationRoleExistConstraint, IsOrganizationMemberExistConstraint } from './organization.validator';
import { IsProjectExistConstraint } from './project.validator';
import { IsTourExistConstraint, IsTourCalculationExistConstraint, IsTourImplementationExistConstraint, IsTourSettlementExistConstraint } from './tour.validator';
import { IsTripExistConstraint } from './trip.validator';
import { IsUserExistConstraint } from './user.validator';
import { IsWageExistConstraint } from './wage.validator';


@Module({
  imports: [PrismaModule],
  providers: [
    IsOrganizationExistConstraint,
    IsOrganizationRoleExistConstraint,
    IsOrganizationMemberExistConstraint,
    IsProjectExistConstraint,
    IsTourExistConstraint,
    IsTourCalculationExistConstraint,
    IsTourImplementationExistConstraint,
    IsTourSettlementExistConstraint,
    IsInvoiceTypeExistConstraint,
    IsInvoiceExistConstraint,
    IsUserExistConstraint,
    IsBookingExistConstraint,
    IsWageExistConstraint,
    IsCarMaintenanceLogExistConstraint,
    IsTripExistConstraint,
  ],
  exports: [
    IsOrganizationExistConstraint,
    IsOrganizationRoleExistConstraint,
    IsOrganizationMemberExistConstraint,
    IsProjectExistConstraint,
    IsTourExistConstraint,
    IsTourCalculationExistConstraint,
    IsTourImplementationExistConstraint,
    IsTourSettlementExistConstraint,
    IsInvoiceTypeExistConstraint,
    IsInvoiceExistConstraint,
    IsUserExistConstraint,
    IsBookingExistConstraint,
    IsWageExistConstraint,
    IsCarMaintenanceLogExistConstraint,
    IsTripExistConstraint,
  ],
})
export class ValidatorsModule { }
