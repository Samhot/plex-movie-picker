# Authentification

Ce projet utilise **Better-Auth** pour gérer l'authentification des utilisateurs.
Il remplace l'ancienne implémentation basée sur Firebase.

## Architecture

- **Librairie** : `better-auth`
- **Base de données** : PostgreSQL via Prisma (tables `user`, `session`, `account`, `verification`).
- **Adaptateur** : Prisma Adapter.

## Configuration

L'authentification est configurée pour supporter :
- Email / Mot de passe

L'ajout de fournisseurs OAuth (Google, GitHub, etc.) est simple via la configuration `betterAuth`.

## Utilisation dans l'API (NestJS)

Pour protéger une route, utilisez le Guard `BetterAuthGuard` :

```typescript
import { UseGuards } from '@nestjs/common';
import { BetterAuthGuard } from '@plex-tinder/auth/nest';

@Controller('movies')
@UseGuards(BetterAuthGuard)
export class MoviesController {
  // ...
}
```

Pour accéder à l'utilisateur courant :

```typescript
@Get()
findAll(@Request() req) {
  console.log(req.user); // L'objet User de la DB
}
```

## Migration depuis l'ancien système

1. Installer les dépendances : `npm install better-auth`
2. Appliquer la migration Prisma : `npx prisma migrate dev`

