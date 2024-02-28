import { Injectable } from '@nestjs/common';
import {
  CreateClientSecret,
  CreateClientSecretsUseCase,
  GetClientSecretsUseCase,
} from '@plex-tinder/secret/core';

@Injectable()
export class SecretService {
  constructor(
    private readonly createClientSecretUseCase: CreateClientSecretsUseCase,
    private readonly getClientSecretUseCase: GetClientSecretsUseCase
  ) {}

  async createSecret(input: CreateClientSecret) {
    return await this.createClientSecretUseCase.execute(input);
  }

  async getUserSecrets(userId: string) {
    return await this.getClientSecretUseCase.execute({
      userId,
    });
  }
}
