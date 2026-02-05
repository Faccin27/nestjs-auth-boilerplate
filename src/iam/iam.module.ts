import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UtilsModule } from '../common/utils/utils.module';
import { MailerModule } from '../common/mailer/mailer.module';
import { UsersModule } from '../users/users.module';
import { ChangePasswordModule } from './change-password/change-password.module';
import { ForgotPasswordModule } from './forgot-password/forgot-password.module';
import { LoginModule } from './login/login.module';
import { RegisterModule } from './register/register.module';
import { DiscordStrategy } from './strategies/discord.strategy';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { HashingService } from '../common/hashing/hashing.service';
import { Argon2Service } from '../common/hashing/argon2.service';

@Module({
  imports: [
    LoginModule,
    RegisterModule,
    UsersModule,
    ForgotPasswordModule,
    ChangePasswordModule,
    UtilsModule,
    MailerModule,
  ],
  controllers: [AuthenticationController],
  providers: [
    {
      provide: HashingService,
      useClass: Argon2Service,
    },
    JwtService,
    DiscordStrategy,
    AuthenticationService,
  ],
})
export class IamModule { }
