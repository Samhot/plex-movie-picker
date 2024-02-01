import { Group } from '../domain/Group';

export interface IGroupRepository {
    addParkToGroup(groupId: string, parkId: string): Promise<void>;
    removeParkFromGroup(groupId: string, parkId: string): Promise<void>;
    getById(groupId: string): Promise<Group | null>;
}
