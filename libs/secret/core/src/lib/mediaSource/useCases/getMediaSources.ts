import {
  AuthorizeAndTryCatchUseCase,
  IUseCase,
} from '@plex-tinder/shared/utils';
import { MediaSource } from '../domain/MediaSource';
import { IMediaSourceRepository } from '../repository/MediaSourceRepository.interface';

type Input = { userId: string };
type Output = MediaSource[] | null;

export class GetMediaSourcesUseCase implements IUseCase<Input, Output> {
  constructor(private readonly mediaSourceRepo: IMediaSourceRepository) {}

  static authorization = {
    policies: ['actionPlans_maintenance_access' as const],
    useOrForPolicies: false,
  };

  async authorize(input: Input) {
    return !!input.userId;
  }

  @AuthorizeAndTryCatchUseCase()
  public async execute(input: Input) {
    await this.authorize(input);
    const sources = await this.mediaSourceRepo.getMediaSources(input.userId);

    return {
      success: sources,
      error: null,
    };
  }
}
