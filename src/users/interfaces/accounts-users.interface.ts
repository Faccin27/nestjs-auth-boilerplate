import { Role } from '../../iam/login/enums/role.enum';
import { UserStatus } from '../models/users.model';

export interface AccountsUsers {
  readonly id: number;
  readonly name: string;
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly discord_id?: string;
  readonly discord_username?: string;
  readonly last_login_ip?: string;
  readonly role: Role;
  readonly status: UserStatus;
  readonly created_at: Date;
  readonly updated_at: Date;
}
