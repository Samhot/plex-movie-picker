import { Group } from '@plex-tinder/auth/core';

import { GroupFirebaseDictionary } from './types';

export const firebaseGroupsToDomainGroupsMapper = (
  firebaseGroups: GroupFirebaseDictionary,
  parentGroupId?: string,
  parentRoles?: {
    id: string;
    name: string;
    authorizations: Record<string, boolean>;
  }[],
  parentParks?: Set<string>,
  parentBuildings?: Set<string>
): Group[] => {
  const groups: Group[] = [];

  Object.entries(firebaseGroups).forEach(([groupKey, firebaseGroup]) => {
    const groupId = parentGroupId ? `${parentGroupId}&${groupKey}` : groupKey;
    const parks = new Set(Object.keys(firebaseGroup.ressources?.parks ?? {}));
    const allParks = new Set(parks);
    const buildings = new Set(
      Object.entries(firebaseGroup.ressources?.buildings ?? {}).reduce<
        string[]
      >((res, [parkKey, buildings]) => {
        res.push(
          ...Object.keys(buildings).map(
            (buildingKey) => `${parkKey}/${buildingKey}`
          )
        );
        return res;
      }, [])
    );
    const allBuildings = new Set(buildings);
    const roles = [
      ...(parentRoles ?? []),
      ...Object.entries(firebaseGroup.roles ?? {}).map(([roleKey, role]) => ({
        ...role,
        id: roleKey,
      })),
    ];
    if (firebaseGroup.subGroups) {
      const subGroups = firebaseGroupsToDomainGroupsMapper(
        firebaseGroup.subGroups,
        groupId,
        roles,
        allParks,
        allBuildings
      );
      groups.push(...subGroups);
    }
    allParks.forEach((parkKey) => parentParks?.add(parkKey));
    allBuildings.forEach((parkKey) => parentBuildings?.add(parkKey));
    return groups.push({
      id: groupId,
      name: firebaseGroup.name,
      parks,
      buildings,
      allParks: allParks,
      allBuildings: allBuildings,
      users: firebaseGroup.users,
      roles: roles,
    });
  });
  return groups;
};
