import { IGroupRepository } from './GroupRepository.interface';

export const getGroupRepositoryMock = (jest) =>
    ({
        addParkToGroup: jest.fn(),
        removeParkFromGroup: jest.fn(),
        getById: jest.fn(),
    } satisfies IGroupRepository);
