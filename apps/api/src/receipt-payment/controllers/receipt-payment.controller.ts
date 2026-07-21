import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';

import type {
  AuthenticatedRequest,
  HttpResponse,
} from 'src/_common/interfaces/interface';
import { CheckAbility } from 'src/_core/decorators/check-ability.decorator';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';
import { OrganizationPermissionGuard } from 'src/_core/guards/organization-permission.guard';

import { CreateReceiptPaymentRequest } from '../dtos/create-receipt-payment.request.dto';
import { FindReceiptPaymentsByInvoiceIdsRequest } from '../dtos/find-receipt-payments-by-invoice-ids.request.dto';
import { FindReceiptPaymentsByProjectIdsRequest } from '../dtos/find-receipt-payments-by-project-ids.request.dto';
import { FindReceiptPaymentsByWageIdsRequest } from '../dtos/find-receipt-payments-by-wage-ids.request.dto';
import { ReceiptPaymentFilterRequest } from '../dtos/receipt-payment-filter.request.dto';
import type { ReceiptPaymentResponse } from '../dtos/receipt-payment.response.dto';
import { UpdateReceiptPaymentRequest } from '../dtos/update-receipt-payment.request.dto';
import { ReceiptPaymentService } from '../services/receipt-payment.service';


@Controller('receipt-payment')
export class ReceiptPaymentController {
  constructor(private readonly receiptPaymentService: ReceiptPaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createReceiptPaymentReq: CreateReceiptPaymentRequest
  ): Promise<HttpResponse<ReceiptPaymentResponse>> {
    const data = await this.receiptPaymentService.createReceiptPayment(
      createReceiptPaymentReq,
      req.user.userId
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Receipt payment created successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/projects')
  async findAllByProjectIds(
    @Request() req: AuthenticatedRequest,
    @Body()
    findReceiptPaymentsByProjectIdsReq: FindReceiptPaymentsByProjectIdsRequest
  ): Promise<HttpResponse<ReceiptPaymentResponse[]>> {
    const data = await this.receiptPaymentService.findReceiptPaymentsByProjectIds(
      findReceiptPaymentsByProjectIdsReq.projectIds,
      req.user.userId
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payments retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/wages')
  async findAllByWageIds(
    @Request() req: AuthenticatedRequest,
    @Body()
    findReceiptPaymentsByWageIdsReq: FindReceiptPaymentsByWageIdsRequest
  ): Promise<HttpResponse<ReceiptPaymentResponse[]>> {
    const data = await this.receiptPaymentService.findReceiptPaymentsByWageIds(
      findReceiptPaymentsByWageIdsReq.wageIds,
      req.user.userId
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payments retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/invoices')
  async findAllByInvoiceIds(
    @Request() req: AuthenticatedRequest,
    @Body()
    findReceiptPaymentsByInvoiceIdsReq: FindReceiptPaymentsByInvoiceIdsRequest
  ): Promise<HttpResponse<ReceiptPaymentResponse[]>> {
    const data = await this.receiptPaymentService.findReceiptPaymentsByInvoiceIds(
      findReceiptPaymentsByInvoiceIdsReq.invoiceIds,
      req.user.userId
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payments retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async findByCurrentUser(
    @Request() req: AuthenticatedRequest,
    @Query() filter: ReceiptPaymentFilterRequest
  ): Promise<HttpResponse<ReceiptPaymentResponse[]>> {
    const data = await this.receiptPaymentService.findReceiptPaymentsByCurrentUser(
      req.user.userId,
      filter
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payments retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/booking/:bookingId')
  async findAllByBookingId(
    @Request() req: AuthenticatedRequest,
    @Param('bookingId') bookingId: string
  ): Promise<HttpResponse<ReceiptPaymentResponse[]>> {
    const data =
      await this.receiptPaymentService.findReceiptPaymentsByBookingId(bookingId, req.user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payments retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/project/:projectId')
  async findAllByProjectId(
    @Request() req: AuthenticatedRequest,
    @Param('projectId') projectId: string
  ): Promise<HttpResponse<ReceiptPaymentResponse[]>> {
    const data =
      await this.receiptPaymentService.findReceiptPaymentsByProjectId(projectId, req.user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payments retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/invoice/:invoiceId')
  async findAllByInvoiceId(
    @Request() req: AuthenticatedRequest,
    @Param('invoiceId') invoiceId: string
  ): Promise<HttpResponse<ReceiptPaymentResponse[]>> {
    const data =
      await this.receiptPaymentService.findReceiptPaymentsByInvoiceId(invoiceId, req.user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payments retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/tour-calculation/:tourCalculationId')
  async findAllByTourCalculationId(
    @Request() req: AuthenticatedRequest,
    @Param('tourCalculationId') tourCalculationId: string
  ): Promise<HttpResponse<ReceiptPaymentResponse[]>> {
    const data =
      await this.receiptPaymentService.findReceiptPaymentsByTourCalculationId(
        tourCalculationId,
        req.user.userId
      );
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payments retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/tour-implementation/:tourImplementationId')
  async findAllByTourImplementationId(
    @Request() req: AuthenticatedRequest,
    @Param('tourImplementationId') tourImplementationId: string
  ): Promise<HttpResponse<ReceiptPaymentResponse[]>> {
    const data =
      await this.receiptPaymentService.findReceiptPaymentsByTourImplementationId(
        tourImplementationId,
        req.user.userId
      );
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payments retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/tour-settlement/:tourSettlementId')
  async findAllByTourSettlementId(
    @Request() req: AuthenticatedRequest,
    @Param('tourSettlementId') tourSettlementId: string
  ): Promise<HttpResponse<ReceiptPaymentResponse[]>> {
    const data =
      await this.receiptPaymentService.findReceiptPaymentsByTourSettlementId(
        tourSettlementId,
        req.user.userId
      );
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payments retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/wage/:wageId')
  async findAllByWageId(
    @Request() req: AuthenticatedRequest,
    @Param('wageId') wageId: string
  ): Promise<HttpResponse<ReceiptPaymentResponse[]>> {
    const data = await this.receiptPaymentService.findReceiptPaymentsByWageId(wageId, req.user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payments retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.READ, PERMISSION_RESOURCE.RECEIPT_PAYMENT)
  @Get('/organization/:organizationId')
  async findAllByOrganizationId(
    @Param('organizationId') organizationId: string,
    @Query() filter: ReceiptPaymentFilterRequest
  ): Promise<HttpResponse<ReceiptPaymentResponse[]>> {
    const data =
      await this.receiptPaymentService.findReceiptPaymentsByOrganizationId(
        organizationId,
        filter
      );
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payments retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateReceiptPaymentReq: UpdateReceiptPaymentRequest
  ): Promise<HttpResponse<ReceiptPaymentResponse>> {
    const data = await this.receiptPaymentService.updateReceiptPayment(
      id,
      updateReceiptPaymentReq,
      req.user.userId
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payment updated successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string
  ): Promise<HttpResponse<null>> {
    await this.receiptPaymentService.deleteReceiptPaymentById(id, req.user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payment deleted successfully',
      data: null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/car-maintenance-log/:carMaintenanceLogId')
  async findAllByCarMaintenanceLogId(
    @Request() req: AuthenticatedRequest,
    @Param('carMaintenanceLogId') carMaintenanceLogId: string
  ): Promise<HttpResponse<ReceiptPaymentResponse[]>> {
    const data =
      await this.receiptPaymentService.findReceiptPaymentsByCarMaintenanceLogId(
        carMaintenanceLogId,
        req.user.userId
      );
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payments retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/trip/:tripId')
  async findAllByTripId(
    @Request() req: AuthenticatedRequest,
    @Param('tripId') tripId: string
  ): Promise<HttpResponse<ReceiptPaymentResponse[]>> {
    const data =
      await this.receiptPaymentService.findReceiptPaymentsByTripId(tripId, req.user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payments retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string
  ): Promise<HttpResponse<ReceiptPaymentResponse>> {
    const data = await this.receiptPaymentService.findReceiptPaymentById(id, req.user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payment retrieved successfully',
      data,
    };
  }
}
