import { get, merge } from 'lodash';

import { extractFirebaseBuildingKeysFromId } from '@plex-tinder/assets/repos/firebase';
import { Group } from '@plex-tinder/auth/core';
import { FIREBASE_PATH_GROUP, isDefined } from '@plex-tinder/shared/utils';

import {
  GroupFirebase,
  GroupFirebaseDictionary,
  GroupRoles,
  SubGroupsRessources,
  UserFirebaseGroups,
  UserRolesByResources,
} from './types';

export const extractSubGroupsResources = (
  subGroups: GroupFirebaseDictionary = {},
  parentGroupKey: string[] = []
): SubGroupsRessources => {
  return Object.keys(subGroups).reduce<SubGroupsRessources>(
    (res, groupKey: string) => {
      const group = subGroups[groupKey];

      Object.keys(group.ressources?.parks ?? {}).forEach((parkKey) => {
        res.parks[parkKey] = {
          ...res.parks[parkKey],
          [parentGroupKey.concat(groupKey).join('&')]: true,
        };
      });
      Object.keys(group.ressources?.buildings ?? {}).forEach((parkKey) => {
        if (!res.buildings[parkKey]) {
          res.buildings[parkKey] = {};
        }
        Object.keys(group?.ressources?.buildings?.[parkKey] ?? {}).forEach(
          (buildingKey) => {
            res.buildings[parkKey] = {
              ...res.buildings[parkKey],
              [buildingKey]: {
                ...res.buildings[parkKey]?.[buildingKey],
                [parentGroupKey.concat(groupKey).join('&')]: true,
              },
            };
          }
        );
      });

      return merge(
        res,
        extractSubGroupsResources(
          group.subGroups,
          parentGroupKey.concat(groupKey)
        )
      );
    },
    { parks: {}, buildings: {} }
  );
};

export function getUserRolesByPark(
  groups: GroupFirebaseDictionary,
  userGroups: string[],
  userId: string,
  parkKey: string
): { role: string; groupPath: string[] }[] {
  return userGroups
    .map<{ role: string; groupPath: string[] } | undefined>((groupKey) => {
      const groupPath = groupKey.replace(/&/gi, '&subGroups&').split('&');
      const group: GroupFirebase | undefined = get(groups, groupPath);
      const user = group?.users && userId && group.users[userId];

      if (user) {
        const { restrictedRessources, role } = user;

        if (parkKey) {
          const subGroupsRessources = extractSubGroupsResources({
            [groupKey]: group,
          });
          const { parks } = restrictedRessources
            ? restrictedRessources
            : subGroupsRessources;

          if (parks?.[parkKey]) {
            return {
              role,
              groupPath,
            };
          }
        }
      }

      return undefined;
    })
    .filter(isDefined);
}

const defaultObject = {};

export const getGroupByPath = (
  groupKey: string,
  groups: GroupFirebaseDictionary
): GroupFirebase =>
  groupKey.split('&').reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (res: any, key) =>
      key
        ? (res.subGroups && res.subGroups[key]) || res[key] || defaultObject
        : res,
    groups
  );

export function isGroupFirebase(
  propableGroupFirebase: unknown
): propableGroupFirebase is GroupFirebase {
  const groupFirebaseProperties: (keyof GroupFirebase)[] = [
    'name',
    'users',
    'modules',
    'ressources',
    'subGroups',
    'roles',
  ];

  return groupFirebaseProperties.some((property) =>
    Object.keys(propableGroupFirebase ?? {}).includes(property)
  );
}

export const getGroupRoles = (
  groupKeyPath: string[],
  groups: GroupFirebaseDictionary
) => {
  const { roles } = groupKeyPath.reduce<GroupRoles>(
    (res, key, i) => {
      res.group =
        (res.group.subGroups &&
          isGroupFirebase(res.group) &&
          res.group.subGroups?.[key]) ||
        (!isGroupFirebase(res.group) && res.group[key]) ||
        {};

      if (i !== groupKeyPath.length - 1) {
        res.roles = {
          ...res.roles,
          ...Object.keys(res.group.roles || {}).reduce(
            (r, roleKey) => ({
              ...r,
              [roleKey]: {
                ...(isGroupFirebase(res.group)
                  ? res.group.roles?.[roleKey]
                  : {}),
                groupName: res.group.name,
              },
            }),
            {}
          ),
        };
      } else {
        res.roles = {
          ...res.roles,
          ...(isGroupFirebase(res.group) ? res.group.roles : {}),
        };
      }
      return res;
    },
    { group: groups, roles: {} }
  );

  return roles;
};

export const extractUserRolesByResources = (
  groups: Group[],
  userGroups: UserFirebaseGroups,
  userId: string
): UserRolesByResources => {
  return Object.keys(userGroups ?? {}).reduce<UserRolesByResources>(
    (res, groupKey) => {
      const group = groups.find((group) => group.id === groupKey);
      if (!group) return res;

      const user = group.users && userId && group.users[userId];

      if (!user) return res;
      const { restrictedRessources, role } = user;

      const roleObject = group.roles.find((groupRole) => groupRole.id === role);

      if (!roleObject) return res;

      if (restrictedRessources) {
        Object.keys(restrictedRessources.parks ?? {}).forEach((parkKey) => {
          const parkRoles = res.parks[parkKey];
          if (parkRoles) {
            parkRoles.push({ role: roleObject });
          } else {
            res.parks[parkKey] = [
              {
                role: roleObject,
              },
            ];
          }
        });
        Object.entries(restrictedRessources.buildings ?? {}).forEach(
          ([parkKey, buildingsKeys]) => {
            const parkRoles = res.parks[parkKey];
            if (parkRoles) {
              parkRoles.push({ role: roleObject, buildingsKeys });
            } else {
              res.parks[parkKey] = [
                {
                  role: roleObject,
                  buildingsKeys,
                },
              ];
            }
          }
        );
      } else {
        group.allParks.forEach((parkKey) => {
          const parkRoles = res.parks[parkKey];
          if (parkRoles) {
            parkRoles.push({ role: roleObject });
          } else {
            res.parks[parkKey] = [
              {
                role: roleObject,
              },
            ];
          }
        });
        group.allBuildings.forEach((buildingId) => {
          const { parkKey, buildingKey } = extractFirebaseBuildingKeysFromId(
            buildingId as `${string}/${string}`
          );
          const parkRoles = res.parks[parkKey];
          if (parkRoles) {
            parkRoles.push({
              role: roleObject,
              buildingsKeys: { [buildingKey]: true },
            });
          } else {
            res.parks[parkKey] = [
              {
                role: roleObject,
                buildingsKeys: { [buildingKey]: true },
              },
            ];
          }
        });
      }

      res.global.push({ role: roleObject });

      return res;
    },
    { parks: {}, global: [] }
  );
};

