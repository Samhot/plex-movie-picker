/* eslint-disable */
export default {
    displayName: 'repos-firebase-user',
    preset: '../../../../jest.preset.js',
    globals: {},
    transform: {
        '^.+\\.(t|j)s$': ['@swc/jest'],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../../../coverage/libs/auth/repos/firebase',
};
