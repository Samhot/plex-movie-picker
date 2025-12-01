import { IUseCase } from '@plex-tinder/shared/utils';
import { IPlexAuthRepository } from '../repositories/IPlexAuthRepository';

type Input = { pinId: number };
type Output = string | null;

export class CheckPlexAuthPinUseCase implements IUseCase<Input, Output> {
  constructor(private readonly plexRepo: IPlexAuthRepository) {}

  static authorization = {
    policies: ['mediacenter_plex_auth_pin_check' as const],
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

