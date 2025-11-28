import { IUseCase } from '@plex-tinder/shared/utils';
import { IMediaCenterRepository, PlexCredentials } from '@plex-tinder/mediacenter/core';
import { PlexRepository } from '@plex-tinder/mediacenter/repos/plex';

type Output = {
  code: string;
  id: number;
  authUrl: string;
};

export class GetPlexAuthPinUseCase implements IUseCase<void, Output> {
  constructor(private readonly plexRepo: PlexRepository) {}

  static authorization = {
    policies: ['actionPlans_maintenance_access' as const],
    useOrForPolicies: false,
  };

  async execute() {
    return await this.plexRepo.getPin();
  }
}

