import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  ALLOWED_MIME_REGEX,
  MAX_FILE_SIZE_BYTES,
} from 'src/_common/constants/storage.constant';
import {
  FileTooLargeException,
  FileTypeInvalidException,
} from 'src/_common/exceptions/storage.exception';
import type {
  AuthenticatedRequest,
  HttpResponse,
} from 'src/_common/interfaces/interface';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';

import { ManageReceiverSignaturesRequest } from './dtos/manage-receiver-signatures.request.dto';
import { SignatureResponse } from './dtos/signature.response.dto';
import { SignatureService } from './signature.service';

@Controller('signature')
export class SignatureController {
  constructor(private readonly signatureService: SignatureService) {}

  // The signature image is UPLOADED here, not named by the client: the server derives the
  // storage key and the response carries the public URL. → docs/pattern/STORAGE-PATTERN.md
  @UseGuards(JwtAuthGuard)
  @Post('/:id/image')
  @UseInterceptors(FileInterceptor('file'))
  async updateImage(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: MAX_FILE_SIZE_BYTES,
            errorMessage: 'FILE_TOO_LARGE',
          }),
          new FileTypeValidator({
            fileType: ALLOWED_MIME_REGEX,
            errorMessage: 'FILE_TYPE_INVALID',
          }),
        ],
        exceptionFactory: (error: string) => {
          if (error === 'FILE_TOO_LARGE') throw new FileTooLargeException();
          throw new FileTypeInvalidException();
        },
      })
    )
    file: Express.Multer.File
  ): Promise<HttpResponse<SignatureResponse>> {
    const data = await this.signatureService.updateSignatureImage(id, file, req.user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Signature image updated successfully',
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
