import { UseGuards } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';

import { User } from '@plex-tinder/auth/core';
import {
  AuthorizationGuard,
  CurrentUser,
  TypedQuery,
} from '@plex-tinder/shared/nest';

import { AuthService } from './auth.service';

@UseGuards(AuthorizationGuard)
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @TypedQuery(() => String)
  generateCustomToken(@CurrentUser() user: User): Promise<string> {
    return this.authService.generateCustomToken(user.id);
  }
}
