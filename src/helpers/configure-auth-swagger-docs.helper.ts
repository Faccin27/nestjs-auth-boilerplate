import { INestApplication } from '@nestjs/common';

export async function configureAuthSwaggerDocs(app: INestApplication) {
  // Autenticação do Swagger desabilitada - acesso livre
  return;
}
