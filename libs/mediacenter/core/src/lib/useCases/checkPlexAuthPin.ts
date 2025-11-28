import { IUseCase } from '@plex-tinder/shared/utils';
import { PlexRepository } from '@plex-tinder/mediacenter/repos/plex';

type Input = { pinId: number };
type Output = string | null;

export class CheckPlexAuthPinUseCase implements IUseCase<Input, Output> {
  constructor(private readonly plexRepo: PlexRepository) {}

  static authorization = {
    policies: ['actionPlans_maintenance_access' as const],
    useOrForPolicies: false,
  };

  async authorize(input: Input) {
    return !!input.pinId;
  }

  async execute(input: Input) {
    return {
      success: await this.plexRepo.checkPin(input.pinId),
      error: null,
    };
  }
}

