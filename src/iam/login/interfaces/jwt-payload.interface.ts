import { Role } from '../enums/role.enum';

export interface JWTPayload {
  /**
   * O 'subject' do token, que é o ID do usuário.
   */
  sub: number;

  /**
   * (mesmo que sub, para compatibilidade).
   */
  id: number;

  email: string;

  role: Role;
}
