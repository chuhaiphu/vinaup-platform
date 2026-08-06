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
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';
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
import { CheckAbility } from 'src/_core/decorators/check-ability.decorator';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';
import { OrganizationPermissionGuard } from 'src/_core/guards/organization-permission.guard';

import { CreateOrganizationMemberRequest } from '../dtos/create-organization-member.request.dto';
import type { OrganizationMemberResponse } from '../dtos/organization-member.response.dto';
import { UpdateOrganizationMemberRequest } from '../dtos/update-organization-member.request.dto';
import { OrganizationMemberService } from '../services/organization-member.service';

@Controller('organization-member')
export class OrganizationMemberController {
  constructor(
    private readonly organizationMemberService: OrganizationMemberService
  ) {}

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.ORGANIZATION_MEMBER)
  @Post('/')
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createOrganizationMemberReq: CreateOrganizationMemberRequest
  ): Promise<HttpResponse<OrganizationMemberResponse>> {
    const data = await this.organizationMemberService.createOrganizationMember(
      createOrganizationMemberReq,
      req.user.userId
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Organization member created successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async findByOrganizationId(
    @Query('organizationId') organizationId: string
  ): Promise<HttpResponse<OrganizationMemberResponse[]>> {
    const data =
      await this.organizationMemberService.getOrganizationMembersByOrganizationId(
        organizationId
      );
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization members retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(
    @Param('id') id: string
  ): Promise<HttpResponse<OrganizationMemberResponse>> {
    const data = await this.organizationMemberService.getOrganizationMemberById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization member retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationMemberReq: UpdateOrganizationMemberRequest
  ): Promise<HttpResponse<OrganizationMemberResponse>> {
    const data = await this.organizationMemberService.updateOrganizationMember(
      id,
      updateOrganizationMemberReq
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization member updated successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(
    @Param('id') id: string,
    @Body() deleteOrganizationMemberReq: { organizationId: string }
  ): Promise<HttpResponse<void>> {
    await this.organizationMemberService.deleteOrganizationMember(
      id,
      deleteOrganizationMemberReq
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization member deleted successfully',
    };
  }

  // The avatar is UPLOADED here; a member avatar is never pruned because
  // CarAssignmentEvent snapshots it. → docs/pattern/STORAGE-PATTERN.md
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
  ): Promise<HttpResponse<OrganizationMemberResponse>> {
    const data = await this.organizationMemberService.updateAvatar(id, file);
    return { statusCode: HttpStatus.OK, message: 'Member avatar updated successfully', data };
  }
}
