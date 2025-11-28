import {
  AuthorizationData,
  AuthorizeAndTryCatchUseCase,
  IResponse,
  IUseCase,
} from '@plex-tinder/shared/utils';
import { PlexRepository } from '@plex-tinder/mediacenter/repos/plex';
import { PlexResourcesResponse } from '../domain/PlexResourcesResponse';

type Input = { token: string };
type Output = PlexResourcesResponse[];

export class GetPlexResourcesUseCase implements IUseCase<Input, Output> {
  constructor(private readonly plexRepo: PlexRepository) {}
  authorize(input: Input): Promise<boolean> | boolean {
    throw new Error('Method not implemented.');
  }
  authorization?: AuthorizationData | AuthorizationData[] | undefined;

  static authorization = {
    policies: ['actionPlans_maintenance_access' as const],
    useOrForPolicies: false,
  };

  @AuthorizeAndTryCatchUseCase()
  async execute(input: Input): Promise<IResponse<Output, Error>> {
    const resources: PlexResourcesResponse[] = await this.plexRepo.getResources(input.token);
    await this.authorize(input);
    if (resources) {
      return {
        success: resources,
        error: null,
      };
    }
    return {
      success: null,
      error: Error('No resources found'),
    };
  }
}
