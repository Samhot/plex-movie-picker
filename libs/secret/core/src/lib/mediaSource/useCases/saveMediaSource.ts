import {
  AuthorizeAndTryCatchUseCase,
  IUseCase,
} from '@plex-tinder/shared/utils';
import { MediaSource } from '../domain/MediaSource';
import { Logger } from '@nestjs/common';
import { IMediaSourceRepository } from '../repository/MediaSourceRepository.interface';
import { CreateMediaSource } from '../domain/CreateMediaSource';

type Input = CreateMediaSource;
type Output = MediaSource | null;
export class SaveMediaSourceUseCase implements IUseCase<Input, Output> {
  constructor(private readonly mediaSourceRepo: IMediaSourceRepository) {}

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
    const source = await this.mediaSourceRepo.saveMediaSource(input);

    return {
      success: source,
      error: null,
    };
  }
}

