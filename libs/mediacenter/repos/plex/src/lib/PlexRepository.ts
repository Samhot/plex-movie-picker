import { HttpClient } from '@plex-tinder/shared/clients/http';

import {
  IMediaCenterRepository,
  MediaCenterCheckError,
  MediaCenterGenre,
  MediaCenterLibrary,
  MediaCenterMovie,
  PlexCredentials,
} from '@plex-tinder/mediacenter/core';
import { PrismaClientSecretRepository } from '@plex-tinder/secret/repos/prisma';
import { plexGenreToDomainMapper } from './plexGenreToDomainMapper';
import { plexMovieToDomainMapper } from './plexMovieToDomainMapper';
import {
  MoviesCategory,
  PlexGenreRequest,
  PlexLibraries,
  PlexLibrary,
} from './types';
import { LibraryType } from '@prisma/client';

export class PlexRepository implements IMediaCenterRepository<PlexCredentials> {
  constructor(
    private readonly http: HttpClient,
    private readonly clientSecret: PrismaClientSecretRepository // private cacheManager: Cache
  ) {}
  checkCredentials: (
    input: PlexCredentials
  ) => Promise<boolean | MediaCenterCheckError>;
  saveCredentials: (input: PlexCredentials) => Promise<boolean>;

  async getClientInfos(id: string) {
    const clientSecret = await this.clientSecret.getClientSecrets({
      id,
    });

    if (!clientSecret) return null;
    return {
      secret: clientSecret.secret,
      plexUrl: clientSecret.plexUrl,
      plexToken: clientSecret.plexToken,
      movieSectionId: clientSecret.movieSectionId,
    };
  }

  async getMovies(
    category: MoviesCategory
  ): Promise<MediaCenterMovie[] | null> {
    const clientInfos = await this.getClientInfos('cls7wxyvw000012cak9nittst');

    if (!clientInfos) return null;
    const { plexUrl, plexToken, movieSectionId } = clientInfos;

    const url = `${plexUrl}/library/sections/${movieSectionId}/${category}`;

    type Params = {
      headers: {
        'X-Plex-Token': string;
        Accept: string;
        'X-Plex-Container-Size'?: string;
      };
    };

    const params: Params = {
      headers: {
        'X-Plex-Token': plexToken,
        Accept: 'application/json',
      },
    };
    if (category === 'recentlyAdded') {
      params.headers['X-Plex-Container-Size'] = '10';
    }

    const response = await this.http.get<string>(`${url}`, params);
    const data: PlexLibrary = JSON.parse(response.data);

    return data.MediaContainer.Metadata.map((movie) =>
      plexMovieToDomainMapper(movie, plexUrl, plexToken)
    );
  }

  async getAllGenres(): Promise<MediaCenterGenre[] | null> {
    const clientInfos = await this.getClientInfos('cls7wxyvw000012cak9nittst');

    if (!clientInfos) return null;
    const { plexUrl, plexToken, movieSectionId } = clientInfos;

    const url = `${plexUrl}/library/sections/${movieSectionId}/genre`;
    const params = {
      headers: {
        'X-Plex-Token': plexToken,
        Accept: 'application/json',
      },
    };

    const response = await this.http.get<string>(`${url}`, params);
    const data: PlexGenreRequest = JSON.parse(response.data);

    return data.MediaContainer.Directory.map((genre) =>
      plexGenreToDomainMapper(genre)
    );
  }

  async getLibraries(): Promise<MediaCenterLibrary[] | null> {
    const clientInfos = await this.getClientInfos('cls7wxyvw000012cak9nittst');
    if (!clientInfos) return null;
    const params = {
      headers: {
        'X-Plex-Token': clientInfos?.plexToken,
        Accept: 'application/json',
      },
    };
    const response = await this.http.get<PlexLibraries>(
      '/library/sections',
      params
    );

    return response.data.MediaContainer.Directory.map((library) => ({
      id: library.key,
      guid: library.uuid,
      type: library.type === 'movie' ? LibraryType.MOVIE : LibraryType.TV_SHOW,
      title: library.title,
      key: library.key,
    }));
  }
}
