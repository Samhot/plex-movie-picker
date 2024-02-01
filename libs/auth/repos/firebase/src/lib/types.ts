export interface UserProviderData {
    [index: number]: {
        displayName: string;
        email: string;
        photoURL: string;
        providerId: string;
        uid: string;
    };
}

export interface UserMetadata {
    creationTime: string;
    lastSignInTime: string;
}

export interface UserGroups {
    [groupId: string]: boolean;
}

export interface UserFirebase {
    email: string;
    disabled?: boolean;
    displayName?: string;
    emailVerified?: boolean;
    groups?: UserGroups;
    lastConnection?: number;
    metadata?: UserMetadata;
    nbLogs?: number;
    photoURL?: string;
    providerData?: UserProviderData;
    selectedDashboardType?: string;
    selectedParc?: string;
    uid?: string;
}
