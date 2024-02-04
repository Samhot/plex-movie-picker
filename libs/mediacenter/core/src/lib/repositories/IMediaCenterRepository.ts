import { CheckError } from '@plex-tinder/shared/utils';
import { IMediaCenterCredentials } from '../domain/IMediaCenterCredentials.interface';
import { MediaCenterGenre, MediaCenterMovie } from '../domain/MediaCenterMovie';

export type MediaCenterCheckError = CheckError<'invalid_credentials'>;

export interface IMediaCenterRepository<T extends IMediaCenterCredentials> {
  checkCredentials: (input: T) => Promise<boolean | MediaCenterCheckError>;
  saveCredentials: (input: T) => Promise<boolean>;

  getAllMovies: (mediacenter: 'plex') => Promise<MediaCenterMovie[] | null>;
  getAllGenres: (mediacenter: 'plex') => Promise<MediaCenterGenre[] | null>;
}
