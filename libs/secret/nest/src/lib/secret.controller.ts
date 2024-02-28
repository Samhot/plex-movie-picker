import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Authorization } from '@plex-tinder/shared/nest';
import { Secret } from './secret.model';
import { SecretService } from './secret.service';
import {
  CreateClientSecret,
  CreateClientSecretsUseCase,
  GetClientSecretsUseCase,
} from '@plex-tinder/secret/core';
// import { User } from '@plex-tinder/auth/core';

// @UseGuards(AuthorizationGuard)
@Controller('secret')
@ApiTags('secrets')
export class SecretController {
  constructor(private readonly secretService: SecretService) {}

  @Authorization(CreateClientSecretsUseCase.authorization)
  @Post('create')
  @ApiCreatedResponse({ type: Secret })
  create(@Body() createSecretDto: CreateClientSecret) {
    return this.secretService.createSecret(createSecretDto);
  }

  @Authorization(GetClientSecretsUseCase.authorization)
  @Get(':guid')
  @ApiOkResponse({ type: Secret })
  findOne(
    // @CurrentUser() user: User,
    @Param('guid') guid: string
  ) {
    return this.secretService.getUserSecrets(
      guid
      // , user
    );
  }
}
