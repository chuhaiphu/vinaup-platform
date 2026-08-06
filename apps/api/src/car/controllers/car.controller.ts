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
import type { AuthenticatedRequest, HttpResponse } from 'src/_common/interfaces/interface';
import { CheckAbility } from 'src/_core/decorators/check-ability.decorator';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';
import { OrganizationPermissionGuard } from 'src/_core/guards/organization-permission.guard';

import { CarFilterRequest } from '../dtos/car-filter.request.dto';
import type { CarWithMeta } from '../dtos/car.response.dto';
import { CreateCarRequest } from '../dtos/create-car.request.dto';
import { UpdateCarRequest } from '../dtos/update-car.request.dto';
import { CarService } from '../services/car.service';

@Controller('car')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.READ, PERMISSION_RESOURCE.CAR)
  @Get('/organization/:organizationId')
  async findByOrganizationId(
    @Param('organizationId') organizationId: string,
    @Query() filter: CarFilterRequest,
  ): Promise<HttpResponse<CarWithMeta[]>> {
    const data = await this.carService.findCarsByOrganizationId(organizationId, filter);
    return { statusCode: HttpStatus.OK, message: 'Cars retrieved successfully', data };
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.READ, PERMISSION_RESOURCE.CAR)
  @Get('/organization/:organizationId/expiring')
  async findExpiringByOrganizationId(
    @Param('organizationId') organizationId: string,
  ): Promise<HttpResponse<CarWithMeta[]>> {
    const data = await this.carService.findExpiringCars(organizationId);
    return { statusCode: HttpStatus.OK, message: 'Expiring cars retrieved successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(
    @Param('id') id: string,
  ): Promise<HttpResponse<CarWithMeta>> {
    const data = await this.carService.findCarById(id);
    return { statusCode: HttpStatus.OK, message: 'Car retrieved successfully', data };
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.CAR)
  @Post('/')
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createCarReq: CreateCarRequest,
  ): Promise<HttpResponse<CarWithMeta>> {
    const data = await this.carService.createCar(createCarReq, req.user.userId);
    return { statusCode: HttpStatus.CREATED, message: 'Car created successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateCarReq: UpdateCarRequest,
  ): Promise<HttpResponse<CarWithMeta>> {
    const data = await this.carService.updateCar(id, updateCarReq);
    return { statusCode: HttpStatus.OK, message: 'Car updated successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(
    @Param('id') id: string,
  ): Promise<HttpResponse<null>> {
    await this.carService.deleteCarById(id);
    return { statusCode: HttpStatus.OK, message: 'Car deleted successfully', data: null };
  }

  // Car images are UPLOADED here, not named by the client: the server derives the storage
  // key and the response carries the public URL. → docs/pattern/STORAGE-PATTERN.md
  @UseGuards(JwtAuthGuard)
  @Post('/:id/feature-image')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async updateFeatureImage(
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
  ): Promise<HttpResponse<CarWithMeta>> {
    const data = await this.carService.updateFeatureImage(id, file);
    return { statusCode: HttpStatus.OK, message: 'Car feature image updated successfully', data };
  }


  @UseGuards(JwtAuthGuard)
  @Post('/:id/additional-images')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async addAdditionalImage(
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
  ): Promise<HttpResponse<CarWithMeta>> {
    const data = await this.carService.addAdditionalImage(id, file);
    return { statusCode: HttpStatus.OK, message: 'Car image added successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id/additional-images')
  async removeAdditionalImage(
    @Param('id') id: string,
    @Body('imageUrl') imageUrl: string,
  ): Promise<HttpResponse<CarWithMeta>> {
    const data = await this.carService.removeAdditionalImage(id, imageUrl);
    return { statusCode: HttpStatus.OK, message: 'Car image removed successfully', data };
  }
}
