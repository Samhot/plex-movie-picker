/* eslint-disable */
export default {
    displayName: 'auth-core',
    preset: '../../../jest.preset.js',
    globals: {},
    transform: {
        '^.+\\.(t|j)s$': ['@swc/jest'],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../../coverage/libs/auth/core',
};
