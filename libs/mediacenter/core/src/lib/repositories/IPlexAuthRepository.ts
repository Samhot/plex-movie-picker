import { PlexResourcesResponse } from '../domain/PlexResourcesResponse';

export abstract class IPlexAuthRepository {
  abstract getPin(): Promise<{ code: string; id: number; authUrl: string }>;
  abstract checkPin(pinId: number): Promise<string | null>;
  abstract getResources(token: string): Promise<PlexResourcesResponse[]>;
}
