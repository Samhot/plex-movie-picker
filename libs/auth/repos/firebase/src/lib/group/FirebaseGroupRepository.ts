import type { Cache } from 'cache-manager';
import { get, uniq, uniqBy } from 'lodash';

import { Group, IGroupRepository } from '@plex-tinder/auth/core';
import { FirebaseDatabaseClient } from '@plex-tinder/shared/clients/firebase';
import {
  FIREBASE_PATH_GROUP,
  FIREBASE_PATH_USERS,
} from '@plex-tinder/shared/utils';

import { firebaseGroupsToDomainGroupsMapper } from './firebaseGroupsToDomainMapper';
import { GroupFirebaseDictionary } from './types';
import {
  getFirebaseGroupParkResourcesPath,
  getUserGroupPath,
  getUserRolesByPark,
} from './utils';

export class FirebaseGroupRepository implements IGroupRepository {
  constructor(
    private readonly firebaseDatabaseService: FirebaseDatabaseClient,
    private cacheManager: Cache
  ) {}

  async getFirebaseGroups(): Promise<GroupFirebaseDictionary> {
    const firebaseGroups =
      await this.firebaseDatabaseService.getDataFromPath<GroupFirebaseDictionary>(
        FIREBASE_PATH_GROUP
      );

    return firebaseGroups;
  }

  async getGroups(): Promise<Group[]> {
    const cachedGroups = await this.cacheManager.get<Group[]>('groups');
    if (cachedGroups && Array.isArray(cachedGroups)) return cachedGroups;

    const firebaseGroups = await this.getFirebaseGroups();

    if (!firebaseGroups) return [];

    const groups = firebaseGroupsToDomainGroupsMapper(firebaseGroups);
    await this.cacheManager.set<Group[]>('groups', groups, 5 * 60);
    return groups;
  }

  async getById(groupId: string): Promise<Group | null> {
    const groups = await this.getGroups();

    const group = groups.find(({ id }) => id === groupId);

    return group ?? null;
  }

  async getUserAuthorizations(
    userUid: string,
    userGroups: string[],
    parkKey: string
  ): Promise<string[] | null> {
    const groups = await this.getFirebaseGroups();

    if (!groups) return null;

    const userRoles = getUserRolesByPark(groups, userGroups, userUid, parkKey);

    if (!userRoles) return null;
    const uniqueMatchingDatas = uniqBy(userRoles, 'role');

    const userAuthorizations: string[] = [];
    uniqueMatchingDatas.forEach(({ role, groupPath }) => {
      groupPath.every((pathFragment, index) => {
        if (pathFragment === 'subGroups') return true;

        const depth = groupPath.slice(0, index + 1);
        const subGroup = get(groups, depth);

        const { roles } = subGroup;
        if (!roles[role]) return true;

        const { authorizations } = roles[role];
        userAuthorizations.push(...Object.keys(authorizations));
        return false;
      });
    });

    return userAuthorizations.length ? uniq(userAuthorizations) : null;
  }

  async setUserAuthorizations(
    userUid: string,
    parkKey: string,
    authorizations: string[]
  ): Promise<{ rolePath: string; userAuthorizations: string[] | null } | null> {
    const cachedGroups = await this.cacheManager.get<GroupFirebaseDictionary>(
      'firebaseGroups'
    );
    const groups = cachedGroups ? cachedGroups : await this.getFirebaseGroups();

    if (!groups) return null;

    const { matchingGroupPath, roleKeyWithAuthorizations } = getUserGroupPath(
      groups,
      authorizations,
      userUid,
      parkKey
    );

    if (!matchingGroupPath) return null;

    const newRoleKey = this.firebaseDatabaseService.generateFirebaseKey();
    if (!roleKeyWithAuthorizations) {
      const newAuthorizations = authorizations.reduce(
        (accumulator, currentAuth) => ({ ...accumulator, [currentAuth]: true }),
        {}
      );
      await this.firebaseDatabaseService.updateInPath(
        FIREBASE_PATH_GROUP,
        `${matchingGroupPath}/roles/${newRoleKey}`,
        {
          authorizations: newAuthorizations,
          name: `User ${userUid} role`,
        }
      );
    }

    await this.firebaseDatabaseService.updateInPath(
      FIREBASE_PATH_GROUP,
      `${matchingGroupPath}/users/${userUid}`,
      {
        role: roleKeyWithAuthorizations || newRoleKey,
      }
    );

    const updatedGroups = await this.getFirebaseGroups();
    if (updatedGroups)
      await this.cacheManager.set<GroupFirebaseDictionary>(
        'firebaseGroups',
        updatedGroups,
        60 * 60
      );

    const updatedUser =
      await this.firebaseDatabaseService.getDataFromPath<GroupFirebaseDictionary>(
        FIREBASE_PATH_USERS,
        userUid
      );

    if (!updatedUser) return null;

    const userAuthorizations = await this.getUserAuthorizations(
      userUid,
      Object.keys(updatedUser['groups'] ?? {}),
      parkKey
    );

    return {
      userAuthorizations,
      rolePath: `${matchingGroupPath}/roles/${
        roleKeyWithAuthorizations ?? newRoleKey
      }`,
    };
  }

  async addParkToGroup(parkKey: string, groupId: string): Promise<void> {
    await this.firebaseDatabaseService.createInPath(
      getFirebaseGroupParkResourcesPath(groupId),
      true,
      parkKey
    );
  }

  async removeParkFromGroup(parkKey: string, groupId: string): Promise<void> {
    await this.firebaseDatabaseService.deleteInPath(
      getFirebaseGroupParkResourcesPath(groupId),
      parkKey
    );
  }
}
