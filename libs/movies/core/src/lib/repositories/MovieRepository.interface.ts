import {
  MediaCenterGenre,
  MediaCenterMovie,
} from '@plex-tinder/mediacenter/core';
import { Movie } from '../domain/Movie';

export interface IMovieRepository {
  getOne: (id: string) => Promise<Movie | null>;
  getAll: (count: number) => Promise<Movie[] | null>;
  createManyMovies: (movies: MediaCenterMovie[]) => Promise<Movie[] | null>;
  createManyGenres: (genres: MediaCenterGenre[]) => Promise<{ id: number }[]>;
  // getPaginatedActionsByPark: (parkKey: string, params?: ActionsParams) => Promise<GetActionsByParkReturnType>;
  // getActionsByPark: (parkId: string, filters?: ActionsFilters, safelyMap?: boolean) => Promise<Action[]>;
  // upsert: (action: UpsertAction) => Promise<Action>;
}
