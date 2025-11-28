import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { anonymous } from 'better-auth/plugins';

export const auth = betterAuth({
  database: prismaAdapter(new PrismaClient(), {
    provider: "postgresql",
  }),
  emailAndPassword: {  
    enabled: true
  },
  plugins: [
    anonymous()
  ],
  // Ajout des fournisseurs sociaux possible ici (Google, GitHub...)
});

