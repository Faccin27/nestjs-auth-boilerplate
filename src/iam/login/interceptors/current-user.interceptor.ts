import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from '../../../users/users.service';
import { REQUEST_USER_KEY, REQUEST_USER_ENTITY_KEY } from '../../iam.constants';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private readonly usersService: UsersService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const userPayload = request[REQUEST_USER_KEY];

    // Se houver um payload de usuário (token válido), busca o usuário completo do banco
    if (userPayload?.sub) {
      try {
        const user = await this.usersService.findBySub(userPayload.sub);
        // Remove a senha antes de adicionar ao request
        const { password, ...userWithoutPassword } = user;
        request[REQUEST_USER_ENTITY_KEY] = userWithoutPassword;
      } catch (error) {
        // Se não encontrar o usuário, continua sem adicionar ao request
        // O guard já validou o token, então isso não deve acontecer normalmente
        console.warn('User not found in database but token is valid:', error);
      }
    }

    return next.handle();
  }
}

