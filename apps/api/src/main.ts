import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '@plex-tinder/auth/nest';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Préfixe global pour toutes les routes (sauf auth qui est géré séparément)
  app.setGlobalPrefix('api', {
    exclude: ['auth/*path'],
  });

  // Mount Better Auth directly as Express middleware
  const betterAuthHandler = toNodeHandler(auth);
  app.use('/api/auth', (req, res) => {
    // Better Auth expects the path without the mount point
    betterAuthHandler(req, res);
  });

  const config = new DocumentBuilder()
    .setTitle('Plex Tinder')
    .setDescription('The Plex Tinder API description')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
    })
  );
  await app.listen(3000);
}
bootstrap();
