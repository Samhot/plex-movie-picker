import { User } from '../domain/User';

export interface IUserRepository {
    getOne(id: string, skipCache?: boolean): Promise<User | null>;

    update(uid: string, user: { selectedPark: string }): Promise<void>;

    getUsersIdsByPark(parkId: string, roleKeys: string[]): Promise<string[]>;

    getActiveUsersCountByPark(parkId: string, dateInterval: { from: Date; to: Date }): Promise<number>;
}
