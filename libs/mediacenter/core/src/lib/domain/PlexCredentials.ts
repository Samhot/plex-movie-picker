import { z } from 'zod';

import { IMediaCenterCredentials } from './IMediaCenterCredentials.interface';

const PlexCredentialsValidator = z.object({
  userEmail: z.string().email(),
  userPassword: z.string(),
  userContractId: z.string(),
});

type PlexMediaCenterCredentials = z.infer<typeof PlexCredentialsValidator>;

export class PlexCredentials implements IMediaCenterCredentials {
  userEmail: string;
  userPassword: string;
  userContractId: string;

  constructor(public credentials: PlexMediaCenterCredentials) {
    this.userEmail = credentials.userEmail;
    this.userPassword = credentials.userPassword;
    this.userContractId = credentials.userContractId;
  }

  validate(): boolean {
    try {
      PlexCredentialsValidator.parse({
        userEmail: this.userEmail,
        userPassword: this.userPassword,
        userContractId: this.userContractId,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
