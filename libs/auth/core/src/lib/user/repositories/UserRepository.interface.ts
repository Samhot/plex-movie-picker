import { User } from '../domain/User';

export interface IUserRepository {
    getOne(id: string, skipCache?: boolean): Promise<User | null>;
}
