import { Role } from '@/iam/login/enums/role.enum';
import { MaxLength, IsNotEmpty, IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';
import { UserStatus } from '../models/users.model';

export class UserDto {
  @IsString()
  @MaxLength(30)
  readonly name: string;

  @IsString()
  @MaxLength(40)
  readonly username: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(60)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  discord_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  discord_username?: string;
}
