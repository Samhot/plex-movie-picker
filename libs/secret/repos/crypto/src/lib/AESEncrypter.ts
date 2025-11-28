import * as crypto from 'crypto';

import { Encrypter } from '@plex-tinder/secret/core';

export class AESEncrypter implements Encrypter {
    constructor(private readonly key: string, private readonly iv: string) {}

    encrypt(value: string): string {
        const cipher = crypto.createCipheriv('aes-256-cbc', this.key, this.iv);
        const encrypted = cipher.update(value, 'utf8', 'base64');

        return encrypted + cipher.final('base64');
    }

    decrypt(value: string): string {
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, this.iv);
        const decrypted = decipher.update(value, 'base64', 'utf8');

        return decrypted + decipher.final('utf8');
    }
}
