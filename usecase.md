## Estrutura do projeto (visão geral)

Em NestJS você organiza o código em **módulos** (classes com `@Module`) que agrupam **controllers** (rotas HTTP) e **providers** (services, repositories, guards, interceptors, etc).

- **`src/main.ts`**: ponto de entrada, cria o app, plugins, swagger, prefixo global `/api`, pipes de validação.
- **`src/app.module.ts`**: “módulo raiz” que conecta banco + importa módulos de domínio.
- **`src/iam/**`**: “Identity & Access Management” (login, register, forgot/change password, e os guards/interceptors).
- **`src/users/**`**: CRUD e rotas relacionadas a usuário.

### Inicialização (bootstrap)
O app sobe em Fastify, configura Swagger, define prefixo `/api` e habilita validação automática de DTOs:

```1:59:src/main.ts
async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter();
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter, { ... });

  await registerFastifyPlugins(app);

  configureSwaggerDocs(app);
  await configureAuthSwaggerDocs(app);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true, ... }));

  await app.listen(port, '0.0.0.0');
}
```

## Como o projeto está “plugado” (módulos)

### `AppModule` (raiz)
Ele configura o TypeORM e importa `IamModule` e `UsersModule`:

```8:36:src/app.module.ts
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.TYPEORM_HOST,
        // ...
        synchronize: true,
        entities: [__dirname + '/**/*.{model,entity}.{ts,js}'],
      }),
    }),
    IamModule,
    UsersModule,
  ],
})
export class AppModule {}
```

### `IamModule`
Agrega os sub-módulos de auth:

```10:21:src/iam/iam.module.ts
@Module({
  imports: [
    LoginModule,
    RegisterModule,
    UsersModule,
    ForgotPasswordModule,
    ChangePasswordModule,
    UtilsModule,
  ],
  providers: [JwtService],
})
export class IamModule {}
```

## Autenticação JWT (por que você toma 401)

A autenticação aqui é global via `APP_GUARD`.

### 1) Guard global de autenticação
No `LoginModule`, o `AuthenticationGuard` é registrado globalmente:

```35:52:src/iam/login/login.module.ts
providers: [
  { provide: APP_GUARD, useClass: AuthenticationGuard },
  { provide: APP_GUARD, useClass: RolesGuard },
  { provide: APP_INTERCEPTOR, useClass: CurrentUserInterceptor },
  // ...
]
```

Isso significa: **toda rota exige token Bearer**, a não ser que você marque a rota/Controller como `@AuthGuard(AuthType.None)` (pública).

### 2) Como o token é validado
`AccessTokenGuard` extrai `Authorization: Bearer <token>`, valida via `JwtService.verifyAsync`, e salva o payload no request:

```17:40:src/iam/login/guards/access-token/access-token.guard.ts
const token = this.extractTokenFromHeader(request);
if (!token) throw new UnauthorizedException();

const payload = await this.jwtService.verifyAsync(token, { secret, audience, issuer });
request[REQUEST_USER_KEY] = payload;
return true;
```

### 3) Como uma rota vira pública
O decorator `@AuthGuard(...)` grava metadata que o `AuthenticationGuard` lê:

```4:7:src/iam/login/decorators/auth-guard.decorator.ts
export const AuthGuard = (...authTypes: AuthType[]) =>
  SetMetadata(AUTH_TYPE_KEY, authTypes);
```

E o `AuthenticationGuard` escolhe qual guard aplicar (Bearer ou None):

```28:33:src/iam/login/guards/authentication/authentication.guard.ts
const authTypes = this.reflector.getAllAndOverride<AuthType[]>(AUTH_TYPE_KEY, [handler, class]) ?? [AuthType.Bearer];
const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();
```

## Como buscar “o usuário logado” (pelo token)

O fluxo é:

1. `AccessTokenGuard` valida token e coloca payload em `request.user`
2. `CurrentUserInterceptor` pega `request.user.sub`, busca o usuário no banco, remove a senha e salva em `request.userEntity`
3. O decorator `@CurrentUser(true)` te entrega `request.userEntity`

### Interceptor que “hidrata” o usuário do banco
```19:33:src/iam/login/interceptors/current-user.interceptor.ts
const userPayload = request[REQUEST_USER_KEY];

if (userPayload?.sub) {
  const user = await this.usersService.findBySub(userPayload.sub);
  const { password, ...userWithoutPassword } = user;
  request[REQUEST_USER_ENTITY_KEY] = userWithoutPassword;
}
```

### Decorator para acessar isso na rota
```8:19:src/iam/login/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator((getEntity: boolean = true, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  if (getEntity && request[REQUEST_USER_ENTITY_KEY]) return request[REQUEST_USER_ENTITY_KEY];
  return request[REQUEST_USER_KEY];
});
```

### Exemplo real no seu projeto: `/api/users/me`
```49:64:src/users/users.controller.ts
@Get('me')
public async getCurrentUser(
  @CurrentUser(true) user: Omit<AccountsUsers, 'password'>,
): Promise<Omit<AccountsUsers, 'password'>> {
  if (!user) throw new NotFoundException('User not found');
  return user;
}
```

## Como proteger rotas para **somente admin**

Você já tem isso pronto com `@Roles(Role.ADMIN)` + `RolesGuard`.

### 1) Marcar a rota como admin-only
Exemplo do próprio projeto:

```146:157:src/users/users.controller.ts
@Delete('/:userId')
@Roles(Role.ADMIN)
public async deleteUser(...) { ... }

@Get('admin/stats')
@Roles(Role.ADMIN)
public async getAdminStats(...) { ... }
```

### 2) Como o RolesGuard decide
Ele lê as roles exigidas e compara com `request.userEntity.role`:

```16:45:src/iam/login/guards/roles/roles.guard.ts
const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [handler, class]);
if (!requiredRoles?.length) return true;

const user = request[REQUEST_USER_ENTITY_KEY];
if (!user) throw new ForbiddenException('User not found in request');

const hasRole = requiredRoles.some((role) => user.role === role);
if (!hasRole) throw new ForbiddenException(`Access denied. Required roles: ${requiredRoles.join(', ')}`);
return true;
```

### O que é “necessário” para isso funcionar
- Seu usuário no banco precisa ter `role = 'admin'` para acessar rotas com `@Roles(Role.ADMIN)`
- O token precisa ser válido (senão 401)
- O interceptor precisa conseguir achar o usuário no banco (senão o `RolesGuard` dá 403)

## Como testar (passo a passo no Postman/Swagger)

- **Login**: `POST /api/auth/login` → pega `accessToken`
- **Chamar rota protegida**: enviar header:

`Authorization: Bearer <accessToken>`

- **Rota admin-only**: o usuário do token precisa ter `role=admin` no banco.

## Conceitos do Nest (mini glossário)

- **Controller**: define as rotas (`@Controller`, `@Get`, `@Post`…)
- **Service**: lógica de negócio, injeta repositórios
- **Provider**: qualquer coisa injetável (service/guard/interceptor/repository)
- **Guard**: decide se a request entra ou não (**auth**, **roles**)
- **Interceptor**: roda antes/depois da rota (aqui: “hidratar” usuário do banco)
- **Decorator**: açúcar para metadata (`@Roles`, `@AuthGuard`) ou extrair dados (`@CurrentUser`)
- **Module**: agrupa tudo e controla DI/imports
