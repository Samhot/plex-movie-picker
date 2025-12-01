import { SetMetadata } from '@nestjs/common';
import { AuthorizationData } from 'libs/shared/utils/src/lib/domain/IUseCase';


export const AUTHORIZATION_METADATA = 'AUTHORIZATION';
export const DEFAULT_AUTHORIZATION_METADATA = 'DEFAULT_AUTHORIZATION';

export const Authorization = (data: AuthorizationData | AuthorizationData[]) => SetMetadata(AUTHORIZATION_METADATA, data);
