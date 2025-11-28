import {
  AuthorizeAndTryCatchUseCase,
  IUseCase,
} from '@plex-tinder/shared/utils';

import { Logger } from '@nestjs/common';
import {
  IMediaCenterCredentials,
  IMediaCenterRepository,
} from '@plex-tinder/mediacenter/core';
import { HttpStatusCode } from 'axios';
import { IMovieRepository } from '../repositories/MovieRepository.interface';

type Input = {
  userId: string;
};
type Output = {
  status: HttpStatusCode;
  savedCount: number;
  foundCount: number;
};
export class SyncLibrariesUseCase implements IUseCase<Input, Output> {
  constructor(
    private readonly mediaCenterRepo: IMediaCenterRepository<IMediaCenterCredentials>,
    private readonly movieRepository: IMovieRepository
  ) {}

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

    const mediaCenterLibraries = await this.mediaCenterRepo.getLibraries(
      input.userId
    );

    if (mediaCenterLibraries) {
      const saved = await this.movieRepository.createManyLibraries(
        input.userId,
        mediaCenterLibraries
      );
      return {
        success: {
          status: HttpStatusCode.Created,
          savedCount: saved
            ? mediaCenterLibraries.filter(
                (lib) => !saved.map((s) => s.guid).includes(lib.guid)
              ).length
            : 0,
          foundCount: mediaCenterLibraries ? mediaCenterLibraries.length : 0,
        },
        error: null,
      };
    }

    return {
      success: null,
      error: Error('Invalid credentals'),
    };
  }
}
