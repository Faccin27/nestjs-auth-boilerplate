import { PickType } from '@nestjs/swagger';
import { UserDto } from '../../../users/dto/user.dto';

export class RegisterUserDto extends PickType(UserDto, [
    'name',
    'username',
    'email',
    'password',
] as const) { }
