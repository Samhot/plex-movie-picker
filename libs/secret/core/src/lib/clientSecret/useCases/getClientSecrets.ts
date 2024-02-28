// import { User } from '@plex-tinder/auth/core';
import {
  AuthorizeAndTryCatchUseCase,
  IUseCase,
} from '@plex-tinder/shared/utils';
import { ClientSecret } from '../domain/ClientSecret';
import { Logger } from '@nestjs/common';
import { IClientSecretRepository } from '../repository/ClientSecretRepository.interface';

type Input = { userId: string };
type Output = ClientSecret | null;
export class GetClientSecretsUseCase implements IUseCase<Input, Output> {
  constructor(private readonly clientSecretRepo: IClientSecretRepository) {}

  static authorization = {
    policies: ['actionPlans_maintenance_access' as const],
    useOrForPolicies: false,
  };

  async authorize(_: Input) {
    // TODO: Check if user is allowed to see this action
    Logger.log('TODO: Check if user is allowed to see this action', _);
    return true;
  }

  @AuthorizeAndTryCatchUseCase()
  public async execute(input: Input) {
    await this.authorize(input);
    const secrets = await this.clientSecretRepo.getClientSecrets(input.userId);

    return {
      success: secrets,
      error: null,
    };
  }
}
