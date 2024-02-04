export interface Encrypter {
    encrypt: (value: string) => Promise<string> | string;
    decrypt: (value: string) => Promise<string> | string;
}
