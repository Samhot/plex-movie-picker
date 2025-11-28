import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

// TODO: Déplacer la configuration better-auth dans un fichier dédié shared/config
const auth = betterAuth({
  database: prismaAdapter(new PrismaClient(), {
    provider: "postgresql",
  }),
  emailAndPassword: {  
    enabled: true
  },
  // Ajout des fournisseurs sociaux possible ici (Google, GitHub...)
});

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

