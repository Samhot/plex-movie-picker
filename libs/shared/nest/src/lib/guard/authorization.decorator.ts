import { SetMetadata } from '@nestjs/common';

import { UseCaseAuthorizationData } from './authorization.guard';

export const AUTHORIZATION_METADATA = 'AUTHORIZATION';
export const DEFAULT_AUTHORIZATION_METADATA = 'DEFAULT_AUTHORIZATION';

export const Authorization = (data: UseCaseAuthorizationData) => SetMetadata(AUTHORIZATION_METADATA, data);
