import { Movie } from '../domain/Movie';

export interface IMovieRepository {
  getOne: (id: string) => Promise<Movie | null>;
  // getPaginatedActionsByPark: (parkKey: string, params?: ActionsParams) => Promise<GetActionsByParkReturnType>;
  // getActionsByPark: (parkId: string, filters?: ActionsFilters, safelyMap?: boolean) => Promise<Action[]>;
  // upsert: (action: UpsertAction) => Promise<Action>;
}