export function getUserGroupPath(
  groups: GroupFirebaseDictionary,
  authorizations: string[],
  userUid: string,
  parkKey: string,
  groupPath?: string
): {
  matchingGroupPath: string | null;
  roleKeyWithAuthorizations: string | null;
} {
  let matchingGroupPath: string | null = null;
  let roleKeyWithAuthorizations: string | null = null;

  for (const groupKey of Object.keys(groups)) {
    const currentGroupPath = groupPath ? `${groupPath}/${groupKey}` : groupKey;
    const currentGroup = groups[groupKey];
    const { ressources, roles, subGroups, users } = currentGroup;

    const groupHasUser = Object.keys(users ?? {}).includes(userUid);
    const groupHasPark = Object.keys(ressources?.parks ?? {}).includes(parkKey);
    const groupHasAuthorizations = roles
      ? Object.keys(roles ?? {}).find((roleKey) =>
          authorizations.every((auth) => roles[roleKey]?.authorizations?.[auth])
        )
      : null;

    if (groupHasAuthorizations)
      roleKeyWithAuthorizations = groupHasAuthorizations;
    if (groupHasUser && groupHasPark) {
      matchingGroupPath = currentGroupPath;
      break;
    }

    if (subGroups) {
      const result = getUserGroupPath(
        subGroups,
        authorizations,
        userUid,
        parkKey,
        `${currentGroupPath}/subGroups`
      );
      if (result.matchingGroupPath)
        return {
          matchingGroupPath: result.matchingGroupPath,
          roleKeyWithAuthorizations: roleKeyWithAuthorizations
            ? roleKeyWithAuthorizations
            : result.roleKeyWithAuthorizations,
        };
    }
  }

  return { matchingGroupPath, roleKeyWithAuthorizations };
}

export type UsersKeysByRessource = {
  access: boolean;
  users: { [userKey: string]: { [groupPath: string]: string } };
};

export const getUsersKeysByRessource = (
  groups: GroupFirebaseDictionary,
  parcKey: string,
  buildingKey?: string,
  groupKeyPath: string[] = []
): UsersKeysByRessource =>
  Object.keys(groups ?? {}).reduce<UsersKeysByRessource>(
    (res, groupKey) => {
      const group = groups[groupKey];

      if (group.subGroups) {
        const { access, users } = getUsersKeysByRessource(
          group.subGroups,
          parcKey,
          buildingKey,
          [...groupKeyPath, groupKey]
        );

        if (access) {
          return {
            access: true,
            users: merge(
              res.users,
              users,
              getUsersKeysByGroup(group, parcKey, buildingKey, [
                ...groupKeyPath,
                groupKey,
              ])
            ),
          };
        }
      }

      if (
        group.ressources &&
        ((group.ressources.parks && group.ressources.parks[parcKey]) ||
          (group.ressources.buildings &&
            group.ressources.buildings[parcKey] &&
            (!buildingKey || group.ressources.buildings[parcKey][buildingKey])))
      ) {
        return {
          access: true,
          users: merge(
            res.users,
            getUsersKeysByGroup(group, parcKey, buildingKey, [
              ...groupKeyPath,
              groupKey,
            ])
          ),
        };
      }

      return res;
    },
    { access: false, users: {} }
  );

const getUsersKeysByGroup = (
  group: GroupFirebase,
  parcKey: string,
  buildingKey?: string,
  groupKeyPath: string[] = []
) =>
  Object.keys(group.users ?? {}).reduce<{
    [userKey: string]: { [groupPath: string]: string };
  }>((res, userKey) => {
    if (
      !group.users?.[userKey].restrictedRessources ||
      (group.users?.[userKey].restrictedRessources?.parks &&
        group.users?.[userKey].restrictedRessources?.parks?.[parcKey]) ||
      (group.users[userKey].restrictedRessources?.buildings &&
        group.users?.[userKey].restrictedRessources?.buildings?.[parcKey] &&
        (!buildingKey ||
          group.users?.[userKey].restrictedRessources?.buildings?.[parcKey][
            buildingKey
          ]))
    ) {
      res[userKey] = {
        [groupKeyPath.join('&')]: group.users?.[userKey].role ?? '',
      };
    }

    return res;
  }, {});

export const getFirebaseGroupPath = (groupId: string) =>
  `${FIREBASE_PATH_GROUP}/${groupId.split('&').join('/subGroups/')}`;

export const getFirebaseGroupRessourcesPath = (groupId: string) =>
  `${getFirebaseGroupPath(groupId)}/ressources`;

export const getFirebaseGroupParkResourcesPath = (groupId: string) =>
  `${getFirebaseGroupRessourcesPath(groupId)}/parks`;
