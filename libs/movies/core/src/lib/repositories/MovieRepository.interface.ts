import {
  MediaCenterGenre,
  MediaCenterLibrary,
  MediaCenterMovie,
} from '@plex-tinder/mediacenter/core';
import { SearchCriteria } from '../constants';
import { Movie } from '../domain/Movie';

export interface IMovieRepository {
  getOne: (id: string) => Promise<Movie | null>;
  getAll: (count: number) => Promise<Movie[] | null>;
  getMoviesFromCriterias: (
    criterias?: SearchCriteria,
    count?: number
  ) => Promise<Movie[] | null>;
  getLibraries: (userId: string) => Promise<MediaCenterLibrary[]>;
  createManyLibraries: (libraries: MediaCenterLibrary[]) => Promise<Library[]>;
  createManyMovies: (movies: MediaCenterMovie[]) => Promise<Movie[] | null>;
  createManyGenres: (genres: MediaCenterGenre[]) => Promise<{ id: number }[]>;
  // getPaginatedActionsByPark: (parkKey: string, params?: ActionsParams) => Promise<GetActionsByParkReturnType>;
  // getActionsByPark: (parkId: string, filters?: ActionsFilters, safelyMap?: boolean) => Promise<Action[]>;
  // upsert: (action: UpsertAction) => Promise<Action>;
}
