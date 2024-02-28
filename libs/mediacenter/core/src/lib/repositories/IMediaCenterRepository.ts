import { CheckError } from '@plex-tinder/shared/utils';
import { IMediaCenterCredentials } from '../domain/IMediaCenterCredentials.interface';
import { MediaCenterGenre, MediaCenterMovie } from '../domain/MediaCenterMovie';
import { MoviesCategory } from '@plex-tinder/mediacenter/repos/plex';
import { MediaCenterLibrary } from '../domain/MediaCenterLibrary';

export type MediaCenterCheckError = CheckError<'invalid_credentials'>;

export interface IMediaCenterRepository<T extends IMediaCenterCredentials> {
  checkCredentials: (input: T) => Promise<boolean | MediaCenterCheckError>;
  saveCredentials: (input: T) => Promise<boolean>;

  getMovies: ({
    category,
    userId,
  }: {
    category: MoviesCategory;
    userId: string;
  }) => Promise<MediaCenterMovie[] | null>;
  getAllGenres: (userId: string) => Promise<MediaCenterGenre[] | null>;
  getLibraries: (userId: string) => Promise<MediaCenterLibrary[] | null>;
}
