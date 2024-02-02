/* eslint-disable */
export default {
    displayName: 'shared-clients-winston',
    preset: '../../../../jest.preset.js',
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]s$': ['@swc/jest'],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../../../coverage/libs/shared/clients/winston',
};
