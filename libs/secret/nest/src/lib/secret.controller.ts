import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Authorization } from '@plex-tinder/shared/nest';
import { Secret } from './secret.model';
import { SecretService } from './secret.service';
import {
  CreateMediaSource,
  SaveMediaSourceUseCase,
  GetMediaSourcesUseCase,
} from '@plex-tinder/secret/core';

@Controller('secret')
@ApiTags('secrets')
export class SecretController {
  constructor(private readonly secretService: SecretService) {}

  @Authorization(SaveMediaSourceUseCase.authorization)
  @Post('create')
  @ApiCreatedResponse({ type: Secret })
  create(@Body() createSecretDto: CreateMediaSource) {
    return this.secretService.createSecret(createSecretDto);
  }

  @Authorization(GetMediaSourcesUseCase.authorization)
  @Get(':guid')
  @ApiOkResponse({ type: Secret, isArray: true })
  findOne(
    @Param('guid') guid: string
  ) {
    return this.secretService.getUserSecrets(guid);
  }
}
