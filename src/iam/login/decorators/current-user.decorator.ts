import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_USER_KEY, REQUEST_USER_ENTITY_KEY } from '../../iam.constants';

/**
 * Decorator para obter o usuário logado
 * @param getEntity - Se true, retorna o usuário completo do banco (sem senha). Se false, retorna apenas o payload JWT
 */
export const CurrentUser = createParamDecorator(
  (getEntity: boolean = true, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    // Se getEntity for true e houver usuário completo no request, retorna ele
    if (getEntity && request[REQUEST_USER_ENTITY_KEY]) {
      return request[REQUEST_USER_ENTITY_KEY];
    }
    
    // Caso contrário, retorna o payload JWT
    return request[REQUEST_USER_KEY];
  },
);

