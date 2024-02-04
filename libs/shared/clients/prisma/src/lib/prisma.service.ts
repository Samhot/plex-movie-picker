import { Injectable } from '@nestjs/common';
import { TEST_ENV_VAR, WinstonLogger } from '@plex-tinder/shared/utils';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  async clearDatabase() {
    if (process.env['NODE_ENV'] !== TEST_ENV_VAR)
      throw new Error('Cannot clear database in non-test environment');

    const tablenames = await this.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ');

    try {
      await this.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      WinstonLogger.error('Error while clearing database', error);
    }
  }
}
