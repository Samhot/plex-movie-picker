import { ClientSecret } from '../domain/ClientSecret';
import { CreateClientSecret } from '../domain/CreateClientSecret';

export interface IClientSecretRepository {
  getClientSecrets(filters: { userId: string }): Promise<ClientSecret | null>;
  saveClientSecret(clientSecret: CreateClientSecret): Promise<ClientSecret>;
}
