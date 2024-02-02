// import { faker } from '@faker-js/faker';
// import { createMock } from '@golevelup/ts-jest';
// import { Reflector } from '@nestjs/core';
// import { GqlExecutionContext } from '@nestjs/graphql';

// import { AuthorizeParkUseCase, parkMock } from '@plex-tinder/assets/core';
// import { FirebaseGroupRepository, FirebaseParkRepository } from '@plex-tinder/assets/repos/firebase';
// import { AuthorizeUserUseCase, userMock } from '@plex-tinder/auth/core';
// import { FirebaseUserRepository } from '@plex-tinder/auth/repos/firebase';
// import { Module, Pack } from '@plex-tinder/shared/utils';
// import { generateCuid } from '@plex-tinder/shared/utils';

// import { AuthorizationGuard } from './authorization.guard';

// describe('AuthorizationGuard', () => {
//     let guard: AuthorizationGuard;
//     const mockExecutionContext = createMock<GqlExecutionContext>();
//     const reflector = createMock<Reflector>();
//     const firebaseGroupRepository = createMock<FirebaseGroupRepository>();
//     const firebaseParkRepository = createMock<FirebaseParkRepository>();
//     const firebaseUserRepository = new FirebaseUserRepository({} as any, {} as any, firebaseGroupRepository);
//     const authorizeParkUseCase = new AuthorizeParkUseCase(firebaseParkRepository);
//     const authorizeUserUseCase = new AuthorizeUserUseCase();
//     const parkId = generateCuid();

//     beforeEach(() => {
//         jest.clearAllMocks();
//         GqlExecutionContext.create = jest.fn().mockReturnValue(mockExecutionContext);

//         mockExecutionContext.getContext.mockReturnValue({
//             req: {
//                 user: {
//                     uid: '123',
//                 },
//             },
//         });

//         firebaseUserRepository.getOne = jest.fn(async () => ({
//             ...userMock,
//             id: generateCuid(),
//             authorizations: [
//                 {
//                     parkId,
//                     policies: ['regulatory_access', 'ez', 'pz'],
//                 },
//             ],
//             disabled: false,
//             selectedPark: parkId,
//         }));

//         firebaseParkRepository.get.mockResolvedValue({
//             ...parkMock,
//             id: parkId,
//             packs: [],
//         });

//         firebaseGroupRepository.getUserAuthorizations.mockResolvedValue(['ez', 'pz']);

//         guard = new AuthorizationGuard(reflector, firebaseUserRepository, authorizeParkUseCase, authorizeUserUseCase);
//     });

//     describe('canActivate', () => {
//         it('should be defined', () => {
//             expect(guard).toBeDefined();
//         });

//         it('should pass the guard', async () => {
//             reflector.get.mockReturnValue({ policies: ['regulatory_access'], useOrForPolicies: false });

//             expect(await guard.canActivate(mockExecutionContext)).toBe(true);
//         });

//         it('should pass the guard if no policies are defined', async () => {
//             reflector.get.mockReturnValue({ policies: [], useOrForPolicies: false });

//             expect(await guard.canActivate(mockExecutionContext)).toBe(true);
//         });

//         it('should pass the guard if useOrForPolicies', async () => {
//             reflector.get.mockReturnValue({ policies: ['ez', 'lemon'], useOrForPolicies: true });

//             expect(await guard.canActivate(mockExecutionContext)).toBe(true);
//         });

//         it('should pass the guard if all of the required modules are present', async () => {
//             firebaseUserRepository.getOne = jest.fn(async () => ({
//                 ...userMock,
//                 id: generateCuid(),
//                 authorizations: [
//                     {
//                         parkId: parkId,
//                         policies: [],
//                     },
//                 ],
//                 disabled: false,
//                 selectedPark: parkId,
//             }));

//             firebaseParkRepository.get.mockResolvedValue({
//                 ...parkMock,
//                 id: parkId,
//                 modules: [Module.Audits, Module.AssetsState],
//             });

//             reflector.get.mockReturnValue({ modules: [Module.Audits, Module.AssetsState] });

//             expect(await guard.canActivate(mockExecutionContext)).toBe(true);
//         });

//         it('should pass the guard if one of the required packs are present', async () => {
//             firebaseUserRepository.getOne = jest.fn(async () => ({
//                 ...userMock,
//                 id: generateCuid(),
//                 authorizations: [
//                     {
//                         parkId,
//                         policies: ['regulatory_access', 'ez', 'pz'],
//                     },
//                 ],
//                 disabled: false,
//                 selectedPark: parkId,
//             }));

//             firebaseParkRepository.get.mockResolvedValue({
//                 ...parkMock,
//                 id: parkId,
//                 packs: [Pack.AuditFirstYear, Pack.ManagementMonitoring],
//             });

//             reflector.get.mockReturnValue({
//                 packs: [Pack.AuditFirstYear, Pack.ManagementMonitoring],
//             });

//             expect(await guard.canActivate(mockExecutionContext)).toBe(true);
//         });

//         it('should pass the guard if the contract has expired but doNotCheckPark is true', async () => {
//             reflector.get.mockReturnValue({ doNotCheckPark: true });
//             firebaseParkRepository.get.mockResolvedValue({
//                 id: parkId,
//                 name: 'Sample Parc 1',
//                 modules: [],
//                 packs: [],
//                 contractEndDate: faker.date.past(),
//             });

//             expect(await guard.canActivate(mockExecutionContext)).toEqual(true);
//         });

//         it('should pass the guard if one element in authorizations is true', async () => {
//             reflector.get.mockReturnValue([{ policies: ['not_authorized'] }, { policies: ['regulatory_access'] }]);

//             expect(await guard.canActivate(mockExecutionContext)).toEqual(true);
//         });

//         it('should not pass the guard if the policies are not met', async () => {
//             reflector.get.mockReturnValue({ policies: ['policy'], useOrForPolicies: false });

//             expect(await guard.canActivate(mockExecutionContext)).toEqual(false);
//         });

//         it('should not pass the guard if the policies are not met when using Or', async () => {
//             reflector.get.mockReturnValue({ policies: ['lemon', 'squeezie'], useOrForPolicies: true });

//             expect(await guard.canActivate(mockExecutionContext)).toEqual(false);
//         });

//         it('should not pass the guard if the modules are not met', async () => {
//             reflector.get.mockReturnValue({ modules: [Module.AtmosWorksPlan] });

//             expect(await guard.canActivate(mockExecutionContext)).toEqual(false);
//         });

//         it('should not pass the guard if the packs are not met', async () => {
//             reflector.get.mockReturnValue({ packs: [Pack.AuditFirstYearWithGPA] });

//             expect(await guard.canActivate(mockExecutionContext)).toEqual(false);
//         });

//         it('should not pass the guard if the contract has not started yet', async () => {
//             firebaseParkRepository.get.mockResolvedValue({
//                 id: parkId,
//                 name: 'Sample Parc 1',
//                 modules: [],
//                 packs: [],
//                 contractStartDate: faker.date.future(),
//             });

//             expect(await guard.canActivate(mockExecutionContext)).toEqual(false);
//         });

//         it('should not pass the guard if the contract has expired', async () => {
//             firebaseParkRepository.get.mockResolvedValue({
//                 id: parkId,
//                 name: 'Sample Parc 1',
//                 modules: [],
//                 packs: [],
//                 contractEndDate: faker.date.past(),
//             });

//             expect(await guard.canActivate(mockExecutionContext)).toEqual(false);
//         });
//     });
// });
