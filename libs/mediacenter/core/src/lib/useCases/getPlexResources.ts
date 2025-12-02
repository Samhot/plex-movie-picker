import {
  IResponse,
  IUseCase,
} from '@plex-tinder/shared/utils';
import { IPlexAuthRepository } from '../repositories/IPlexAuthRepository';
import { PlexResourcesResponse } from '../domain/PlexResourcesResponse';

type Input = { token: string };
type Output = PlexResourcesResponse[];

export class GetPlexResourcesUseCase implements IUseCase<Input, Output> {
  constructor(private readonly plexRepo: IPlexAuthRepository) {}

  static authorization = {
    policies: ['mediacenter_plex_resources_get' as const],
    useOrForPolicies: false,
  };

  async authorize(input: Input): Promise<boolean> {
    return !!input.token;
  }

  async execute(input: Input): Promise<IResponse<Output, Error>> {
    try {
      const resources: PlexResourcesResponse[] = await this.plexRepo.getResources(input.token);
      
      if (resources && resources.length > 0) {
        return {
          success: resources,
          error: null,
        };
      }
      
      return {
        success: null,
        error: new Error('No resources found'),
      };
    } catch (error) {
      return {
        success: null,
        error: error as Error,
      };
    }
  }
}
