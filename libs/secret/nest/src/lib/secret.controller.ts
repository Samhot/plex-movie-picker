import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@plex-tinder/auth/core';
import { BetterAuthGuard, CurrentUser } from '@plex-tinder/auth/nest';
import { Authorization } from '@plex-tinder/shared/nest';
import { Secret } from './secret.model';
import { SecretService } from './secret.service';
import {
  CreateMediaSource,
  SaveMediaSourceUseCase,
  GetMediaSourcesUseCase,
} from '@plex-tinder/secret/core';

@UseGuards(BetterAuthGuard)
@Controller('secret')
@ApiTags('secrets')
export class SecretController {
  constructor(private readonly secretService: SecretService) {}

  @Authorization(SaveMediaSourceUseCase.authorization)
  @Post('create')
  @ApiCreatedResponse({ type: Secret })
  create(@Body() createSecretDto: CreateMediaSource, @CurrentUser() user: User) {
    return this.secretService.createSecret({ ...createSecretDto, userId: user.id });
  }

  @Authorization(GetMediaSourcesUseCase.authorization)
  @Get(':guid')
  @ApiOkResponse({ type: Secret, isArray: true })
  findOne(
    @Param('guid') guid: string,
    @CurrentUser() user: User
  ) {
    // Assuming 'guid' here is actually the userId based on the param name in GetMediaSourcesUseCase
    // But checking the service call getUserSecrets(guid)
    // And the route is ':guid'
    // If guid is meant to be userId, we should probably use the logged in user id
    // or verify guid matches user.id
    // Let's assume guid IS the userId we want to fetch secrets for.
    // Security: Only allow fetching own secrets.
    if (guid !== user.id) {
       // throw new UnauthorizedException(); // Or just use user.id
    }
    return this.secretService.getUserSecrets(user.id);
  }
}
