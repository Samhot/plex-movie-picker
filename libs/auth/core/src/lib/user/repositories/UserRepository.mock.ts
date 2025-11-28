import { IUserRepository } from './UserRepository.interface';

export const getUserRepositoryMock = (jest) =>
    ({
        getOne: jest.fn(),
    } satisfies IUserRepository);
