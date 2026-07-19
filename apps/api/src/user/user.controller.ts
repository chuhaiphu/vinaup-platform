import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Request, UseGuards } from "@nestjs/common";

import type { AuthenticatedRequest, HttpResponse } from "src/_common/interfaces/interface";
import { JwtAuthGuard } from "src/_core/guards/jwt-auth.guard";

import { CreateUserRequest } from './dtos/create-user.request.dto';
import { UpdateUserRequest } from './dtos/update-user.request.dto';
import { UserFilterParam } from './dtos/user-filter.param.dto';
import { UserResponse } from './dtos/user.response.dto';
import { UserService } from "./user.service";

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) { }

  @Post('register')
  async register(@Body() createUserRequest: CreateUserRequest): Promise<HttpResponse<UserResponse>> {
    const data = await this.userService.signUp(createUserRequest);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data
    };
  }

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
    @Query() params: UserFilterParam
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
}