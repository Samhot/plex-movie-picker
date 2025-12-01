import { SetMetadata } from '@nestjs/common';
import { AuthorizationData } from '@plex-tinder/shared/utils';


export const AUTHORIZATION_METADATA = 'AUTHORIZATION';
export const DEFAULT_AUTHORIZATION_METADATA = 'DEFAULT_AUTHORIZATION';

export const Authorization = (data: AuthorizationData | AuthorizationData[]) => SetMetadata(AUTHORIZATION_METADATA, data);
