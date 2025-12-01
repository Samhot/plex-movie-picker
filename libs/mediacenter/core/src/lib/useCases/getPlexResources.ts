import {
  AuthorizationData,
  AuthorizeAndTryCatchUseCase,
  IResponse,
  IUseCase,
} from '@plex-tinder/shared/utils';
import { IPlexAuthRepository } from '../repositories/IPlexAuthRepository';
import { PlexResourcesResponse } from '../domain/PlexResourcesResponse';

type Input = { token: string };
type Output = PlexResourcesResponse[];

export class GetPlexResourcesUseCase implements IUseCase<Input, Output> {
  constructor(private readonly plexRepo: IPlexAuthRepository) {}
  authorize(): Promise<boolean> | boolean {
    throw new Error('Method not implemented.');
  }
  authorization?: AuthorizationData | AuthorizationData[] | undefined;

  static authorization = {
    policies: ['mediacenter_plex_resources_get' as const],
    useOrForPolicies: false,
  };

  @AuthorizeAndTryCatchUseCase()
  async execute(input: Input): Promise<IResponse<Output, Error>> {
    const resources: PlexResourcesResponse[] = await this.plexRepo.getResources(input.token);
    await this.authorize();
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
