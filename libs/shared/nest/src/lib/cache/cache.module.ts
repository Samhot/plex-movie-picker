import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { createClient } from 'redis';
import { TEST_ENV_VAR, WinstonLogger } from '@plex-tinder/shared/utils';

export const CacheModule = NestCacheModule.registerAsync({
  isGlobal: true,
  useFactory: async () => {
    if (!process.env['REDIS_URL'] || process.env['NODE_ENV'] === TEST_ENV_VAR)
      return { ttl: 60 };

    let errored = false;

    return new Promise((resolve) => {
      const client = createClient({
        url: process.env['REDIS_URL'],
        // retry_strategy: () => Math.pow(2, 31) - 1,
      });

      client.on('error', function (error) {
        errored = true;
        WinstonLogger.error('Redis: ' + error, 'Redis Cache Module');
      });

      client.on('connect', function () {
        WinstonLogger.info('Redis: Connected', 'Redis Cache Module');
        if (!errored) {
          resolve({
            store: redisStore,
            url: process.env['REDIS_URL'],
            ttl: 60,
          });
        } else {
          resolve({});
        }
      });
    });
  },
});
