import { AuthorizationGuard } from './authorization.guard';

describe('AuthorizationGuard', () => {
    it('should be defined', () => {
        expect(new AuthorizationGuard()).toBeTruthy();
    });
    it('should return true if the user is authorized', async () => {
        const guard = new AuthorizationGuard();
        const result = await guard.canActivate();
        expect(result).toBe(true);
    });
});
