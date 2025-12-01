import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Authorization } from '@plex-tinder/shared/nest';
import {
  GetPlexAuthPinUseCase,
  CheckPlexAuthPinUseCase,
  GetPlexResourcesUseCase,
} from '@plex-tinder/mediacenter/core';

@Controller('plex')
@ApiTags('plex')
export class PlexController {
  constructor(
    private readonly getPlexAuthPinUseCase: GetPlexAuthPinUseCase,
    private readonly checkPlexAuthPinUseCase: CheckPlexAuthPinUseCase,
    private readonly getPlexResourcesUseCase: GetPlexResourcesUseCase
  ) {}

  @Authorization(GetPlexAuthPinUseCase.authorization )
  @Get('auth/pin')
  @ApiOkResponse({ status: 200 })
  getAuthPin() {
    return this.getPlexAuthPinUseCase.execute();
  }

  @Authorization(CheckPlexAuthPinUseCase.authorization)
  @Get('auth/pin/:id')
  @ApiOkResponse({ status: 200 })
  checkAuthPin(@Param('id') id: number) {
    return this.checkPlexAuthPinUseCase.execute({ pinId: id });
  }

  @Authorization(GetPlexResourcesUseCase.authorization)
  @Get('resources')
  @ApiOkResponse({ status: 200 })
  getResources(@Query('token') token: string) {
    return this.getPlexResourcesUseCase.execute({ token });
  }
}

