import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthType } from '../login/enums/auth-type.enum';
import { AuthGuard as CustomAuthGuard } from '../login/decorators/auth-guard.decorator';
import { AuthenticationService } from './authentication.service';
import { DiscordAuthGuard } from './guards/discord-auth.guard';

@ApiTags('auth')
@CustomAuthGuard(AuthType.None)
@Controller('auth')
export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService) { }

    @Get('discord')
    @UseGuards(DiscordAuthGuard)
    @ApiOperation({ summary: 'Login with Discord' })
    discordAuth() {
        // Helper functionality to redirect to Discord
    }

    @Get('discord/callback')
    @UseGuards(DiscordAuthGuard)
    @ApiOperation({ summary: 'Discord Auth Callback' })
    async discordAuthRedirect(@Req() req: any) {
        return this.authenticationService.handleSocialLogin(req.user);
    }
}
