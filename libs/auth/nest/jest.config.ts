/* eslint-disable */
export default {
  displayName: 'auth-nest',
  preset: '../../../jest.preset.js',
  rootDir: '.',
  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': ['@swc/jest'],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '@plex-tinder/auth/nest',
};
