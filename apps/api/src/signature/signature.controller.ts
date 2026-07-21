import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import type {
  AuthenticatedRequest,
  HttpResponse,
} from 'src/_common/interfaces/interface';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';

import { ManageReceiverSignaturesRequest } from './dtos/manage-receiver-signatures.request.dto';
import { SignatureResponse } from './dtos/signature.response.dto';
import { UpdateSignatureUrlRequest } from './dtos/update-signature-url.request.dto';
import { SignatureService } from './signature.service';

@Controller('signature')
export class SignatureController {
  constructor(private readonly signatureService: SignatureService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('/:id/url')
  async updateUrl(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() updateSignatureUrlRequest: UpdateSignatureUrlRequest
  ): Promise<HttpResponse<SignatureResponse>> {
    const data = await this.signatureService.updateSignatureUrl(
      id,
      updateSignatureUrlRequest,
      req.user.userId
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Signature URL updated successfully',
      data,
    };
  }

  @Post('/manage-receiver-signatures')
  @UseGuards(JwtAuthGuard)
  async manageReceiverSignatures(
    @Body() manageReceiverSignaturesReq: ManageReceiverSignaturesRequest
  ): Promise<HttpResponse<SignatureResponse[]>> {
    const data = await this.signatureService.manageReceiverSignatures(
      manageReceiverSignaturesReq
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Receiver signatures managed successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:id/sign')
  async sign(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest
  ): Promise<HttpResponse<SignatureResponse>> {
    const data = await this.signatureService.signSignature(id, req.user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Signature signed successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:id/cancel')
  async cancel(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest
  ): Promise<HttpResponse<SignatureResponse>> {
    const data = await this.signatureService.handleCancelSignature(
      id,
      req.user.userId
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Signature canceled successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/document/:documentId')
  async findAllByDocumentId(
    @Param('documentId') documentId: string
  ): Promise<HttpResponse<SignatureResponse[]>> {
    const data = await this.signatureService.findSignaturesByDocumentId(documentId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Signatures retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(
    @Param('id') id: string
  ): Promise<HttpResponse<SignatureResponse>> {
    const data = await this.signatureService.findSignatureById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Signature retrieved successfully',
      data,
    };
  }
}
