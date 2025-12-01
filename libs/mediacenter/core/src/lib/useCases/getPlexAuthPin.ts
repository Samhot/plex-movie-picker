import { IUseCase } from '@plex-tinder/shared/utils';
import { PlexRepository } from '@plex-tinder/mediacenter/repos/plex';

type Output = {
  code: string;
  id: number;
  authUrl: string;
};

export class GetPlexAuthPinUseCase implements IUseCase<void, Output> {
  constructor(private readonly plexRepo: PlexRepository) {}

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

