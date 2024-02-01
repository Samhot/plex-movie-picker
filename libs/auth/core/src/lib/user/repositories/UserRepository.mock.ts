import { IUserRepository } from './UserRepository.interface';

export const getUserRepositoryMock = (jest) =>
    ({
        getOne: jest.fn(),
        update: jest.fn(),
        getUsersIdsByPark: jest.fn(),
        getActiveUsersCountByPark: jest.fn(),
    } satisfies IUserRepository);
