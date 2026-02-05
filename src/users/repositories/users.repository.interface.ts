import { UserProfileDto } from '../dto/user-profile.dto';
import { UserUpdateDto } from '../dto/user-update.dto';
import { UserDto } from '../dto/user.dto';
import { Users } from '../models/users.model';
import { AccountsUsers } from '../interfaces/accounts-users.interface';
import { UpdateResult } from 'typeorm';

export interface UsersRepository {
  findAll(): Promise<Users[]>;
  findByEmail(email: string): Promise<Users | null>;
  findBySub(sub: number): Promise<Users>;
  findById(userId: string): Promise<Users | null>;
  create(userDto: UserDto): Promise<AccountsUsers>;
  updateByEmail(email: string): Promise<Users>;
  updateByPassword(email: string, password: string): Promise<Users>;
  updateUserProfile(id: string, userProfileDto: UserProfileDto): Promise<Users>;
  updateUser(id: string, userUpdateDto: UserUpdateDto): Promise<UpdateResult>;
  updateLastLoginIp(id: number, ip: string): Promise<Users>;
  deleteUser(user: any): Promise<void>;
}

export const USERS_REPOSITORY_TOKEN = 'users-repository-token';
