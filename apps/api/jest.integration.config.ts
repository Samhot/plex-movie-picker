process.env['POSTGRES_URL'] =
    process.env.POSTGRES_PIPELINE_URL ?? 'postgres://beeldi-api:toto42sh@127.0.0.1:5433/beeldi';
process.env['FIREBASE_DATABASE_URL'] =
    process.env.PIPELINE_FIREBASE_DATABASE_URL ?? 'http://127.0.0.1:9000/?ns=dev-beeldi-app';

export default {
    displayName: 'graphql-api',
    preset: '../../jest.preset.js',
    globals: {},
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/libs/graphql-api',
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
