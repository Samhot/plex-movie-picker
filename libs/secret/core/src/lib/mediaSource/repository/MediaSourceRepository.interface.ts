import { MediaSource } from '../domain/MediaSource';
import { CreateMediaSource } from '../domain/CreateMediaSource';

export interface IMediaSourceRepository {
  getMediaSources(userId: string): Promise<MediaSource[]>;
  saveMediaSource(mediaSource: CreateMediaSource): Promise<MediaSource>;
}

