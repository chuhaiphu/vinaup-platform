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
import { memoryStorage } from 'multer';

import { ALLOWED_MIME_REGEX, MAX_FILE_SIZE_BYTES } from 'src/_common/constants/storage.constant';
import {
  FileTooLargeException,
  FileTypeInvalidException,
} from 'src/_common/exceptions/storage.exception';
import type { AuthenticatedRequest, HttpResponse } from "src/_common/interfaces/interface";
import { JwtAuthGuard } from "src/_core/guards/jwt-auth.guard";

import { UpdateUserRequest } from './dtos/update-user.request.dto';
import { UserFilterRequest } from './dtos/user-filter.request.dto';
import type { UserResponse } from './dtos/user.response.dto';
import { UserService } from "./user.service";

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateUser(
    @Request() req: AuthenticatedRequest,
    @Body() updateUserRequest: UpdateUserRequest,
  ): Promise<HttpResponse<UserResponse>> {
    const data = await this.userService.updateUser(req.user.userId, updateUserRequest);
    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      data
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getMe(@Request() req: AuthenticatedRequest): Promise<HttpResponse<UserResponse>> {
    const data = await this.userService.findUserById(req.user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'User retrieved successfully',
      data
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  async searchUsers(
    @Query() params: UserFilterRequest
  ): Promise<HttpResponse<UserResponse[]>> {
    const data = await this.userService.searchUsers(params);
    return {
      statusCode: HttpStatus.OK,
      message: 'Users found',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("/:id")
  async findById(
    @Param("id") id: string
  ): Promise<HttpResponse<UserResponse>> {
    const data = await this.userService.findUserById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User retrieved successfully',
      data
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("")
  async findByEmail(
    @Request() req: AuthenticatedRequest,
    @Query("email") email: string
  ): Promise<HttpResponse<UserResponse | null>> {
    const data = await this.userService.findUserByEmail(email, req.user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'User retrieved successfully',
      data
    }
  }

  // The avatar is UPLOADED here, not named by the client: the server derives the storage key
  // and the response carries the public URL. → docs/pattern/STORAGE-PATTERN.md
  @UseGuards(JwtAuthGuard)
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async updateAvatar(
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
      }),
    )
    file: Express.Multer.File,
  ): Promise<HttpResponse<UserResponse>> {
    const data = await this.userService.updateAvatar(req.user.userId, file);
    return { statusCode: HttpStatus.OK, message: 'Avatar updated successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/avatar')
  async removeAvatar(
    @Request() req: AuthenticatedRequest,
  ): Promise<HttpResponse<UserResponse>> {
    const data = await this.userService.removeAvatar(req.user.userId);
    return { statusCode: HttpStatus.OK, message: 'Avatar removed successfully', data };
  }
}
