import { Body, Controller, Get, Param, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Authorization } from '@plex-tinder/shared/nest';
import { BetterAuthGuard, CurrentUser, BetterAuthUser } from '@plex-tinder/auth/nest';
import {
  GetPlexAuthPinUseCase,
  CheckPlexAuthPinUseCase,
  GetPlexResourcesUseCase,
  ConfigurePlexUseCase,
} from '@plex-tinder/mediacenter/core';
import { IsNotEmpty, IsString } from 'class-validator';

class ConfigurePlexInput {
  @ApiProperty({ description: 'Plex server URL (e.g. http://192.168.1.100:32400)' })
  @IsString()
  @IsNotEmpty()
  serverUrl: string;

  @ApiProperty({ description: 'Plex auth token obtained from PIN flow' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

@Controller('plex')
@ApiTags('plex')
export class PlexController {
  constructor(
    private readonly getPlexAuthPinUseCase: GetPlexAuthPinUseCase,
    private readonly checkPlexAuthPinUseCase: CheckPlexAuthPinUseCase,
    private readonly getPlexResourcesUseCase: GetPlexResourcesUseCase,
    private readonly configurePlexUseCase: ConfigurePlexUseCase
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

  @UseGuards(BetterAuthGuard)
  @Post('config')
  @ApiOkResponse({ status: 200, description: 'Plex configuration saved successfully' })
  async configurePlex(
    @CurrentUser() user: BetterAuthUser,
    @Body(new ValidationPipe()) input: ConfigurePlexInput
  ) {
    return this.configurePlexUseCase.execute({
      userId: user.id,
      serverUrl: input.serverUrl,
      token: input.token,
    });
  }
}

