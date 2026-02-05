import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class DiscordAuthGuard extends AuthGuard('discord') {
    getRequest(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        return request;
    }

    getResponse(context: ExecutionContext) {
        const response = context.switchToHttp().getResponse();
        // Check if it's a Fastify response (has .raw property) and return the native response
        return response.raw || response;
    }
}
