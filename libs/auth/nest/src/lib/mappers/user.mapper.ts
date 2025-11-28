import { User as DomainUser } from '@plex-tinder/auth/core';

// Infrastructure User (from BetterAuth/Prisma)
export interface BetterAuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function betterAuthUserToDomainUser(user: BetterAuthUser): DomainUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.name,
    disabled: false,
    authorizations: [],
  };
}

