import {
  Controller,
  Put,
  Get,
  Body,
  Param,
  HttpStatus,
  NotFoundException,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { AccountsUsers } from './interfaces/accounts-users.interface';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';
import { CurrentUser } from '../iam/login/decorators/current-user.decorator';
import { JWTPayload } from '../iam/login/interfaces/jwt-payload.interface';
import { Roles } from '../iam/login/decorators/roles.decorator';
import { Role } from '../iam/login/enums/role.enum';

interface GetUserResponse {
  user: AccountsUsers;
  status: number;
}

interface UpdateResponse {
  message: string;
  status: number;
}

@ApiTags('users')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current logged in user information (without password)'
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  public async getCurrentUser(
    @CurrentUser(true) user: Omit<AccountsUsers, 'password'>,
  ): Promise<Omit<AccountsUsers, 'password'>> {
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // O interceptor já remove a senha, então retornamos diretamente
    return user;
  }

  @Get()
  @Roles(Role.ADMIN)

  @ApiOperation({ summary: 'Find all users' })
  @ApiResponse({ status: 200, description: 'Get all users' })
  public async findAllUser(
    @CurrentUser() user: Omit<AccountsUsers, 'password'>,
  ): Promise<AccountsUsers[]> {
    // Exemplo: user contém { sub: number, email: string, id: number, name: string }
    console.log('Usuário logado:', user);
    return this.usersService.findAll();
  }

  @Get('/:userId')
  @Roles(Role.ADMIN)

  @ApiOperation({ summary: 'Find a user by id' })
  @ApiResponse({ status: 200, description: 'Get a user by id' })
  @ApiNotFoundResponse({ description: 'User not found' })
  public async findOneUser(
    @Param('userId') userId: string,
  ): Promise<AccountsUsers> {
    return this.usersService.findById(userId);
  }

  @Get('/:userId/profile')
  @Roles(Role.ADMIN)

  @ApiOperation({ summary: 'Find a user profile by id' })
  @ApiResponse({ status: 200, description: 'Get a user profile by id' })
  @ApiNotFoundResponse({ description: 'User not found' })
  public async getUser(
    @Param('userId') userId: string,
  ): Promise<GetUserResponse> {
    const user = await this.findOneUser(userId);

    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    return {
      user,
      status: HttpStatus.OK,
    };
  }

  @Put('/:userId/profile')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a user profile by id' })
  @ApiResponse({ status: 200, description: 'Update a user profile by id' })
  @ApiBadRequestResponse({ description: 'User profile not updated' })
  public async updateUserProfile(
    @Param('userId') userId: string,
    @Body() userProfileDto: UserProfileDto,
  ): Promise<UpdateResponse> {
    try {
      await this.usersService.updateUserProfile(userId, userProfileDto);

      return {
        message: 'User Updated successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: User not updated!');
    }
  }

  @Put('/:userId')
  @Roles(Role.ADMIN)

  @ApiOperation({ summary: 'Update a user by id' })
  @ApiResponse({ status: 200, description: 'Update a user by id' })
  @ApiBadRequestResponse({ description: 'User not updated' })
  public async updateUser(
    @Param('userId') userId: string,
    @Body() userUpdateDto: UserUpdateDto,
  ): Promise<UpdateResponse> {
    try {
      await this.usersService.updateUser(userId, userUpdateDto);

      return {
        message: 'User Updated successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: User not updated!');
    }
  }

  @Delete('/:userId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a user by id (Admin only)' })
  @ApiResponse({ status: 200, description: 'Delete a user by id' })
  @ApiNoContentResponse({ description: 'User not deleted' })
  public async deleteUser(@Param('userId') userId: string): Promise<void> {
    await this.usersService.deleteUser(userId);
  }

  @Get('admin/stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get admin statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Admin statistics' })
  public async getAdminStats(
    @CurrentUser(true) user: Omit<AccountsUsers, 'password'>,
  ): Promise<{
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    currentAdmin: string;
  }> {
    const allUsers = await this.usersService.findAll();
    const activeUsers = allUsers.filter(
      (u) => u.status === 'active',
    ).length;
    const adminUsers = allUsers.filter((u) => u.role === Role.ADMIN).length;

    return {
      totalUsers: allUsers.length,
      activeUsers,
      adminUsers,
      currentAdmin: user.email,
    };
  }
}
