import { IUseCase } from '@plex-tinder/shared/utils';
import { IMediaSourceRepository, CreateMediaSource } from '@plex-tinder/secret/core';
import { MediaCenter } from '@prisma/client';

type Input = {
  userId: string;
  serverUrl: string;
  token: string;
};

type Output = {
  configured: boolean;
};

export class ConfigurePlexUseCase implements IUseCase<Input, Output> {
  constructor(private readonly mediaSourceRepo: IMediaSourceRepository) {}

  static authorization = {
    policies: ['mediacenter_plex_configure' as const],
    useOrForPolicies: false,
  };

  async authorize(input: Input) {
    return !!input.userId && !!input.serverUrl && !!input.token;
  }

  async execute(input: Input) {
    const isAuthorized = await this.authorize(input);
    if (!isAuthorized) {
      return {
        success: null,
        error: new Error('Invalid input: userId, serverUrl, and token are required'),
      };
    }

    try {
      const mediaSource: CreateMediaSource = {
        userId: input.userId,
        type: MediaCenter.PLEX,
        url: input.serverUrl,
        credentials: {
          plexToken: input.token,
        },
        isActive: true,
      };

      await this.mediaSourceRepo.saveMediaSource(mediaSource);

      return {
        success: { configured: true },
        error: null,
      };
    } catch (error) {
      return {
        success: null,
        error: error as Error,
      };
    }
  }
}

