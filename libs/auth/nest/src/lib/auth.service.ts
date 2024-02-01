import { Injectable } from '@nestjs/common';

import { FirebaseService } from '@plex-tinder/shared/nest';

@Injectable()
export class AuthService {
  constructor(private readonly firebase: FirebaseService) {}

  generateCustomToken(userId: string) {
    return this.firebase.auth.createCustomToken(userId);
  }
}
