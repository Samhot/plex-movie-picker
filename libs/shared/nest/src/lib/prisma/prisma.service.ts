import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaService as SharedPrismaService } from '@plex-tinder/shared/clients/prisma';

@Injectable()
export class PrismaService
  extends SharedPrismaService
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
