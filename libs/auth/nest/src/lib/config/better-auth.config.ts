import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

export const auth = betterAuth({
  database: prismaAdapter(new PrismaClient(), {
    provider: "postgresql",
  }),
  emailAndPassword: {  
    enabled: true
  },
  // Ajout des fournisseurs sociaux possible ici (Google, GitHub...)
});

