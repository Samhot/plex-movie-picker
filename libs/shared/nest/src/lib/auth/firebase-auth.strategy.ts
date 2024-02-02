// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Cache } from 'cache-manager';
// import { ExtractJwt, Strategy } from 'passport-firebase-jwt';

// import { FirebaseService } from '../firebase/firebase.service';

// @Injectable()
// export class FirebaseAuthStrategy extends PassportStrategy(Strategy, 'firebase-auth') {
//     constructor(private readonly firebase: FirebaseService, private readonly cache: Cache) {
//         super({
//             jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//         });
//     }

//     async validate(token: string) {
//         const cached = await this.cache.get(token);

//         if (cached) {
//             return cached;
//         }

//         const firebaseUser = await this.firebase.auth.verifyIdToken(token, true);

//         await this.cache.set(token, firebaseUser, { ttl: 60 * 5 });

//         return firebaseUser;
//     }
// }
