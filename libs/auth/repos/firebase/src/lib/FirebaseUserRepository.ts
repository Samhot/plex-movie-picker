import type { Cache } from 'cache-manager';
import * as moment from 'moment';

import { ElementaryUser, IUserRepository, User } from '@plex-tinder/auth/core';
import { FirebaseDatabaseClient } from '@plex-tinder/shared/clients/firebase';
import {
  FIREBASE_PATH_USERS,
  Interval,
  TEST_ENV_VAR,
  isDefined,
} from '@plex-tinder/shared/utils';

import {
  firebaseElementaryUserToDomainMapper,
  firebaseUserToDomainMapper,
} from './firebaseUserToDomainMapper';
import { FirebaseGroupRepository } from './group/FirebaseGroupRepository';
import {
  extractUserRolesByResources,
  getUsersKeysByRessource,
} from './group/utils';
import { UserFirebase } from './types';

export class FirebaseUserRepository implements IUserRepository {
  constructor(
    private readonly firebaseDatabaseClient: FirebaseDatabaseClient,
    private cacheManager: Cache,
    private readonly groupRepo: FirebaseGroupRepository
  ) {}

  async getAll(): Promise<ElementaryUser[]> {
    const users = await this.firebaseDatabaseClient.getDataFromPath<{
      [userId: string]: UserFirebase;
    }>(FIREBASE_PATH_USERS);

    return Object.entries(users)
      .map(([userId, user]) => {
        try {
          return firebaseElementaryUserToDomainMapper({ ...user, uid: userId });
        } catch (e) {
          return null;
        }
      })
      .filter(isDefined);
  }

  async getOne(
    userId: string,
    skipCache = process.env['NODE_ENV'] === TEST_ENV_VAR
  ): Promise<User> {
    let user = await this.cacheManager.get<User | null>(userId);

    if (!user || skipCache) {
      const firebaseUser =
        await this.firebaseDatabaseClient.getDataFromPath<UserFirebase | null>(
          FIREBASE_PATH_USERS,
          userId
        );

      if (!firebaseUser) {
        throw new Error('User not found');
      }

      if (!firebaseUser.uid) {
        throw new Error('User has no uid');
      }

      const groups = await this.groupRepo.getGroups();

      if (!groups) {
        throw new Error('No groups found');
      }

      const userGroups = firebaseUser.groups;

      if (!userGroups) {
        throw new Error('User has no groups');
      }

      const { parks } = extractUserRolesByResources(
        groups,
        userGroups,
        firebaseUser.uid
      );

      const userAuthorizations = Object.entries(parks)
        .map(([parkKey, roles]) => {
          if (roles && firebaseUser?.uid) {
            return roles.map(({ role, buildingsKeys }) => ({
              parkId: parkKey,
              policies: Object.keys(role.authorizations),
              buildingsIds: buildingsKeys
                ? Object.keys(buildingsKeys).map((k) => `${parkKey}/${k}`)
                : undefined,
            }));
          }

          return null;
        })
        .flat()
        .filter(isDefined);

      user = firebaseUserToDomainMapper(
        {
          ...firebaseUser,
          uid: firebaseUser.uid,
          selectedParc: firebaseUser.selectedParc,
        },
        userAuthorizations
      );

      await this.cacheManager.set(userId, user, 60);
    }

    return user;
  }

  async update(uid: string, user: { selectedPark: string }): Promise<void> {
    return this.firebaseDatabaseClient.updateInPath(FIREBASE_PATH_USERS, uid, {
      selectedParc: user.selectedPark,
    });
  }

  async getUsersIdsByPark(
    parkId: string,
    roleKeys: string[]
  ): Promise<string[]> {
    const groups = await this.groupRepo.getFirebaseGroups();

    const users = getUsersKeysByRessource(groups, parkId).users;

    return Object.keys(users).filter((userKey) => {
      const userGroupsWithRole = users[userKey];

      return Object.values(userGroupsWithRole).some((role) =>
        roleKeys.includes(role)
      );
    });
  }

  async getActiveUsersCountByPark(
    parkId: string,
    dateInterval: Required<Interval>
  ): Promise<number> {
    const cachedUsers = await this.cacheManager.get<{
      [userId: string]: UserFirebase;
    }>('usersList');
    const getAllUsers = async () => {
      const firebaseUsers = await this.firebaseDatabaseClient.getDataFromPath<{
        [userId: string]: UserFirebase;
      }>(FIREBASE_PATH_USERS);
      await this.cacheManager.set('usersList', firebaseUsers, 60 * 60);
      return firebaseUsers;
    };
    const usersList = cachedUsers ?? (await getAllUsers());
    const groups = await this.groupRepo.getFirebaseGroups();
    const parkUserIds = Object.keys(
      getUsersKeysByRessource(groups, parkId).users
    );
    const parkUserInfos = Object.keys(usersList)
      .filter(
        (userId) =>
          parkUserIds.includes(userId) &&
          !usersList[userId].disabled &&
          moment(usersList[userId].lastConnection).isBetween(
            dateInterval.from,
            dateInterval.to
          )
      )
      .map((userId) => {
        const user = usersList[userId];
        return {
          uid: user.uid,
          email: user.email,
          disabled: user.disabled,
          lastConnection: moment(user.lastConnection).format('DD/MM/YYYY'),
        };
      });
    return parkUserInfos.length;
  }
}
