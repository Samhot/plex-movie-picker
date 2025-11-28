process.env['POSTGRES_URL'] =
    process.env.POSTGRES_PIPELINE_URL ?? 'postgres://plex-api:plex-password@127.0.0.1:5432/plex-db';

    export default {
    displayName: 'auth-nest',
    preset: '../../../jest.preset.js',
    globals: {},
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/libs/auth-nest',
    rootDir: '.',
    collectCoverageFrom: ['src/**/*.(t|j)s'],
    testEnvironment: 'node',
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
    testTimeout: 30000,
    transform: {
        '^.+\\.(t|j)s$': ['@swc/jest'],
    },
    runner: '@codejedi365/jest-serial-runner',
    testMatch: ['<rootDir>/**/*.integration.ts'],
    setupFilesAfterEnv: ['jest-extended/all'],
};
