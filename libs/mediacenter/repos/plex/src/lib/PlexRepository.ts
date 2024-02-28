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
import { LibraryType, MediaCenter } from '@prisma/client';

export class PlexRepository implements IMediaCenterRepository<PlexCredentials> {
  constructor(
    private readonly http: HttpClient,
    private readonly clientSecret: PrismaClientSecretRepository // private cacheManager: Cache
  ) {}
  checkCredentials: (
    input: PlexCredentials
  ) => Promise<boolean | MediaCenterCheckError>;
  saveCredentials: (input: PlexCredentials) => Promise<boolean>;

  async getClientInfos(userId: string) {
    const clientSecret = await this.clientSecret.getClientSecrets(userId);

    if (!clientSecret) return null;
    return {
      secret: clientSecret.secret,
      plexUrl: clientSecret.plexUrl,
      plexToken: clientSecret.plexToken,
      movieSectionId: clientSecret.movieSectionId,
    };
  }

  async getMovies({
    userId,
    category,
  }: {
    userId: string;
    category: MoviesCategory;
  }): Promise<MediaCenterMovie[] | null> {
    const clientInfos = await this.getClientInfos(userId);

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
      plexMovieToDomainMapper(
        movie,
        plexUrl,
        plexToken,
        data.MediaContainer.librarySectionID
      )
    );
  }

  async getAllGenres(userId: string): Promise<MediaCenterGenre[] | null> {
    const clientInfos = await this.getClientInfos(userId);

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

  async getLibraries(userId: string): Promise<MediaCenterLibrary[] | null> {
    const clientInfos = await this.getClientInfos(userId);
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

    await this.clientSecret.saveClientSecret({
      ...clientInfos,
      userId,
      movieSectionId: Number(
        response.data.MediaContainer.Directory.find(
          (library) => library.type === 'movie'
        )?.key
      ),
      mediacenter: MediaCenter.PLEX,
    });

    return response.data.MediaContainer.Directory.map((library) => ({
      id: library.key,
      guid: library.uuid,
      type: library.type === 'movie' ? LibraryType.MOVIE : LibraryType.TV_SHOW,
      title: library.title,
      key: library.key,
    }));
  }
}
