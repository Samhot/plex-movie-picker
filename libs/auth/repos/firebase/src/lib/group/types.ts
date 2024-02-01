export type ParkKeyBooleanDictionary = {
    [parkKey: string]: true | undefined;
};

export type ParkKeyBuildingKeyBooleanDictionary = {
    [parkKey: string]: {
        [buildingKey: string]: true | undefined;
    };
};

interface GroupUsersFirebase {
    [userId: string]: {
        role: string;
        restrictedRessources?: {
            parks?: ParkKeyBooleanDictionary;
            buildings?: ParkKeyBuildingKeyBooleanDictionary;
        };
    };
}

interface GroupRessourcesFirebase {
    buildings?: {
        [parkKey: string]: {
            [buildingKey: string]: boolean;
        };
    };
    parks?: {
        [parkId: string]: boolean;
    };
}

interface GroupAuthorizationsFirebase {
    [authorizationName: string]: boolean;
}

interface GroupRolesFirebase {
    [roleId: string]: {
        authorizations: GroupAuthorizationsFirebase;
        description: string;
        name: string;
    };
}

export interface GroupFirebaseDictionary {
    [groupKey: string]: GroupFirebase;
}

export interface GroupFirebase {
    name: string;
    users?: GroupUsersFirebase;
    ressources?: GroupRessourcesFirebase;
    roles?: GroupRolesFirebase;
    subGroups?: GroupFirebaseDictionary;
    modules?: {
        [moduleName: string]: boolean;
    };
}

export interface GroupRoleAuthorizationDictionary {
    [authorizationName: string]: boolean;
}

export interface GroupRole {
    name: string;
    groupName?: string;
    authorizations: GroupRoleAuthorizationDictionary;
    description?: string;
}

export type UserRolesByResources = {
    parks: {
        [parkKey: string]:
            | {
                  buildingsKeys?: { [buildingKey: string]: true | undefined };
                  role: GroupRole & { id: string };
              }[]
            | undefined;
    };
    global: {
        role: GroupRole & { id: string };
    }[];
};

export type UserFirebaseGroups = {
    [groupId: string]: boolean;
};

export interface GroupRoleDictionary {
    [roleKey: string]: GroupRole;
}

export type GroupRoles = {
    roles: GroupRoleDictionary;
    group: GroupFirebaseDictionary | GroupFirebase;
};

export type SubGroupsRessources = {
    parks: { [parkKey: string]: { [groupKeyPath: string]: true } | undefined };
    buildings: {
        [parkKey: string]: { [buildingKey: string]: { [groupKeyPath: string]: true } | undefined } | undefined;
    };
};
