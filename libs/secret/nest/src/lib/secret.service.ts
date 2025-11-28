import { Injectable } from '@nestjs/common';
import {
  CreateMediaSource,
  SaveMediaSourceUseCase,
  GetMediaSourcesUseCase,
} from '@plex-tinder/secret/core';

@Injectable()
export class SecretService {
  constructor(
    private readonly saveMediaSourceUseCase: SaveMediaSourceUseCase,
    private readonly getMediaSourcesUseCase: GetMediaSourcesUseCase
  ) {}

  async createSecret(input: CreateMediaSource) {
    return await this.saveMediaSourceUseCase.execute(input);
  }

  async getUserSecrets(userId: string) {
    return await this.getMediaSourcesUseCase.execute({
      userId,
    });
  }
}
