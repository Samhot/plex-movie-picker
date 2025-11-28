import {
  MediaCenterGenre,
  MediaCenterLibrary,
  MediaCenterMovie,
} from '@plex-tinder/mediacenter/core';
import { SearchCriteria } from '../constants';
import { Movie } from '../domain/Movie';
import { Library } from '../domain/Library';

export interface IMovieRepository {
  getOneMovie: (id: string) => Promise<Movie | null>;
  getAllMovies: (count: number) => Promise<Movie[] | null>;
  getMoviesFromCriterias: (
    criterias?: SearchCriteria,
    count?: number
  ) => Promise<Movie[] | null>;
  getLibraries: (userId: string) => Promise<Library[] | null>;
  createManyLibraries: (
    userId: string,
    libraries: MediaCenterLibrary[]
  ) => Promise<Library[] | null>;
  createManyMovies: (movies: MediaCenterMovie[]) => Promise<Movie[] | null>;
  createManyGenres: (genres: MediaCenterGenre[]) => Promise<{ id: number }[]>;
}
