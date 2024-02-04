import { AESEncrypter } from './AESEncrypter';

describe('AESEncrypter', () => {
    it('should encrypt and decrypt a value', () => {
        const encrypter = new AESEncrypter('12345678901234567890123456789012', '1234567890123456');
        const value = 'Eren Jeager';
        const encrypted = encrypter.encrypt(value);
        const decrypted = encrypter.decrypt(encrypted);

        expect(decrypted).toEqual(value);
        expect(encrypted).not.toEqual(value);
    });
});
