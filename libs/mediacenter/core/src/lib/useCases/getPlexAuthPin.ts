import { IUseCase } from '@plex-tinder/shared/utils';
import { IPlexAuthRepository } from '../repositories/IPlexAuthRepository';

type Output = {
  code: string;
  id: number;
  authUrl: string;
};

export class GetPlexAuthPinUseCase implements IUseCase<void, Output> {
  constructor(private readonly plexRepo: IPlexAuthRepository) {}

  static authorization = {
    policies: ['mediacenter_plex_auth_pin_get' as const],
    useOrForPolicies: false,
  };

  async authorize() {
    return true;
  }

  async execute() {
    return {
      success: await this.plexRepo.getPin(),
      error: null,
    };
  }
}

