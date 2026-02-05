import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { LoginService } from '../login/login.service';
import { randomBytes } from 'crypto';
import { UserDto } from '../../users/dto/user.dto';
import { Role } from '../login/enums/role.enum';
import { UserStatus } from '../../users/models/users.model';
import { HashingService } from '../../common/hashing/hashing.service';
import { MailerService } from '../../common/mailer/mailer.service';
import { registrationEmail } from '../../common/mailer/mailer.constants';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly usersService: UsersService,
        private readonly loginService: LoginService,
        private readonly hashingService: HashingService,
        private readonly mailerService: MailerService,
    ) { }

    async handleSocialLogin(profile: any) {
        const { email, username, discordId } = profile;

        if (!email) {
            throw new UnauthorizedException('Email is required for authentication');
        }

        let user;

        try {
            user = await this.usersService.findByEmail(email);
        } catch (error) {
            // User not found, create new one
        }

        if (!user) {
            const password = randomBytes(16).toString('hex');
            const hashedPassword = await this.hashingService.hash(password);

            const newUser: UserDto = {
                email,
                username: username || email.split('@')[0],
                name: username || email.split('@')[0],
                password: hashedPassword,
                role: Role.USER,
                status: UserStatus.ACTIVE,
                discord_id: discordId,
                discord_username: username,
            };

            try {
                const createdUser = await this.usersService.create(newUser);

                // Send registration email
                this.sendMailRegisterUser({ ...newUser, password: password } as any).catch((err: unknown) =>
                    console.error('Send mail failed but continuing registration', err),
                );

                user = await this.usersService.findByEmail(createdUser.email);
            } catch (error) {
                throw new UnauthorizedException('Failed to create user from social login');
            }
        }

        return this.loginService.generateTokens(user);
    }

    private async sendMailRegisterUser(user: any): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: user.email,
                from: 'from@example.com',
                subject: 'Registration successful ✔',
                html: registrationEmail(user),
            });
            console.log('User Registration: Send Mail successfully!');
        } catch (err: unknown) {
            console.error('User Registration: Send Mail failed!', err);
        }
    }
}
