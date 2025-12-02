import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { anonymous, bearer } from 'better-auth/plugins';

export const auth = betterAuth({
  // basePath n'est pas nécessaire car le middleware Express est monté sur /api/auth
  database: prismaAdapter(new PrismaClient(), {
    provider: "postgresql",
  }),
  trustedOrigins: ["http://localhost:3000", "http://localhost:4200"],  // Origines autorisées
  emailAndPassword: {  
    enabled: true
  },
  plugins: [
    anonymous(),
    bearer(),  // Permet d'utiliser Authorization: Bearer <token>
  ],
  // Ajout des fournisseurs sociaux possible ici (Google, GitHub...)
});

