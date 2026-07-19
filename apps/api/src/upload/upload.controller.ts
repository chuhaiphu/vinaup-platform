import {
  Controller,
  Post,
  Delete,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import type {
  AuthenticatedRequest,
  HttpResponse,
} from 'src/_common/interfaces/interface';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';

import type { UploadImageResponse } from './dtos/upload-image.response.dto';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadImage(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<HttpResponse<UploadImageResponse>> {
    const result = await this.uploadService.uploadImageByCurrentUser(
      file,
      req.user.userId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Image uploaded successfully',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteImage(
    @Body('path') path: string,
  ): Promise<HttpResponse<null>> {
    await this.uploadService.deleteFile(path);

    return {
      statusCode: HttpStatus.OK,
      message: 'Image deleted successfully',
      data: null,
    };
  }
}