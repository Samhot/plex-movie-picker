import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { auth } from '../config/better-auth.config';

@Injectable()
export class BetterAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      throw new UnauthorizedException();
    }

    // On attache l'utilisateur à la requête pour l'utiliser dans les controlleurs via @CurrentUser
    request.user = session.user;
    request.session = session.session;

    return true;
  }
}

