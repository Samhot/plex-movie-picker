import { Module } from '@nestjs/common';
// Le contrôleur Auth est remplacé par un middleware Express dans main.ts
// import { AuthController } from './auth.controller';

@Module({
  controllers: [],  // Pas de contrôleur, Better Auth est monté comme middleware
  providers: [],
  exports: [],
})
export class AuthModule {}
