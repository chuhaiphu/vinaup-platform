import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { ALLOWED_MIME_REGEX, MAX_FILE_SIZE_BYTES } from 'src/_common/constants/storage.constant';
import {
  FileTooLargeException,
  FileTypeInvalidException,
} from 'src/_common/exceptions/storage.exception';
import type {
  AuthenticatedRequest,
  HttpResponse,
} from 'src/_common/interfaces/interface';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';

import { CreateOrganizationRequest } from '../dtos/create-organization.request.dto';
import type { OrganizationAbilityResponse } from '../dtos/organization-ability.response.dto';
import type { OrganizationIndustryResponse } from '../dtos/organization-industry.response.dto';
import type { OrganizationResponse } from '../dtos/organization.response.dto';
import { UpdateOrganizationRequest } from '../dtos/update-organization.request.dto';
import { OrganizationService } from '../services/organization.service';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findByCurrentUser(
    @Request() req: AuthenticatedRequest
  ): Promise<HttpResponse<OrganizationResponse[]>> {
    const data = await this.organizationService.findOrganizationsByCurrentUser(
      req.user.userId
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Organizations retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/industries')
  async findIndustries(): Promise<HttpResponse<OrganizationIndustryResponse[]>> {
    const data = await this.organizationService.findOrganizationIndustries();
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization industries retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/all')
  async findAllOrganizations(): Promise<HttpResponse<OrganizationResponse[]>> {
    const data = await this.organizationService.findAllOrganizations();
    return {
      statusCode: HttpStatus.OK,
      message: 'All organizations retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id/my-ability')
  async findMyAbility(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest
  ): Promise<HttpResponse<OrganizationAbilityResponse>> {
    const data = await this.organizationService.getMyAbilityInOrganization(
      id,
      req.user.userId
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization ability retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(
    @Param('id') id: string
  ): Promise<HttpResponse<OrganizationResponse>> {
    const data = await this.organizationService.findOrganizationById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createOrganizationReq: CreateOrganizationRequest
  ): Promise<HttpResponse<OrganizationResponse>> {
    const data = await this.organizationService.createOrganization(
      createOrganizationReq,
      req.user.userId
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Organization created successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationReq: UpdateOrganizationRequest
  ): Promise<HttpResponse<OrganizationResponse>> {
    const data = await this.organizationService.updateOrganization(
      id,
      updateOrganizationReq
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization updated successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<HttpResponse<void>> {
    await this.organizationService.deleteOrganization(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization deleted successfully',
    };
  }

  // The logo is UPLOADED here, not named by the client: the server derives the storage key
  // and the response carries the public URL. → docs/pattern/STORAGE-PATTERN.md
  @UseGuards(JwtAuthGuard)
  @Post('/:id/avatar')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async updateAvatar(
    @Param('id') id: string,
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
      }),
    )
    file: Express.Multer.File,
  ): Promise<HttpResponse<OrganizationResponse>> {
    const data = await this.organizationService.updateAvatar(id, file);
    return { statusCode: HttpStatus.OK, message: 'Organization avatar updated successfully', data };
  }
}
