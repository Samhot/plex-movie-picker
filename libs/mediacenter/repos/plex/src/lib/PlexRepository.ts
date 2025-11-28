import { HttpClient } from '@plex-tinder/shared/clients/http';

import {
  IMediaCenterRepository,
  MediaCenterCheckError,
  MediaCenterGenre,
  MediaCenterLibrary,
  MediaCenterMovie,
  PlexCredentials,
} from '@plex-tinder/mediacenter/core';
import { PrismaMediaSourceRepository } from '@plex-tinder/secret/repos/prisma';
import { PlexCredentials as PlexSourceCredentials } from '@plex-tinder/secret/core';
import { plexGenreToDomainMapper } from './plexGenreToDomainMapper';
import { plexMovieToDomainMapper } from './plexMovieToDomainMapper';
import {
  MoviesCategory,
  PlexGenreRequest,
  PlexLibraries,
  PlexLibrary,
} from './types';
import { LibraryType, MediaCenter } from '@prisma/client';

type PlexPinResponse = {
  id: number;
  code: string;
  product: string;
  trusted: boolean;
  qr: string;
  clientIdentifier: string;
  location: {
    code: string;
    european_union_member: boolean;
    continent_code: string;
    country: string;
    city: string;
    time_zone: string;
    postal_code: string;
    subdivisions: string;
    coordinates: string;
  };
  expiresIn: number;
  createdAt: string;
  expiresAt: string;
  authToken: string | null;
  newRegistration: string | null;
};

type PlexResourcesResponse = {
  name: string;
  product: string;
  productVersion: string;
  platform: string;
  platformVersion: string;
  device: string;
  clientIdentifier: string;
  createdAt: string;
  lastSeenAt: string;
  provides: string;
  ownerId: string | null;
  sourceTitle: string | null;
  publicAddress: string;
  accessToken: string;
  owned: boolean;
  home: boolean;
  synced: boolean;
  relay: boolean;
  presence: boolean;
  httpsRequired: boolean;
  publicAddressMatches: boolean;
  dnsRebindingProtection: boolean;
  natLoopbackSupported: boolean;
  connections: {
    protocol: string;
    address: string;
    port: number;
    uri: string;
    local: boolean;
    relay: boolean;
    IPv6: boolean;
  }[];
}[];

export class PlexRepository implements IMediaCenterRepository<PlexCredentials> {
  private readonly plexApiUrl = 'https://plex.tv/api/v2';

  constructor(
    private readonly http: HttpClient,
    private readonly mediaSourceRepo: PrismaMediaSourceRepository,
    private readonly clientIdentifier: string
  ) {}
  checkCredentials: (
    input: PlexCredentials
  ) => Promise<boolean | MediaCenterCheckError>;
  saveCredentials: (input: PlexCredentials) => Promise<boolean>;

  async getPin(): Promise<{ code: string; id: number; authUrl: string }> {
    const response = await this.http.post<PlexPinResponse>(
      `${this.plexApiUrl}/pins`,
      {
        headers: {
          Accept: 'application/json',
          'X-Plex-Product': 'Plex Movie Picker',
          'X-Plex-Client-Identifier': this.clientIdentifier,
        },
      }
    );

    const data = response.data;
    const authUrl = `https://app.plex.tv/auth#?clientID=${this.clientIdentifier}&code=${data.code}&context%5Bdevice%5D%5Bproduct%5D=Plex%20Movie%20Picker`;

    return {
      code: data.code,
      id: data.id,
      authUrl,
    };
  }

  async checkPin(pinId: number): Promise<string | null> {
    const response = await this.http.get<PlexPinResponse>(
      `${this.plexApiUrl}/pins/${pinId}`,
      {
        headers: {
          Accept: 'application/json',
          'X-Plex-Client-Identifier': this.clientIdentifier,
        },
      }
    );

    return response.data.authToken;
  }

  async getResources(token: string): Promise<PlexResourcesResponse> {
    const response = await this.http.get<PlexResourcesResponse>(
      `${this.plexApiUrl}/resources`,
      {
        headers: {
          Accept: 'application/json',
          'X-Plex-Token': token,
          'X-Plex-Client-Identifier': this.clientIdentifier,
        },
      }
    );

    // Filtrer pour ne garder que les serveurs (PMS)
    return response.data.filter((resource) => resource.provides.includes('server'));
  }

  async getClientInfos(userId: string) {
    const sources = await this.mediaSourceRepo.getMediaSources(userId);
    const plexSource = sources.find((s: { type: string; }) => s.type === MediaCenter.PLEX);

    if (!plexSource) return null;

    const credentials = plexSource.credentials as PlexSourceCredentials;

    return {
      secret: 'dummy',
      plexUrl: plexSource.url,
      plexToken: credentials.plexToken,
      movieSectionId: credentials.movieSectionId,
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

    // Mise à jour avec le nouveau repository
    // On reconstruit l'objet pour saveMediaSource
    // Attention: getClientInfos retourne un mix url/credentials.
    
    await this.mediaSourceRepo.saveMediaSource({
      userId,
      type: MediaCenter.PLEX,
      url: clientInfos.plexUrl,
      credentials: {
          plexToken: clientInfos.plexToken,
          movieSectionId: Number(
            response.data.MediaContainer.Directory.find(
              (library) => library.type === 'movie'
            )?.key
          ),
      },
      isActive: true
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
